import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """Naya MySQL connection return karta hai. Har request ke liye ek connection kholte hain aur
    kaam khatam hone ke baad close kar dete hain (raw SQL, koi ORM nahi)."""
    kwargs = dict(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "todo_app"),
        cursorclass=DictCursor,
        autocommit=True,
        connect_timeout=10,
    )

    # TiDB Cloud (cloud DB) ke liye SSL zaroori hai. Local MySQL pe DB_SSL set mat karna.
    if os.getenv("DB_SSL", "false").lower() == "true":
        kwargs["ssl"] = {"ca": os.getenv("DB_SSL_CA", "/etc/ssl/certs/ca-certificates.crt")}

    return pymysql.connect(**kwargs)