from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)


@app.route("/api/todos", methods=["GET"])
def get_todos():
    """Sabhi todos list karo, sabse naye pehle."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, title, is_done, created_at FROM todos ORDER BY id DESC")
            todos = cur.fetchall()
        return jsonify(todos)
    finally:
        conn.close()


@app.route("/api/todos", methods=["POST"])
def create_todo():
    """Naya todo banao."""
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()

    if not title:
        return jsonify({"error": "Title khali nahi ho sakta"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO todos (title, is_done) VALUES (%s, %s)", (title, False))
            new_id = cur.lastrowid
            cur.execute("SELECT id, title, is_done, created_at FROM todos WHERE id = %s", (new_id,))
            todo = cur.fetchone()
        return jsonify(todo), 201
    finally:
        conn.close()


@app.route("/api/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    """Todo ka title edit karo ya is_done status toggle karo."""
    data = request.get_json(silent=True) or {}

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM todos WHERE id = %s", (todo_id,))
            if not cur.fetchone():
                return jsonify({"error": "Todo nahi mila"}), 404

            if "title" in data:
                title = (data.get("title") or "").strip()
                if not title:
                    return jsonify({"error": "Title khali nahi ho sakta"}), 400
                cur.execute("UPDATE todos SET title = %s WHERE id = %s", (title, todo_id))

            if "is_done" in data:
                cur.execute("UPDATE todos SET is_done = %s WHERE id = %s", (bool(data["is_done"]), todo_id))

            cur.execute("SELECT id, title, is_done, created_at FROM todos WHERE id = %s", (todo_id,))
            todo = cur.fetchone()
        return jsonify(todo)
    finally:
        conn.close()


@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    """Todo delete karo."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM todos WHERE id = %s", (todo_id,))
            if not cur.fetchone():
                return jsonify({"error": "Todo nahi mila"}), 404
            cur.execute("DELETE FROM todos WHERE id = %s", (todo_id,))
        return jsonify({"message": "Delete ho gaya"})
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
