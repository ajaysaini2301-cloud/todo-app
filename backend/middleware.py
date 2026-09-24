from functools import wraps
from flask import request, jsonify
from services.auth_service import verify_token

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Login zaroori hai"}), 401

        token = auth_header.split(" ")[1]
        user_id = verify_token(token)
        if not user_id:
            return jsonify({"error": "Session expire ho gaya, dobara login karein"}), 401

        request.user_id = user_id
        return f(*args, **kwargs)
    return decorated