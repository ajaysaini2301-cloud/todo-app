import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from db import get_connection

SECRET_KEY = os.getenv("JWT_SECRET", "change-this-secret-in-env")

def create_user(name, email, password):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return None, "Email pehle se registered hai"

            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
            cur.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (name, email, hashed.decode())
            )
            user_id = cur.lastrowid
            return {"id": user_id, "name": name, "email": email}, None
    finally:
        conn.close()

def authenticate_user(email, password):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            if not user:
                return None, "Email ya password galat hai"
            if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
                return None, "Email ya password galat hai"
            return user, None
    finally:
        conn.close()

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None