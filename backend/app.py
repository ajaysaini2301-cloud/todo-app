from flask import Flask
from flask_cors import CORS
from routes.todo_routes import todo_bp
from routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(todo_bp)
app.register_blueprint(auth_bp)

if __name__ == "__main__":
    app.run(debug=True)