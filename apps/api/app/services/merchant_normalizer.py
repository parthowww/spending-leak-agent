import re
from typing import Tuple, Optional

# Verified Directory of Popular Recurring Merchants and their Standard Categories
KNOWN_MERCHANTS = [
    # Streaming & Entertainment
    {
        "key": "netflix",
        "name": "Netflix",
        "category": "Streaming & Entertainment",
        "patterns": [r"\bnetflix\b", r"nflx"],
        "stream_type": "subscription"
    },
    {
        "key": "spotify",
        "name": "Spotify",
        "category": "Streaming & Entertainment",
        "patterns": [r"\bspotify\b"],
        "stream_type": "subscription"
    },
    {
        "key": "disney_hotstar",
        "name": "Disney+ Hotstar",
        "category": "Streaming & Entertainment",
        "patterns": [r"\bhotstar\b", r"disney\s*\+?", r"novi digital"],
        "stream_type": "subscription"
    },
    {
        "key": "amazon_prime",
        "name": "Amazon Prime",
        "category": "Streaming & Entertainment",
        "patterns": [r"prime\s*video", r"amzn\s*prime", r"amazon\s*prime", r"prime\s*membership"],
        "stream_type": "subscription"
    },
    {
        "key": "youtube_premium",
        "name": "YouTube Premium",
        "category": "Streaming & Entertainment",
        "patterns": [r"youtube\s*premium", r"google\s*youtube", r"yt\s*premium"],
        "stream_type": "subscription"
    },
    {
        "key": "apple_services",
        "name": "Apple Services",
        "category": "Streaming & Storage",
        "patterns": [r"apple\.com/bill", r"itunes", r"apple\s*services", r"apple\s*music", r"icloud"],
        "stream_type": "subscription"
    },
    {
        "key": "sonyliv",
        "name": "SonyLIV",
        "category": "Streaming & Entertainment",
        "patterns": [r"sonyliv", r"sony\s*liv"],
        "stream_type": "subscription"
    },
    
    # Software & SaaS
    {
        "key": "adobe",
        "name": "Adobe Creative Cloud",
        "category": "Software & SaaS",
        "patterns": [r"\badobe\b", r"adobe\s*systems", r"creative\s*cloud"],
        "stream_type": "subscription"
    },
    {
        "key": "chatgpt_openai",
        "name": "OpenAI ChatGPT",
        "category": "Software & SaaS",
        "patterns": [r"openai", r"chatgpt"],
        "stream_type": "subscription"
    },
    {
        "key": "github",
        "name": "GitHub",
        "category": "Software & SaaS",
        "patterns": [r"\bgithub\b"],
        "stream_type": "subscription"
    },
    {
        "key": "google_one",
        "name": "Google One",
        "category": "Cloud & Storage",
        "patterns": [r"google\s*one", r"google\s*storage", r"google\s*workspace", r"google\s*cloud\s*storage"],
        "stream_type": "subscription"
    },
    {
        "key": "microsoft_365",
        "name": "Microsoft 365",
        "category": "Software & SaaS",
        "patterns": [r"msft\s*\*?", r"microsoft\s*365", r"office\s*365", r"microsoft\s*corporation"],
        "stream_type": "subscription"
    },
    {
        "key": "notion",
        "name": "Notion Labs",
        "category": "Software & SaaS",
        "patterns": [r"\bnotion\b"],
        "stream_type": "subscription"
    },
    {
        "key": "canva",
        "name": "Canva Pro",
        "category": "Software & SaaS",
        "patterns": [r"\bcanva\b"],
        "stream_type": "subscription"
    },
    {
        "key": "figma",
        "name": "Figma",
        "category": "Software & SaaS",
        "patterns": [r"\bfigma\b"],
        "stream_type": "subscription"
    },
    {
        "key": "slack",
        "name": "Slack Technologies",
        "category": "Software & SaaS",
        "patterns": [r"\bslack\b"],
        "stream_type": "subscription"
    },
    
    # Fitness & Health
    {
        "key": "cult_fit",
        "name": "Cult.fit",
        "category": "Fitness & Wellness",
        "patterns": [r"cult\.?fit", r"curefit", r"cultpass"],
        "stream_type": "membership"
    },
    {
        "key": "strava",
        "name": "Strava",
        "category": "Fitness & Wellness",
        "patterns": [r"\bstrava\b"],
        "stream_type": "subscription"
    },
    {
        "key": "gym_generic",
        "name": "Fitness Gym",
        "category": "Fitness & Wellness",
        "patterns": [r"\bgym\b", r"fitness\s*first", r"gold'?s\s*gym"],
        "stream_type": "membership"
    },

    # Utilities & Telecom (Recurring bills, not leak unless duplicate/unwanted)
    {
        "key": "airtel",
        "name": "Airtel Broadband / Postpaid",
        "category": "Telecom & Internet",
        "patterns": [r"\bairtel\b", r"bharti\s*airtel"],
        "stream_type": "recurring_bill"
    },
    {
        "key": "jio",
        "name": "Reliance Jio",
        "category": "Telecom & Internet",
        "patterns": [r"\bjio\b", r"reliance\s*jio"],
        "stream_type": "recurring_bill"
    },
    {
        "key": "electricity_board",
        "name": "Electricity Bill",
        "category": "Utilities",
        "patterns": [r"bescom", r"tata\s*power", r"bses", r"mseb", r"electricity", r"power\s*corp"],
        "stream_type": "recurring_bill"
    },
    {
        "key": "tata_play",
        "name": "Tata Play / DTH",
        "category": "Utilities",
        "patterns": [r"tata\s*play", r"tata\s*sky", r"dth"],
        "stream_type": "recurring_bill"
    },
    {
        "key": "water_gas_utility",
        "name": "Water & Gas Utility",
        "category": "Utilities",
        "patterns": [r"bwssb", r"igl\s*gas", r"mahanagar\s*gas", r"indane", r"hp\s*gas"],
        "stream_type": "recurring_bill"
    },
    
    # Housing & Loans
    {
        "key": "house_rent",
        "name": "House Rent",
        "category": "Housing & Rent",
        "patterns": [r"\brent\b", r"landlord", r"house\s*rent", r"society\s*maintenance"],
        "stream_type": "recurring_bill"
    },
    {
        "key": "emi_loan",
        "name": "EMI / Loan Payment",
        "category": "Financial & Loans",
        "patterns": [r"\bemi\b", r"home\s*loan", r"car\s*loan", r"hdfc\s*bank\s*loan", r"icici\s*loan"],
        "stream_type": "installment"
    },

    # Deliveries & Memberships
    {
        "key": "swiggy_one",
        "name": "Swiggy One",
        "category": "Food & Delivery",
        "patterns": [r"swiggy\s*one", r"swiggy\s*super"],
        "stream_type": "subscription"
    },
    {
        "key": "zomato_gold",
        "name": "Zomato Gold",
        "category": "Food & Delivery",
        "patterns": [r"zomato\s*gold", r"zomato\s*pro"],
        "stream_type": "subscription"
    }
]

# Patterns for stripping noise
PAYMENT_PREFIXES = [
    r"^upi/[\w.-]+/",
    r"^upi/",
    r"^ach\s+",
    r"^pos\s+",
    r"^neft[-\s]+",
    r"^imps[-\s]+",
    r"^rtgs[-\s]+",
    r"^card\s+(?:pmt|payment)\s+",
    r"^tst\*\s*",
    r"^paypal\s*\*\s*",
    r"^billdesk\s*\*\s*",
    r"^razorpay\s*\*\s*",
    r"^paytm\s*\*\s*",
    r"^google\s*\*\s*",
    r"^apple\s*\*\s*",
    r"^amzn\s*mktp\s*",
]

def clean_description(raw_desc: str) -> str:
    """Cleans up raw bank description string by stripping transaction prefixes and noise."""
    if not raw_desc:
        return "Unknown Transaction"
    
    cleaned = raw_desc.strip()
    
    # Lowercase for prefix removal
    for prefix in PAYMENT_PREFIXES:
        cleaned = re.sub(prefix, "", cleaned, flags=re.IGNORECASE).strip()
    
    # Remove long hex or numeric IDs (e.g. UPI ref numbers / 12-digit transaction IDs)
    cleaned = re.sub(r"\b\d{10,}\b", "", cleaned)
    cleaned = re.sub(r"\b[a-f0-9]{16,}\b", "", cleaned, flags=re.IGNORECASE)
    
    # Remove common location/branch suffixes like "MUMBAI IN", "BANGALORE KA", "NEW DELHI", "US*...", etc.
    cleaned = re.sub(r"\b(mumbai|bangalore|bengaluru|delhi|new delhi|hyderabad|pune|chennai|in|us|usa|uk)\b.*$", "", cleaned, flags=re.IGNORECASE)
    
    # Remove asterisks and excessive symbols
    cleaned = re.sub(r"[\*#_]+", " ", cleaned)
    
    # Collapse multiple whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    
    return cleaned if cleaned else raw_desc.strip()


def normalize_merchant(raw_desc: str) -> Tuple[str, str, str, str]:
    """
    Given a raw description, identifies the merchant and returns:
    (canonical_merchant_name, merchant_key, category, stream_type)
    """
    cleaned = clean_description(raw_desc).lower()
    
    # 1. Match against known merchants database
    for entry in KNOWN_MERCHANTS:
        for pat in entry["patterns"]:
            if re.search(pat, cleaned, flags=re.IGNORECASE) or re.search(pat, raw_desc, flags=re.IGNORECASE):
                return (
                    entry["name"],
                    entry["key"],
                    entry["category"],
                    entry["stream_type"]
                )
    
    # 2. Heuristic fallback for uncataloged merchants
    # Take first 2-3 words of cleaned description
    words = [w for w in re.split(r"[\s\-_/]+", clean_description(raw_desc)) if w and len(w) > 1]
    if words:
        candidate = " ".join(words[:3]).title()
        key = re.sub(r"[^a-z0-9]+", "_", candidate.lower()).strip("_")
    else:
        candidate = "Unknown Merchant"
        key = "unknown_merchant"
        
    return (candidate, key, "Other Recurring", "subscription")
