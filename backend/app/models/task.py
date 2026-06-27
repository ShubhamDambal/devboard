from app import db
from datetime import datetime, timezone

VALID_STATUSES = ['todo', 'in_progress', 'done']

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='todo')
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    notes = db.relationship('Note', backref='task', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'status': self.status,
            'project_id': self.project_id,
            'created_at': self.created_at.isoformat()
        }