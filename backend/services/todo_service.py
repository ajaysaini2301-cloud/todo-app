from db import get_connection

def get_all_todos(user_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM todos WHERE user_id = %s ORDER BY id DESC",
                (user_id,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def create_todo(user_id, title):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO todos (title, is_done, user_id) VALUES (%s, %s, %s)",
                (title, False, user_id)
            )
            new_id = cur.lastrowid
            cur.execute("SELECT * FROM todos WHERE id = %s", (new_id,))
            return cur.fetchone()
    finally:
        conn.close()

def update_todo(user_id, todo_id, is_done):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE todos SET is_done = %s WHERE id = %s AND user_id = %s",
                (is_done, todo_id, user_id)
            )
            cur.execute(
                "SELECT * FROM todos WHERE id = %s AND user_id = %s",
                (todo_id, user_id)
            )
            return cur.fetchone()
    finally:
        conn.close()

def delete_todo(user_id, todo_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM todos WHERE id = %s AND user_id = %s",
                (todo_id, user_id)
            )
            if not cur.fetchone():
                return False
            cur.execute(
                "DELETE FROM todos WHERE id = %s AND user_id = %s",
                (todo_id, user_id)
            )
            return True
    finally:
        conn.close()