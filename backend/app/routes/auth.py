from flask import Blueprint, request, jsonify
from app.utils.auth import hash_password, verify_password, generate_token, login_required
from app.utils.db import execute_query
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.config import GOOGLE_CLIENT_ID

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({"error": "Missing required fields"}), 400
    
    # 檢查郵件是否已存在
    existing_user = execute_query(
        "SELECT id FROM users WHERE email = %s",
        (data['email'],),
        fetch_one=True
    )
    
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409
        
    # 創建新用戶
    hashed_password = hash_password(data['password'])
    query = """
        INSERT INTO users (name, email, password)
        VALUES (%s, %s, %s)
    """
    execute_query(query, (data['name'], data['email'], hashed_password), commit=True)
    
    # 獲取新用戶信息
    user = execute_query(
        "SELECT id, name, email FROM users WHERE email = %s",
        (data['email'],),
        fetch_one=True
    )
    
    # 生成 token
    token = generate_token(user['id'])
    
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": user
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({"error": "Missing email or password"}), 400
    
    # 查詢用戶
    user = execute_query(
        "SELECT id, name, email, password FROM users WHERE email = %s",
        (data['email'],),
        fetch_one=True
    )
    
    if not user or not verify_password(user['password'], data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # 生成 token
    token = generate_token(user['id'])
    
    # 移除密碼欄位
    user.pop('password', None)
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_login():
    token = request.json.get('token')
    if not token:
        return jsonify({"error": "Missing token"}), 400
    
    try:
        # 驗證 Google token
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), GOOGLE_CLIENT_ID)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return jsonify({"error": "Wrong issuer"}), 401
        
        # 檢查用戶是否已存在
        email = idinfo['email']
        user = execute_query(
            "SELECT id, name, email FROM users WHERE email = %s",
            (email,),
            fetch_one=True
        )
        
        if not user:
            # 創建新用戶
            query = """
                INSERT INTO users (name, email)
                VALUES (%s, %s)
            """
            execute_query(query, (idinfo['name'], email), commit=True)
            
            # 獲取新用戶信息
            user = execute_query(
                "SELECT id, name, email FROM users WHERE email = %s",
                (email,),
                fetch_one=True
            )
        
        # 生成 token
        token = generate_token(user['id'])
        
        return jsonify({
            "message": "Google login successful",
            "token": token,
            "user": user
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_me(user):
    return jsonify(user), 200

# 臨時測試路由，僅用於測試
@auth_bp.route('/test_token', methods=['GET'])
def test_token():
    try:
        # 獲取第一個用戶的ID
        user = execute_query("SELECT id FROM users LIMIT 1", fetch_one=True)
        
        if not user:
            return jsonify({"error": "No users found"}), 404
            
        # 生成token
        token = generate_token(user['id'])
        
        return jsonify({
            "message": "Test token generated",
            "token": token
        })
    except Exception as e:
        print(f"Error generating test token: {e}")
        return jsonify({"error": "Failed to generate test token"}), 500 