import sqlite3

DB_PATH = "consent.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS consents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        app_id TEXT NOT NULL,
        data_type TEXT NOT NULL,
        purpose TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, app_id, data_type)
    );

    CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        data_type TEXT NOT NULL,
        rule_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        data_type TEXT NOT NULL,
        purpose TEXT NOT NULL,
        decision TEXT NOT NULL,
        reason TEXT,
        explanation TEXT,
        timestamp TEXT DEFAULT (datetime('now'))
    );
    """)
    conn.commit()

    # Seed demo data if consents table is empty
    existing = conn.execute("SELECT COUNT(*) FROM consents").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT OR IGNORE INTO consents (user_id, app_id, data_type, purpose) VALUES (?,?,?,?)",
            [
                ("demo_user", "food_app",   "location",    "delivery"),
                ("demo_user", "health_app", "health_data", "emergency"),
            ]
        )
        conn.executemany(
            "INSERT INTO rules (user_id, data_type, rule_type) VALUES (?,?,?)",
            [
                ("demo_user", "contacts", "block"),
            ]
        )
        conn.commit()

    conn.close()
