import jwt
import time
import hashlib
import functools
from flask import request, jsonify, current_app
from app.config import JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES
from app.utils.db import execute_query

def hash_password(password):
    """將密碼進行雜湊加密"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(hashed_password, password):
    """驗證密碼是否正確"""
    return hashed_password == hash_password(password)

def generate_token(user_id):
    """生成 JWT token"""
    payload = {
        'user_id': user_id,
        'exp': int(time.time()) + JWT_ACCESS_TOKEN_EXPIRES,
        'iat': int(time.time())
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

def decode_token(token):
    """解碼 JWT token"""
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
    except jwt.PyJWTError as e:
        print(f"JWT decode error: {e}")
        return None

def get_current_user():
    """從請求中獲取當前用戶ID"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]
    decoded_token = decode_token(token)
    
    if not decoded_token:
        return None
        
    user_id = decoded_token.get('user_id')
    return user_id

def login_required(f):
    """用戶登入檢查裝飾器"""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
            
        # 檢查用戶是否存在
        user = execute_query(
            "SELECT id, name, email FROM users WHERE id = %s", 
            (user_id,), 
            fetch_one=True
        )
        
        if not user:
            return jsonify({"error": "User not found"}), 401
            
        return f(user, *args, **kwargs)
    return decorated 