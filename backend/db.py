import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """Naya MySQL connection return karta hai. Har request ke liye ek connection kholte hain aur
    kaam khatam hone ke baad close kar dete hain (raw SQL, koi ORM nahi)."""
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "todo_app"),
        cursorclass=DictCursor,
        autocommit=True,
    )
