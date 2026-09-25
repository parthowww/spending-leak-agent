from typing import Dict, Any, Optional

CANCELLATION_DIRECTORY: Dict[str, Dict[str, Any]] = {
    "netflix": {
        "merchant_name": "Netflix",
        "category": "Streaming & Entertainment",
        "official_url": "https://www.netflix.com/youraccount",
        "methods": [
            {
                "channel": "web",
                "title": "Cancel through Netflix Account Settings",
                "official_url": "https://www.netflix.com/cancelplan",
                "steps": [
                    "Sign in to your account at netflix.com",
                    "Click on your profile icon in the top right corner and select 'Account'",
                    "Under 'Membership & Billing', click the 'Cancel Membership' button",
                    "Click 'Finish Cancellation' to confirm your request"
                ]
            },
            {
                "channel": "upi_autopay",
                "title": "Revoke UPI AutoPay Mandate (India)",
                "official_url": None,
                "steps": [
                    "Open the UPI app used to setup the subscription (Google Pay, PhonePe, Paytm)",
                    "Navigate to 'Profile' > 'Autopay' or 'UPI Mandates'",
                    "Select the active 'Netflix' mandate",
                    "Tap 'Pause' or 'Revoke Mandate' and enter your UPI PIN to permanently stop future auto-debits"
                ]
            }
        ],
        "verification_tip": "You will retain access until the end of your current billing period. Check that no renewed invoice arrives on your next predicted charge date.",
        "email_support_available": False,
        "support_email": None
    },
    "spotify": {
        "merchant_name": "Spotify",
        "category": "Streaming & Entertainment",
        "official_url": "https://www.spotify.com/account/overview/",
        "methods": [
            {
                "channel": "web",
                "title": "Cancel Spotify Premium Web",
                "official_url": "https://www.spotify.com/account/subscription/",
                "steps": [
                    "Log in to spotify.com/account",
                    "Under 'Your plan', click 'Change plan'",
                    "Scroll down to 'Spotify Free' and click 'Cancel Premium'",
                    "Follow the confirmation prompts through to the final confirmation screen"
                ]
            },
            {
                "channel": "app_store",
                "title": "Cancel via Apple App Store (if billed through Apple)",
                "official_url": "https://apps.apple.com/account/subscriptions",
                "steps": [
                    "Open 'Settings' on your iPhone or iPad",
                    "Tap your Name / Apple ID at the top",
                    "Tap 'Subscriptions' and locate 'Spotify'",
                    "Tap 'Cancel Subscription'"
                ]
            }
        ],
        "verification_tip": "Your account switches to Spotify Free at the end of the billing cycle. Saved playlists remain intact.",
        "email_support_available": False,
        "support_email": None
    },
    "adobe": {
        "merchant_name": "Adobe Creative Cloud",
        "category": "Software & SaaS",
        "official_url": "https://account.adobe.com/plans",
        "methods": [
            {
                "channel": "web",
                "title": "Cancel Adobe Creative Cloud Subscription",
                "official_url": "https://account.adobe.com/plans",
                "steps": [
                    "Sign in at account.adobe.com/plans",
                    "Find your active plan and select 'Manage plan'",
                    "Click 'Cancel your plan'",
                    "Select a reason and proceed (Note: watch out for early termination fees on annual plans paid monthly; you can chat with Adobe customer care to waive fees if unsatisfied)"
                ]
            },
            {
                "channel": "email",
                "title": "Adobe Support Chat / Ticket",
                "official_url": "https://helpx.adobe.com/contact.html",
                "steps": [
                    "Go to Adobe Customer Support contact page",
                    "Open live chat and type 'Agent'",
                    "Request immediate cancellation and fee waiver confirmation number"
                ]
            }
        ],
        "verification_tip": "Check your email for the official cancellation confirmation receipt from Adobe and verify cloud storage quota downgrade.",
        "email_support_available": True,
        "support_email": "support@adobe.com"
    },
    "google_one": {
        "merchant_name": "Google One",
        "category": "Cloud & Storage",
        "official_url": "https://one.google.com/settings",
        "methods": [
            {
                "channel": "web",
                "title": "Cancel Google One Membership",
                "official_url": "https://one.google.com/settings",
                "steps": [
                    "Go to one.google.com/settings",
                    "Click 'Cancel membership'",
                    "Confirm by selecting 'Cancel membership' on the Google Play subscription manager screen"
                ]
            },
            {
                "channel": "google_play",
                "title": "Cancel via Google Play Store",
                "official_url": "https://play.google.com/store/account/subscriptions",
                "steps": [
                    "Open Google Play Store app",
                    "Tap your profile icon > 'Payments & subscriptions' > 'Subscriptions'",
                    "Select Google One and tap 'Cancel subscription'"
                ]
            }
        ],
        "verification_tip": "Storage drops to the standard free 15GB after the cycle ends. Ensure your Drive and Gmail usage is within 15GB to avoid email disruption.",
        "email_support_available": False,
        "support_email": None
    },
    "amazon_prime": {
        "merchant_name": "Amazon Prime",
        "category": "Streaming & Entertainment",
        "official_url": "https://www.amazon.in/mc/pipelines/cancellation",
        "methods": [
            {
                "channel": "web",
                "title": "End Prime Membership",
                "official_url": "https://www.amazon.in/mc/pipelines/cancellation",
                "steps": [
                    "Visit Your Account > Prime Membership",
                    "Click 'Manage Membership' > 'End Membership'",
                    "Follow the 3-step confirmation pages to 'Continue to Cancel'",
                    "Select 'End on [Billing Date]' or 'End Now with prorated refund' if offered"
                ]
            }
        ],
        "verification_tip": "Amazon sends an immediate cancellation email. If you have not used Prime benefits in the current billing cycle, a full/partial refund may be issued.",
        "email_support_available": False,
        "support_email": None
    },
    "cult_fit": {
        "merchant_name": "Cult.fit",
        "category": "Fitness & Wellness",
        "official_url": "https://www.cult.fit",
        "methods": [
            {
                "channel": "mobile_app",
                "title": "Cancel / Pause Cultpass via App",
                "official_url": "https://www.cult.fit",
                "steps": [
                    "Open the Cult.fit app on your smartphone",
                    "Tap on Profile (bottom right) > 'Active Packs'",
                    "Select your Cultpass membership",
                    "Tap 'Manage Pack' or 'Pause / Cancel Membership'",
                    "If on auto-renewal, tap 'Manage Auto-Pay' and turn off renewal"
                ]
            },
            {
                "channel": "email",
                "title": "Email Cult.fit Support",
                "official_url": "mailto:hello@cult.fit",
                "steps": [
                    "Send an email from your registered email address to hello@cult.fit",
                    "Provide your registered mobile number and pack details",
                    "Request cancellation of upcoming auto-renewal charges"
                ]
            }
        ],
        "verification_tip": "Ensure you disable any UPI AutoPay or recurring credit card mandate in your banking app as well.",
        "email_support_available": True,
        "support_email": "hello@cult.fit"
    },
    "chatgpt_openai": {
        "merchant_name": "OpenAI ChatGPT Plus",
        "category": "Software & SaaS",
        "official_url": "https://chatgpt.com",
        "methods": [
            {
                "channel": "web",
                "title": "Cancel ChatGPT Plus Subscription",
                "official_url": "https://chatgpt.com/#settings/Subscription",
                "steps": [
                    "Log into chatgpt.com",
                    "Click your profile icon at bottom left and select 'Settings'",
                    "Click 'Subscription'",
                    "Click 'Manage my subscription'",
                    "In the Stripe portal, click 'Cancel plan'"
                ]
            }
        ],
        "verification_tip": "Access to GPT-4o / Plus features remains active until the expiration date of your current billing month.",
        "email_support_available": False,
        "support_email": None
    },
    "github": {
        "merchant_name": "GitHub Pro / Copilot",
        "category": "Software & SaaS",
        "official_url": "https://github.com/settings/billing",
        "methods": [
            {
                "channel": "web",
                "title": "Cancel GitHub Pro / Copilot Subscription",
                "official_url": "https://github.com/settings/billing",
                "steps": [
                    "Navigate to github.com/settings/billing",
                    "Under 'Billing plans', find GitHub Pro or Copilot",
                    "Click 'Edit' > 'Downgrade to Free' or 'Cancel subscription'",
                    "Confirm the downgrade"
                ]
            }
        ],
        "verification_tip": "Public repositories and unlimited private repositories remain intact on the GitHub Free plan.",
        "email_support_available": False,
        "support_email": None
    },
    "disney_hotstar": {
        "merchant_name": "Disney+ Hotstar",
        "category": "Streaming & Entertainment",
        "official_url": "https://www.hotstar.com/in/mypage",
        "methods": [
            {
                "channel": "web",
                "title": "Cancel Disney+ Hotstar Auto-Renewal",
                "official_url": "https://www.hotstar.com/in/mypage",
                "steps": [
                    "Log in at hotstar.com",
                    "Go to 'My Account' or 'Help & Settings'",
                    "Select 'Cancel Membership' and follow the prompt to stop auto-renewal"
                ]
            },
            {
                "channel": "upi_autopay",
                "title": "Cancel UPI AutoPay Mandate",
                "official_url": None,
                "steps": [
                    "Open Google Pay / PhonePe / Paytm",
                    "Open 'Autopay / Mandates'",
                    "Locate 'Disney Hotstar' or 'Novi Digital' and select 'Cancel Mandate'"
                ]
            }
        ],
        "verification_tip": "Hotstar does not offer refunds for remaining days, but access continues until the expiration date.",
        "email_support_available": False,
        "support_email": None
    }
}

def get_cancellation_guide(merchant_key: str, merchant_name: str, category: str) -> Dict[str, Any]:
    """
    Returns verified official cancellation methods for known merchants,
    or generates a safe universal cancellation navigator checklist.
    """
    if merchant_key in CANCELLATION_DIRECTORY:
        guide = CANCELLATION_DIRECTORY[merchant_key]
        return {
            "merchant_key": merchant_key,
            "merchant_name": guide["merchant_name"],
            "category": guide["category"],
            "official_url": guide.get("official_url"),
            "methods": guide["methods"],
            "verification_tip": guide["verification_tip"],
            "email_support_available": guide["email_support_available"],
            "support_email": guide.get("support_email")
        }

    # Universal Safe Cancellation Navigator for uncataloged merchants
    return {
        "merchant_key": merchant_key,
        "merchant_name": merchant_name,
        "category": category,
        "official_url": None,
        "methods": [
            {
                "channel": "web",
                "title": f"Cancel on official {merchant_name} Website / App",
                "official_url": None,
                "steps": [
                    f"Sign in to your official {merchant_name} account online or in their mobile app",
                    "Navigate to 'Account', 'Profile', or 'Billing & Subscription Settings'",
                    "Look for 'Manage Plan', 'Cancel Subscription', or 'Turn off Auto-Renewal'",
                    "Complete all cancellation confirmation screens and save the confirmation number or email receipt"
                ]
            },
            {
                "channel": "upi_or_card",
                "title": "Revoke Auto-Debit / Mandate in Banking or UPI App",
                "official_url": None,
                "steps": [
                    "If billed via UPI (Google Pay, PhonePe, Paytm): Go to 'Settings' > 'UPI Mandates / Autopay' and tap 'Revoke Mandate'",
                    "If billed via Debit/Credit Card: Open your bank's app (HDFC, ICICI, SBI, Chase, etc.), go to 'E-Mandates / Recurring Payments' and revoke authorization",
                    "This guarantees no future recurring transaction can be billed even if the merchant website is unresponsive"
                ]
            },
            {
                "channel": "email",
                "title": "Send Formal Written Cancellation Request",
                "official_url": None,
                "steps": [
                    f"Send a formal written cancellation email to {merchant_name} customer support",
                    "Include your account email, customer ID, and transaction date",
                    "Ask for written confirmation that future billing is terminated"
                ]
            }
        ],
        "verification_tip": "Keep a screenshot of the cancellation confirmation. Monitor your next statement cycle to verify that no new charge appears.",
        "email_support_available": True,
        "support_email": None
    }
