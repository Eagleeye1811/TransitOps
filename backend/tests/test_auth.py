def test_login_success(client, seed_minimal):
    resp = client.post("/auth/login", json={"email": "admin@test.in", "password": "Demo@123", "role": "admin"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["user"]["role"] == "admin"
    assert "password" not in body["user"]
    assert "token" in body


def test_login_invalid_role_selector(client, seed_minimal):
    resp = client.post("/auth/login", json={"email": "admin@test.in", "password": "Demo@123", "role": "not_a_role"})
    assert resp.status_code == 400


def test_login_wrong_password(client, seed_minimal):
    resp = client.post("/auth/login", json={"email": "admin@test.in", "password": "wrong", "role": "admin"})
    assert resp.status_code == 401


def test_login_role_mismatch(client, seed_minimal):
    resp = client.post("/auth/login", json={"email": "admin@test.in", "password": "Demo@123", "role": "dispatcher"})
    assert resp.status_code == 403
    assert "does not match the role assigned" in resp.json()["detail"]


def test_unauthenticated_request_rejected(client, seed_minimal):
    resp = client.get("/vehicles")
    assert resp.status_code == 401
