from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import Config

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "https://devboard-frontend.vercel.app",  # update after Vercel deploy
        "https://*.vercel.app",                  # allows all Vercel preview URLs
    ]}})

    from app.models import User, Project, Task, Note

    from app.routes.auth import auth_bp
    from app.routes.projects import projects_bp
    from app.routes.tasks import tasks_bp
    from app.routes.notes import notes_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(tasks_bp, url_prefix='/api/projects/<int:project_id>/tasks')
    app.register_blueprint(notes_bp, url_prefix='/api/tasks/<int:task_id>/notes')

    @app.route('/')
    def health():
        return {'status': 'DevBoard API is running'}, 200

    return app