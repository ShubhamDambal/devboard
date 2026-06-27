from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.project import Project
from app.models.task import Task, VALID_STATUSES

tasks_bp = Blueprint('tasks', __name__)


# ─── HELPER: verify project belongs to user ──────────────────
def get_project_or_error(project_id, user_id):
    project = Project.query.get(project_id)
    if not project:
        return None, (jsonify({'error': 'Project not found'}), 404)
    if project.user_id != user_id:
        return None, (jsonify({'error': 'Forbidden'}), 403)
    return project, None


# ─── GET ALL TASKS ───────────────────────────────────────────
@tasks_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks(project_id):
    user_id = int(get_jwt_identity())

    project, error = get_project_or_error(project_id, user_id)
    if error:
        return error

    tasks = Task.query.filter_by(project_id=project_id).order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks]), 200


# ─── CREATE TASK ─────────────────────────────────────────────
@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create_task(project_id):
    user_id = int(get_jwt_identity())

    project, error = get_project_or_error(project_id, user_id)
    if error:
        return error

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Task title is required'}), 400

    task = Task(title=title, project_id=project_id, status='todo')

    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201


# ─── UPDATE TASK STATUS ──────────────────────────────────────
@tasks_bp.route('/<int:task_id>', methods=['PATCH'])
@jwt_required()
def update_task(project_id, task_id):
    user_id = int(get_jwt_identity())

    project, error = get_project_or_error(project_id, user_id)
    if error:
        return error

    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    # Make sure task actually belongs to this project
    if task.project_id != project_id:
        return jsonify({'error': 'Task does not belong to this project'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    new_status = data.get('status', '').strip()
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    if new_status not in VALID_STATUSES:
        return jsonify({'error': f'Status must be one of: {VALID_STATUSES}'}), 400

    task.status = new_status
    db.session.commit()

    return jsonify(task.to_dict()), 200


# ─── DELETE TASK ─────────────────────────────────────────────
@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(project_id, task_id):
    user_id = int(get_jwt_identity())

    project, error = get_project_or_error(project_id, user_id)
    if error:
        return error

    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    if task.project_id != project_id:
        return jsonify({'error': 'Task does not belong to this project'}), 403

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted'}), 200