import os
from groq import Groq

def explain_decision(decision: str, reason: str, app_id: str, data_type: str) -> str:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return reason  # fallback if no key set

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{
                "role": "system",
                "content": "You explain data consent decisions in plain language for non-technical users. Be brief, clear, and friendly. Maximum 25 words."
            }, {
                "role": "user",
                "content": f"Decision: {decision}. App: {app_id}. Data requested: {data_type}. Reason: {reason}. Explain this."
            }],
            max_tokens=60,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return reason  # always fallback gracefully
