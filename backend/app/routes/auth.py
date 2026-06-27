from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from app import db, bcrypt
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

# ─── REGISTER ────────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # 1. Validate input
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # 2. Hash password
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    # 3. Save to DB
    user = User(name=name, email=email, password_hash=password_hash)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Email already registered'}), 409

    # 4. Return success
    return jsonify({'message': 'Account created successfully', 'user': user.to_dict()}), 201


# ─── LOGIN ───────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # 1. Find user by email
    user = User.query.filter_by(email=email).first()

    # 2. Verify password
    # IMPORTANT: both checks return the same error message on purpose
    # Never tell the attacker whether the email exists or the password is wrong
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # 3. Generate JWT token
    access_token = create_access_token(identity=str(user.id))

    # 4. Return token + user info
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200