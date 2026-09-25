from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_load_demo_and_dashboard_flow():
    # 1. Load demo portfolio data
    res = client.post("/api/v1/imports/load-demo", headers={"X-Demo-User-Id": "test_e2e_user"})
    assert res.status_code == 200
    assert res.json()["status"] == "success"

    # 2. Query Dashboard Summary
    dash_res = client.get("/api/v1/dashboard/summary", headers={"X-Demo-User-Id": "test_e2e_user"})
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert data["total_recurring_count"] >= 5
    assert data["total_monthly_spend"] > 0
    assert data["potential_annual_savings"] > 0
    assert len(data["upcoming_charges"]) > 0

    # 3. Query Recurring Streams
    streams_res = client.get("/api/v1/recurring-streams", headers={"X-Demo-User-Id": "test_e2e_user"})
    assert streams_res.status_code == 200
    streams = streams_res.json()
    assert len(streams) >= 5

    # Check that Netflix is detected with high confidence
    netflix = next((s for s in streams if s["merchant_key"] == "netflix"), None)
    assert netflix is not None
    assert netflix["frequency"] == "monthly"
    assert netflix["confidence_score"] >= 0.8
    assert netflix["annualized_cost_display"] == 499.0 * 12

    # 4. Action: Mark Spotify as Keep
    spotify = next((s for s in streams if s["merchant_key"] == "spotify"), None)
    assert spotify is not None
    dec_res = client.post(
        f"/api/v1/recurring-streams/{spotify['id']}/decision",
        json={"action": "keep", "notes": "Active family plan"},
        headers={"X-Demo-User-Id": "test_e2e_user"}
    )
    assert dec_res.status_code == 200
    assert dec_res.json()["user_status"] == "keep"

    # 5. Cancellation guide for Adobe
    adobe = next((s for s in streams if s["merchant_key"] == "adobe"), None)
    assert adobe is not None
    guide_res = client.get(
        f"/api/v1/cancellation/guide/{adobe['id']}",
        headers={"X-Demo-User-Id": "test_e2e_user"}
    )
    assert guide_res.status_code == 200
    guide = guide_res.json()
    assert "account.adobe.com" in guide["official_url"]
    assert len(guide["methods"]) >= 1

    # 6. Draft Cancellation Email
    email_res = client.post(
        f"/api/v1/cancellation/draft-email/{adobe['id']}",
        json={
            "account_holder_name": "Parthasarathi",
            "account_email_or_id": "partha@example.com",
            "reason": "Switched to free tools"
        },
        headers={"X-Demo-User-Id": "test_e2e_user"}
    )
    assert email_res.status_code == 200
    email_data = email_res.json()
    assert "Cancellation" in email_data["subject"]
    assert "partha@example.com" in email_data["body_text"]
