import httpx
import json
from typing import Dict, Any, Optional, List
from app.config import settings

class AIExplainer:
    """
    Assists with natural language explanations, email drafting, and spending summaries.
    Strictly constrained:
    - Never calculates money or alters mathematical facts.
    - Never invents cancellation URLs.
    - Never makes decisions on behalf of the user.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    async def _call_gemini(self, prompt: str, system_instruction: str) -> Optional[str]:
        if not self.api_key:
            return None
        
        url = f"{self.endpoint}?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 600
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
        except Exception as e:
            # Fallback smoothly to deterministic templates on network/key issues
            pass
        return None

    async def explain_stream(self, stream_data: Dict[str, Any]) -> str:
        """Generates a calm, transparent natural-language explanation of a detected stream."""
        merchant = stream_data.get("merchant_name", "Merchant")
        cadence = stream_data.get("frequency", "monthly")
        occurrences = stream_data.get("occurrence_count", 0)
        currency = stream_data.get("currency_code", "INR")
        curr_sym = "₹" if currency == "INR" else "$"
        amt = stream_data.get("amount_minor", 0) / 100.0
        annual = stream_data.get("annualized_cost_minor", 0) / 100.0
        category = stream_data.get("category", "Services")
        confidence = int(stream_data.get("confidence_score", 0.8) * 100)

        system_instruction = (
            "You are Spending-Leak Agent's financial explanation assistant. "
            "Explain why this recurring payment was detected in a calm, clear, 2-3 sentence tone. "
            "Never invent numbers or claim the user doesn't use the service. "
            "Emphasize the annual cost impact so the user can make an informed decision."
        )
        prompt = (
            f"Merchant: {merchant} ({category})\n"
            f"Cadence: {cadence}\n"
            f"Occurrences detected: {occurrences}\n"
            f"Amount: {curr_sym}{amt:.2f} per cycle\n"
            f"Estimated annual spend: {curr_sym}{annual:.2f}\n"
            f"Detection confidence: {confidence}%\n"
            f"Explain clearly what was detected and advise reviewing before the next billing cycle."
        )

        llm_result = await self._call_gemini(prompt, system_instruction)
        if llm_result:
            return llm_result

        # High-quality fallback template
        return (
            f"We detected {occurrences} regular {cadence} charges from {merchant} averaging {curr_sym}{amt:.2f}, "
            f"totaling approximately {curr_sym}{annual:.2f} per year. "
            f"This matches typical {category.lower()} patterns with {confidence}% confidence. "
            f"Review this subscription before your next renewal if you are no longer actively using it."
        )

    async def draft_cancellation_email(
        self,
        merchant_name: str,
        customer_name: str,
        account_email_or_id: str,
        reason: str
    ) -> Dict[str, str]:
        """Drafts a polite, formal cancellation notice for the user to copy or send."""
        system_instruction = (
            "You are a professional consumer advocate assistant. "
            "Draft a concise, polite, and unambiguous subscription cancellation email. "
            "Request explicit written confirmation that the recurring billing has been stopped. "
            "Do not ask for confidential passwords, OTPs, or full card numbers."
        )
        prompt = (
            f"Merchant: {merchant_name}\n"
            f"Customer Name: {customer_name}\n"
            f"Account identifier / email: {account_email_or_id}\n"
            f"Reason for cancellation: {reason}\n"
            f"Return JSON format with 'subject' and 'body_text'."
        )

        llm_result = await self._call_gemini(prompt, system_instruction)
        if llm_result:
            try:
                # Extract JSON if wrapped in markdown
                cleaned = llm_result
                if "```json" in cleaned:
                    cleaned = cleaned.split("```json")[1].split("```")[0].strip()
                elif "```" in cleaned:
                    cleaned = cleaned.split("```")[1].split("```")[0].strip()
                parsed = json.loads(cleaned)
                if "subject" in parsed and "body_text" in parsed:
                    return parsed
            except Exception:
                pass

        # Standard reliable template
        subject = f"Notice of Subscription Cancellation - {merchant_name} (Account: {account_email_or_id})"
        body = (
            f"Dear {merchant_name} Support Team,\n\n"
            f"I am writing to formally request the immediate cancellation of my recurring subscription "
            f"associated with this account.\n\n"
            f"Account Details:\n"
            f"• Full Name: {customer_name}\n"
            f"• Registered Email / ID: {account_email_or_id}\n"
            f"• Reason: {reason}\n\n"
            f"Please ensure that all future auto-debits, recurring credit card charges, and UPI mandates "
            f"are permanently discontinued. Kindly reply to this email confirming the effective cancellation date.\n\n"
            f"Thank you for your assistance.\n\n"
            f"Sincerely,\n"
            f"{customer_name}"
        )
        return {"subject": subject, "body_text": body}

    async def summarize_spending(
        self,
        total_monthly: float,
        total_annual: float,
        potential_savings: float,
        stream_count: int,
        categories: List[Dict[str, Any]],
        currency: str = "INR"
    ) -> str:
        """Produces a holistic high-level briefing of recurring spending leaks and potential savings."""
        curr_sym = "₹" if currency == "INR" else "$"
        cat_summary = ", ".join([f"{c['category']}: {curr_sym}{c['monthly_spend']:.0f}/mo" for c in categories[:4]])

        system_instruction = (
            "You are Spending-Leak Agent's financial executive assistant. "
            "Write a calm, encouraging 3-sentence summary of the user's recurring expenses. "
            "Highlight the potential annual savings if flagged subscriptions are cancelled. "
            "Never sound alarmist; encourage proactive review."
        )
        prompt = (
            f"Total monthly recurring spend: {curr_sym}{total_monthly:.2f}\n"
            f"Estimated total annual spend: {curr_sym}{total_annual:.2f}\n"
            f"Potential annual savings flagged: {curr_sym}{potential_savings:.2f}\n"
            f"Active recurring subscriptions count: {stream_count}\n"
            f"Top categories: {cat_summary}\n"
        )

        llm_result = await self._call_gemini(prompt, system_instruction)
        if llm_result:
            return llm_result

        return (
            f"You currently have {stream_count} active recurring charges totaling {curr_sym}{total_monthly:,.2f}/month "
            f"({curr_sym}{total_annual:,.2f} annually). Reviewing your flagged subscriptions could immediately save you up to "
            f"{curr_sym}{potential_savings:,.2f} per year. Your highest recurring categories are currently {cat_summary}."
        )
