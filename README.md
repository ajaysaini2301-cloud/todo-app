# Todo List App — Flask + MySQL + React

Chota, simple setup. Koi ORM/SQLAlchemy nahi — backend me raw SQL queries hain (PyMySQL ke through).

## Structure

```
todo-app/
├── backend/
│   ├── app.py          # Flask routes (GET/POST/PUT/DELETE)
│   ├── db.py           # MySQL connection (raw SQL)
│   ├── schema.sql      # Database + table banane ka script
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── AddTodo.jsx
    │   │   ├── TodoList.jsx
    │   │   └── TodoItem.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 1. MySQL Setup

MySQL server chalu hona chahiye. Phir schema run karein:

```bash
mysql -u root -p < backend/schema.sql
```

Ye `todo_app` database aur `todos` table bana dega.

## 2. Backend (Flask) Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# .env file kholkar apna MySQL password daal dein

python app.py
```

Backend `http://localhost:5000` par chalega. API endpoints:

| Method | Route              | Kaam                          |
|--------|---------------------|--------------------------------|
| GET    | /api/todos           | Sab todos list karo            |
| POST   | /api/todos           | Naya todo banao (`{title}`)    |
| PUT    | /api/todos/\<id\>    | Title edit / is_done toggle    |
| DELETE | /api/todos/\<id\>    | Todo delete karo               |

## 3. Frontend (React) Setup

Naye terminal me:

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` par khulega aur backend ko `http://localhost:5000` par call karega.

## Note

- Agar backend ka port ya URL badalna ho, to `frontend/src/App.jsx` me `API_BASE` constant update karein.
- Production ke liye CORS origins aur DB credentials ko sahi se lock karna na bhoolein.
