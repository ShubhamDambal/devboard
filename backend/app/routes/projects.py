from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from app import db
from app.models.project import Project

projects_bp = Blueprint('projects', __name__)


# ─── GET ALL PROJECTS ────────────────────────────────────────
@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(user_id=user_id).order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects]), 200


# ─── CREATE PROJECT ──────────────────────────────────────────
@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name', '').strip()

    if not name:
        return jsonify({'error': 'Project name is required'}), 400

    project = Project(name=name, user_id=user_id)

    db.session.add(project)
    db.session.commit()

    return jsonify(project.to_dict()), 201


# ─── DELETE PROJECT ──────────────────────────────────────────
@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())

    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Ownership check — NEVER skip this
    if project.user_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    db.session.delete(project)
    db.session.commit()

    return jsonify({'message': 'Project deleted'}), 200