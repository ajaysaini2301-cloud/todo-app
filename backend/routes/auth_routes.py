from flask import Blueprint, request, jsonify
from services import auth_service

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Sabhi fields zaroori hain"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password kam se kam 6 characters ka ho"}), 400

    user, error = auth_service.create_user(name, email, password)
    if error:
        return jsonify({"error": error}), 400

    token = auth_service.generate_token(user["id"])
    return jsonify({"token": token, "user": user}), 201

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user, error = auth_service.authenticate_user(email, password)
    if error:
        return jsonify({"error": error}), 401

    token = auth_service.generate_token(user["id"])
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
    })