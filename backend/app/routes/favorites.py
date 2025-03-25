from flask import Blueprint, request, jsonify
import random
from app.utils.auth import login_required
from app.utils.db import execute_query

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route('', methods=['GET'])
@login_required
def get_favorites(user):
    """獲取用戶收藏的餐廳列表"""
    try:
        # 聯合查詢用戶收藏的餐廳資訊
        query = """
            SELECT r.id, r.place_id, r.name, r.address, r.rating, r.user_ratings_total, 
                   r.photo_reference, f.id as favorite_id
            FROM restaurants r
            JOIN favorites f ON r.id = f.restaurant_id
            WHERE f.user_id = %s
            ORDER BY f.created_at DESC
        """
        
        favorites = execute_query(query, (user['id'],), fetch_all=True)
        
        # 格式化返回資料
        result = []
        for fav in favorites:
            result.append({
                'id': fav['id'],
                'place_id': fav['place_id'],
                'name': fav['name'],
                'address': fav['address'],
                'rating': fav['rating'],
                'user_ratings_total': fav['user_ratings_total'],
                'photo_reference': fav['photo_reference'],
                'is_favorite': True,
                'favorite_id': fav['favorite_id']
            })
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error fetching favorites: {e}")
        return jsonify({"error": "Failed to fetch favorites"}), 500

@favorites_bp.route('', methods=['POST'])
@login_required
def add_favorite(user):
    """將餐廳添加到收藏"""
    data = request.json
    if not data or 'restaurant_id' not in data:
        return jsonify({"error": "Missing restaurant_id"}), 400
    
    restaurant_id = data['restaurant_id']
    
    try:
        # 檢查餐廳是否存在
        restaurant = execute_query(
            "SELECT id FROM restaurants WHERE id = %s",
            (restaurant_id,),
            fetch_one=True
        )
        
        if not restaurant:
            return jsonify({"error": "Restaurant not found"}), 404
        
        # 檢查是否已經收藏
        existing = execute_query(
            "SELECT id FROM favorites WHERE user_id = %s AND restaurant_id = %s",
            (user['id'], restaurant_id),
            fetch_one=True
        )
        
        if existing:
            return jsonify({"message": "Restaurant already in favorites"}), 200
        
        # 新增收藏記錄
        execute_query(
            "INSERT INTO favorites (user_id, restaurant_id) VALUES (%s, %s)",
            (user['id'], restaurant_id),
            commit=True
        )
        
        return jsonify({"message": "Restaurant added to favorites"}), 201
    
    except Exception as e:
        print(f"Error adding favorite: {e}")
        return jsonify({"error": "Failed to add favorite"}), 500

@favorites_bp.route('/<int:restaurant_id>', methods=['DELETE'])
@login_required
def remove_favorite(user, restaurant_id):
    """從收藏中移除餐廳"""
    try:
        # 檢查是否已收藏
        existing = execute_query(
            "SELECT id FROM favorites WHERE user_id = %s AND restaurant_id = %s",
            (user['id'], restaurant_id),
            fetch_one=True
        )
        
        if not existing:
            return jsonify({"error": "Restaurant not in favorites"}), 404
        
        # 刪除收藏記錄
        execute_query(
            "DELETE FROM favorites WHERE user_id = %s AND restaurant_id = %s",
            (user['id'], restaurant_id),
            commit=True
        )
        
        return jsonify({"message": "Restaurant removed from favorites"}), 200
    
    except Exception as e:
        print(f"Error removing favorite: {e}")
        return jsonify({"error": "Failed to remove favorite"}), 500

@favorites_bp.route('/random', methods=['GET'])
@login_required
def get_random_favorite(user):
    """隨機獲取一個收藏的餐廳"""
    try:
        # 獲取用戶所有收藏
        query = """
            SELECT r.id, r.place_id, r.name, r.address, r.rating, r.user_ratings_total, 
                   r.photo_reference
            FROM restaurants r
            JOIN favorites f ON r.id = f.restaurant_id
            WHERE f.user_id = %s
        """
        
        favorites = execute_query(query, (user['id'],), fetch_all=True)
        
        if not favorites:
            return jsonify({"error": "No favorites found"}), 404
        
        # 隨機選擇一個
        random_favorite = random.choice(favorites)
        
        # 返回隨機選擇的餐廳
        result = {
            'id': random_favorite['id'],
            'place_id': random_favorite['place_id'],
            'name': random_favorite['name'],
            'address': random_favorite['address'],
            'rating': random_favorite['rating'],
            'user_ratings_total': random_favorite['user_ratings_total'],
            'photo_reference': random_favorite['photo_reference'],
            'is_favorite': True
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error getting random favorite: {e}")
        return jsonify({"error": "Failed to get random favorite"}), 500 