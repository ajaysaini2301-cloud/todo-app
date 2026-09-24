from flask import Blueprint, request, jsonify
from services import todo_service
from middleware import login_required

todo_bp = Blueprint("todo_bp", __name__)

@todo_bp.route("/api/todos", methods=["GET"])
@login_required
def get_todos():
    todos = todo_service.get_all_todos(request.user_id)
    return jsonify(todos)

@todo_bp.route("/api/todos", methods=["POST"])
@login_required
def add_todo():
    data = request.get_json()
    title = data.get("title")
    if not title or not title.strip():
        return jsonify({"error": "title zaroori hai"}), 400
    new_todo = todo_service.create_todo(request.user_id, title.strip())
    return jsonify(new_todo), 201

@todo_bp.route("/api/todos/<int:todo_id>", methods=["PUT"])
@login_required
def update_todo(todo_id):
    data = request.get_json()
    is_done = data.get("is_done")
    updated = todo_service.update_todo(request.user_id, todo_id, is_done)
    if not updated:
        return jsonify({"error": "not found"}), 404
    return jsonify(updated)

@todo_bp.route("/api/todos/<int:todo_id>", methods=["DELETE"])
@login_required
def delete_todo(todo_id):
    success = todo_service.delete_todo(request.user_id, todo_id)
    if not success:
        return jsonify({"error": "not found"}), 404
    return jsonify({"message": "deleted"})