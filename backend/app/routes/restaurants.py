from flask import Blueprint, request, jsonify
import requests
import json
import random
import traceback
from app.utils.auth import login_required
from app.utils.db import execute_query, get_db_connection
from app.config import GOOGLE_MAPS_API_KEY

restaurants_bp = Blueprint('restaurants', __name__)

@restaurants_bp.route('/nearby', methods=['GET'])
# 暫時移除login_required以便測試
# @login_required
def nearby_restaurants():  # 移除user參數
    # 獲取請求參數
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    category = request.args.get('category', '全部')
    radius = request.args.get('radius', 1000, type=int)  # 默認 1000 米內
    
    if not lat or not lng:
        return jsonify({"error": "Missing location parameters"}), 400
    
    # 打印接收到的參數，用於調試
    print(f"接收到附近餐廳請求，參數: lat={lat}, lng={lng}, category={category}, radius={radius}")
    
    # 根據類別設置對應的 Google Place Type
    place_type = "restaurant"
    if category != "全部":
        type_mapping = {
            "小吃": "food",
            "餐廳": "restaurant",
            "甜點": "bakery",
            "咖啡": "cafe"
        }
        place_type = type_mapping.get(category, "restaurant")
    
    # 調用 Google Places API
    places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": place_type,
        "language": "zh-TW",
        "key": GOOGLE_MAPS_API_KEY
    }
    
    try:
        # 打印請求資訊
        print(f"發送請求到 Google Places API: {places_url}")
        print(f"請求參數: {params}")
        
        response = requests.get(places_url, params=params)
        places_data = response.json()
        
        # 打印 API 回應的狀態
        print(f"API 回應狀態: {places_data.get('status')}")
        
        if places_data.get("status") != "OK":
            error_message = places_data.get("error_message", "No detailed error message")
            print(f"Google API error: {places_data.get('status')} - {error_message}")
            return jsonify({"error": f"Google API error: {places_data.get('status')} - {error_message}"}), 500
        
        # 檢查是否有結果
        if not places_data.get("results"):
            print("API 回應中沒有餐廳結果")
            return jsonify([])  # 返回空數組
        
        # 處理結果，獲取詳細資訊
        restaurants = []
        
        # 嘗試連接資料庫
        connection = get_db_connection()
        if not connection:
            print("無法連接到資料庫，使用有限資訊返回")
            # 如果無法連接資料庫，仍然返回基本的餐廳信息
            for place in places_data.get("results", [])[:20]:
                restaurant = {
                    "id": None,  # 沒有資料庫 ID
                    "place_id": place["place_id"],
                    "name": place["name"],
                    "address": place.get("vicinity", ""),
                    "rating": place.get("rating", 0),
                    "user_ratings_total": place.get("user_ratings_total", 0),
                    "is_favorite": False
                }
                
                if place.get("photos"):
                    restaurant["photo_reference"] = place["photos"][0]["photo_reference"]
                
                restaurants.append(restaurant)
            
            return jsonify(restaurants)
        
        # 如果可以連接資料庫，按原計劃處理
        for place in places_data.get("results", [])[:20]:  # 限制返回 20 個結果
            print(f"處理餐廳: {place.get('name')}")
            
            # 嘗試從資料庫查詢該餐廳
            try:
                db_restaurant = execute_query(
                    "SELECT id, place_id FROM restaurants WHERE place_id = %s",
                    (place["place_id"],),
                    fetch_one=True
                )
                
                restaurant_id = None
                
                # 如果資料庫中沒有該餐廳，則保存
                if not db_restaurant:
                    print(f"餐廳 {place.get('name')} 不在資料庫中，插入新記錄")
                    photo_reference = None
                    if place.get("photos"):
                        photo_reference = place["photos"][0]["photo_reference"]
                        
                    insert_query = """
                        INSERT INTO restaurants (
                            place_id, name, address, lat, lng, rating, user_ratings_total, photo_reference
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    # 確保 geometry 和 location 存在
                    if "geometry" in place and "location" in place["geometry"]:
                        lat_val = place["geometry"]["location"].get("lat", 0)
                        lng_val = place["geometry"]["location"].get("lng", 0)
                    else:
                        print(f"警告: 餐廳 {place.get('name')} 缺少地理位置資訊")
                        lat_val = 0
                        lng_val = 0
                    
                    execute_query(
                        insert_query,
                        (
                            place["place_id"],
                            place["name"],
                            place.get("vicinity", ""),
                            lat_val,
                            lng_val,
                            place.get("rating", 0),
                            place.get("user_ratings_total", 0),
                            photo_reference
                        ),
                        commit=True
                    )
                    
                    # 獲取剛插入的餐廳 ID
                    db_restaurant = execute_query(
                        "SELECT id, place_id FROM restaurants WHERE place_id = %s",
                        (place["place_id"],),
                        fetch_one=True
                    )
                
                # 確保 db_restaurant 不是 None
                if db_restaurant:
                    restaurant_id = db_restaurant["id"]
                else:
                    print(f"警告: 無法獲取餐廳 {place.get('name')} 的資料庫 ID")
                    restaurant_id = None
                
                # 由於移除了用戶驗證，設置默認值
                is_favorite = False
                
                # 構建餐廳資料
                restaurant = {
                    "id": restaurant_id,
                    "place_id": place["place_id"],
                    "name": place["name"],
                    "address": place.get("vicinity", ""),
                    "rating": place.get("rating", 0),
                    "user_ratings_total": place.get("user_ratings_total", 0),
                    "is_favorite": is_favorite
                }
                
                # 如果有照片，添加照片引用
                if place.get("photos"):
                    restaurant["photo_reference"] = place["photos"][0]["photo_reference"]
                
                restaurants.append(restaurant)
            except Exception as db_error:
                print(f"處理餐廳 {place.get('name')} 時發生資料庫錯誤: {db_error}")
                # 跳過這個餐廳，繼續處理其他的
                continue
        
        return jsonify(restaurants)
    
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"Error fetching nearby restaurants: {e}")
        print(f"詳細錯誤信息: {error_traceback}")
        return jsonify({"error": f"Failed to fetch restaurants. Details: {str(e)}"}), 500

@restaurants_bp.route('/photo/<photo_reference>', methods=['GET'])
def get_photo(photo_reference):
    if not photo_reference:
        return jsonify({"error": "Photo reference is required"}), 400
    
    max_width = request.args.get('maxwidth', 400, type=int)
    
    # 直接代理 Google Place Photos API
    photo_url = "https://maps.googleapis.com/maps/api/place/photo"
    params = {
        "photoreference": photo_reference,
        "maxwidth": max_width,
        "key": GOOGLE_MAPS_API_KEY
    }
    
    try:
        response = requests.get(photo_url, params=params, stream=True)
        
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch photo"}), response.status_code
        
        # 轉發原始 response
        from flask import Response
        return Response(
            response.raw.read(),
            content_type=response.headers['content-type'],
            status=response.status_code
        )
    
    except Exception as e:
        print(f"Error fetching photo: {e}")
        return jsonify({"error": "Failed to fetch photo"}), 500

@restaurants_bp.route('/<int:restaurant_id>', methods=['GET'])
@login_required
def get_restaurant(user, restaurant_id):
    # 從資料庫獲取餐廳基本資訊
    restaurant = execute_query(
        "SELECT id, place_id, name, address, lat, lng, rating, user_ratings_total, photo_reference FROM restaurants WHERE id = %s",
        (restaurant_id,),
        fetch_one=True
    )
    
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404
    
    # 檢查是否已收藏
    is_favorite = False
    favorite = execute_query(
        "SELECT id FROM favorites WHERE user_id = %s AND restaurant_id = %s",
        (user["id"], restaurant_id),
        fetch_one=True
    )
    
    if favorite:
        is_favorite = True
    
    restaurant["is_favorite"] = is_favorite
    
    # 獲取餐廳詳情（從 Google Place API）
    place_url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": restaurant["place_id"],
        "fields": "formatted_address,formatted_phone_number,opening_hours,website,url,reviews,photos",
        "language": "zh-TW",
        "key": GOOGLE_MAPS_API_KEY
    }
    
    try:
        response = requests.get(place_url, params=params)
        place_data = response.json()
        
        if place_data.get("status") != "OK":
            # 如果無法獲取詳情，仍返回基本信息
            return jsonify(restaurant)
        
        # 添加詳細信息
        result = place_data.get("result", {})
        details = {
            "formatted_address": result.get("formatted_address", ""),
            "formatted_phone_number": result.get("formatted_phone_number", ""),
            "website": result.get("website", ""),
            "url": result.get("url", ""),
        }
        
        # 營業時間
        if "opening_hours" in result:
            details["opening_hours"] = {
                "weekday_text": result["opening_hours"].get("weekday_text", [])
            }
        
        # 評論
        if "reviews" in result:
            details["reviews"] = []
            for review in result["reviews"][:5]:  # 限制 5 則評論
                details["reviews"].append({
                    "author_name": review.get("author_name", ""),
                    "rating": review.get("rating", 0),
                    "relative_time_description": review.get("relative_time_description", ""),
                    "text": review.get("text", "")
                })
        
        # 照片
        if "photos" in result:
            details["photos"] = []
            for photo in result["photos"][:5]:  # 限制 5 張照片
                details["photos"].append({
                    "photo_reference": photo.get("photo_reference", "")
                })
        
        restaurant["details"] = details
        
        return jsonify(restaurant)
    
    except Exception as e:
        print(f"Error fetching restaurant details: {e}")
        # 如果獲取詳情失敗，仍返回基本信息
        return jsonify(restaurant) 