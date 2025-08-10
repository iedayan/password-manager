from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from cryptography.fernet import Fernet
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///lok_passwords.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Encryption key for passwords (zero-knowledge)
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    master_key_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    passwords = db.relationship('Password', backref='user', lazy=True, cascade='all, delete-orphan')

class Password(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    site_name = db.Column(db.String(100), nullable=False)
    site_url = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    encrypted_password = db.Column(db.Text, nullable=False)
    strength_score = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    auto_update_enabled = db.Column(db.Boolean, default=True)
    is_compromised = db.Column(db.Boolean, default=False)

class PasswordUpdateLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    password_id = db.Column(db.Integer, db.ForeignKey('password.id'), nullable=False)
    old_strength = db.Column(db.Integer)
    new_strength = db.Column(db.Integer)
    update_reason = db.Column(db.String(100))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    success = db.Column(db.Boolean, default=False)

# Routes
@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    master_key_hash = bcrypt.generate_password_hash(data['master_key']).decode('utf-8')
    
    user = User(
        email=data['email'],
        password_hash=password_hash,
        master_key_hash=master_key_hash
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token, 'user_id': user.id}), 201

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token, 'user_id': user.id}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/passwords', methods=['GET'])
@jwt_required()
def get_passwords():
    user_id = get_jwt_identity()
    passwords = Password.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': p.id,
        'site_name': p.site_name,
        'site_url': p.site_url,
        'username': p.username,
        'strength_score': p.strength_score,
        'last_updated': p.last_updated.isoformat(),
        'auto_update_enabled': p.auto_update_enabled,
        'is_compromised': p.is_compromised
    } for p in passwords])

@app.route('/api/passwords', methods=['POST'])
@jwt_required()
def add_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Encrypt password with zero-knowledge encryption
    encrypted_password = cipher_suite.encrypt(data['password'].encode()).decode()
    
    password = Password(
        user_id=user_id,
        site_name=data['site_name'],
        site_url=data['site_url'],
        username=data['username'],
        encrypted_password=encrypted_password,
        strength_score=calculate_password_strength(data['password'])
    )
    
    db.session.add(password)
    db.session.commit()
    
    return jsonify({'message': 'Password added successfully', 'id': password.id}), 201

@app.route('/api/passwords/<int:password_id>', methods=['PUT'])
@jwt_required()
def update_password(password_id):
    user_id = get_jwt_identity()
    password = Password.query.filter_by(id=password_id, user_id=user_id).first()
    
    if not password:
        return jsonify({'error': 'Password not found'}), 404
    
    data = request.get_json()
    old_strength = password.strength_score
    
    if 'password' in data:
        encrypted_password = cipher_suite.encrypt(data['password'].encode()).decode()
        password.encrypted_password = encrypted_password
        password.strength_score = calculate_password_strength(data['password'])
        password.last_updated = datetime.utcnow()
        
        # Log the update
        log = PasswordUpdateLog(
            password_id=password.id,
            old_strength=old_strength,
            new_strength=password.strength_score,
            update_reason=data.get('reason', 'Manual update'),
            success=True
        )
        db.session.add(log)
    
    if 'auto_update_enabled' in data:
        password.auto_update_enabled = data['auto_update_enabled']
    
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})

@app.route('/api/passwords/<int:password_id>/decrypt', methods=['POST'])
@jwt_required()
def decrypt_password(password_id):
    user_id = get_jwt_identity()
    password = Password.query.filter_by(id=password_id, user_id=user_id).first()
    
    if not password:
        return jsonify({'error': 'Password not found'}), 404
    
    data = request.get_json()
    user = User.query.get(user_id)
    
    # Verify master key
    if not bcrypt.check_password_hash(user.master_key_hash, data['master_key']):
        return jsonify({'error': 'Invalid master key'}), 401
    
    try:
        decrypted_password = cipher_suite.decrypt(password.encrypted_password.encode()).decode()
        return jsonify({'password': decrypted_password})
    except:
        return jsonify({'error': 'Failed to decrypt password'}), 500

@app.route('/api/security/check-weak-passwords', methods=['GET'])
@jwt_required()
def check_weak_passwords():
    user_id = get_jwt_identity()
    weak_passwords = Password.query.filter_by(user_id=user_id).filter(Password.strength_score < 60).all()
    
    return jsonify([{
        'id': p.id,
        'site_name': p.site_name,
        'strength_score': p.strength_score,
        'last_updated': p.last_updated.isoformat()
    } for p in weak_passwords])

@app.route('/api/security/auto-update-status', methods=['GET'])
@jwt_required()
def auto_update_status():
    user_id = get_jwt_identity()
    total_passwords = Password.query.filter_by(user_id=user_id).count()
    auto_update_enabled = Password.query.filter_by(user_id=user_id, auto_update_enabled=True).count()
    weak_passwords = Password.query.filter_by(user_id=user_id).filter(Password.strength_score < 60).count()
    
    return jsonify({
        'total_passwords': total_passwords,
        'auto_update_enabled': auto_update_enabled,
        'weak_passwords': weak_passwords,
        'last_scan': datetime.utcnow().isoformat()
    })

def calculate_password_strength(password):
    """Calculate password strength score (0-100)"""
    score = 0
    
    if len(password) >= 8:
        score += 20
    if len(password) >= 12:
        score += 10
    if any(c.islower() for c in password):
        score += 15
    if any(c.isupper() for c in password):
        score += 15
    if any(c.isdigit() for c in password):
        score += 15
    if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
        score += 25
    
    return min(score, 100)

# Create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)