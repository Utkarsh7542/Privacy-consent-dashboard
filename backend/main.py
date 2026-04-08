from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_conn, init_db
from ai import explain_decision
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Consent Control Layer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()


# ---------- Models ----------

class ValidateRequest(BaseModel):
    user_id: str
    app_id: str
    data_type: str
    purpose: str

class ConsentCreate(BaseModel):
    user_id: str
    app_id: str
    data_type: str
    purpose: str

class RuleCreate(BaseModel):
    user_id: str
    data_type: str
    rule_type: str  # 'block' or 'allow'


# ---------- Validate ----------

@app.post("/validate")
def validate(req: ValidateRequest):
    conn = get_conn()

    # Step 1: consent exists?
    consent = conn.execute(
        "SELECT * FROM consents WHERE user_id=? AND app_id=? AND data_type=? AND status='active'",
        (req.user_id, req.app_id, req.data_type)
    ).fetchone()

    if not consent:
        decision = "deny"
        reason = f"No active consent found for '{req.data_type}' from '{req.app_id}'"

    # Step 2: blocked by a user rule?
    elif conn.execute(
        "SELECT 1 FROM rules WHERE user_id=? AND (data_type=? OR data_type='*') AND rule_type='block'",
        (req.user_id, req.data_type)
    ).fetchone():
        decision = "deny"
        reason = f"Blocked by your privacy rule for '{req.data_type}'"

    # Step 3: purpose mismatch?
    elif consent["purpose"] != req.purpose:
        decision = "flag"
        reason = f"Purpose mismatch — you consented for '{consent['purpose']}', app asked for '{req.purpose}'"

    else:
        decision = "allow"
        reason = f"Request matches your consent for '{req.data_type}'"

    explanation = explain_decision(decision, reason, req.app_id, req.data_type)

    conn.execute(
        "INSERT INTO audit_log (app_id, user_id, data_type, purpose, decision, reason, explanation) VALUES (?,?,?,?,?,?,?)",
        (req.app_id, req.user_id, req.data_type, req.purpose, decision, reason, explanation)
    )
    conn.commit()
    conn.close()

    return {
        "decision": decision,
        "reason": reason,
        "explanation": explanation
    }


# ---------- Consents ----------

@app.get("/consents/{user_id}")
def get_consents(user_id: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM consents WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/consents")
def add_consent(data: ConsentCreate):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO consents (user_id, app_id, data_type, purpose) VALUES (?,?,?,?)",
            (data.user_id, data.app_id, data.data_type, data.purpose)
        )
        conn.commit()
    except Exception:
        conn.close()
        raise HTTPException(status_code=400, detail="Consent already exists for this app + data type")
    conn.close()
    return {"status": "created"}

@app.delete("/consents/{consent_id}")
def revoke_consent(consent_id: int):
    conn = get_conn()
    conn.execute("UPDATE consents SET status='revoked' WHERE id=?", (consent_id,))
    conn.commit()
    conn.close()
    return {"status": "revoked"}


# ---------- Rules ----------

@app.get("/rules/{user_id}")
def get_rules(user_id: str):
    conn = get_conn()
    rows = conn.execute("SELECT * FROM rules WHERE user_id=?", (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/rules")
def add_rule(data: RuleCreate):
    conn = get_conn()
    conn.execute(
        "INSERT INTO rules (user_id, data_type, rule_type) VALUES (?,?,?)",
        (data.user_id, data.data_type, data.rule_type)
    )
    conn.commit()
    conn.close()
    return {"status": "created"}

@app.delete("/rules/{rule_id}")
def delete_rule(rule_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM rules WHERE id=?", (rule_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}


# ---------- Audit Log ----------

@app.get("/audit/{user_id}")
def get_audit(user_id: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM audit_log WHERE user_id=? ORDER BY timestamp DESC LIMIT 30",
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
