from app.services.merchant_normalizer import normalize_merchant, clean_description

def test_netflix_normalization():
    name, key, cat, stype = normalize_merchant("UPI/NETFLIX/paytm-netflix@paytm/20260415")
    assert key == "netflix"
    assert "Netflix" in name
    assert cat == "Streaming & Entertainment"
    assert stype == "subscription"

def test_spotify_normalization():
    name, key, cat, stype = normalize_merchant("TST* SPOTIFY AB MUMBAI IN")
    assert key == "spotify"
    assert name == "Spotify"
    assert cat == "Streaming & Entertainment"

def test_adobe_normalization():
    name, key, cat, stype = normalize_merchant("ADOBE SYSTEMS INDIA PVT LTD BANGALORE")
    assert key == "adobe"
    assert "Adobe" in name
    assert cat == "Software & SaaS"

def test_unknown_merchant_fallback():
    name, key, cat, stype = normalize_merchant("LOCAL COFFEE ROASTERS HYDERABAD")
    assert key == "local_coffee_roasters"
    assert "Local Coffee Roasters" in name
    assert cat == "Other Recurring"
