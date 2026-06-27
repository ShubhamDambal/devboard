from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.task import Task
from app.models.note import Note

notes_bp = Blueprint('notes', __name__)


# ─── HELPER: verify task ownership through chain ─────────────
def get_task_or_error(task_id, user_id):
    task = Task.query.get(task_id)
    if not task:
        return None, (jsonify({'error': 'Task not found'}), 404)

    # Trace: task → project → user
    if task.project.user_id != user_id:
        return None, (jsonify({'error': 'Forbidden'}), 403)

    return task, None


# ─── GET ALL NOTES ───────────────────────────────────────────
@notes_bp.route('/', methods=['GET'])
@jwt_required()
def get_notes(task_id):
    user_id = int(get_jwt_identity())

    task, error = get_task_or_error(task_id, user_id)
    if error:
        return error

    notes = Note.query.filter_by(task_id=task_id).order_by(Note.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notes]), 200


# ─── CREATE NOTE ─────────────────────────────────────────────
@notes_bp.route('/', methods=['POST'])
@jwt_required()
def create_note(task_id):
    user_id = int(get_jwt_identity())

    task, error = get_task_or_error(task_id, user_id)
    if error:
        return error

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Note content is required'}), 400

    note = Note(content=content, task_id=task_id)

    db.session.add(note)
    db.session.commit()

    return jsonify(note.to_dict()), 201


# ─── DELETE NOTE ─────────────────────────────────────────────
@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(task_id, note_id):
    user_id = int(get_jwt_identity())

    task, error = get_task_or_error(task_id, user_id)
    if error:
        return error

    note = Note.query.get(note_id)
    if not note:
        return jsonify({'error': 'Note not found'}), 404

    # Verify note belongs to this task
    if note.task_id != task_id:
        return jsonify({'error': 'Note does not belong to this task'}), 403

    db.session.delete(note)
    db.session.commit()

    return jsonify({'message': 'Note deleted'}), 200