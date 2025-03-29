from flask import Blueprint, request, jsonify, Response
import requests
import traceback
import os
import hashlib
from app.config import GOOGLE_MAPS_API_KEY

places_bp = Blueprint('places', __name__)

# 建立快取目錄
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cache')
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

@places_bp.route('/v1-photo', methods=['GET'])
def get_v1_photo():
    """使用 Google Places API v1 新格式獲取照片"""
    try:
        place_id = request.args.get('placeId')
        photo_reference = request.args.get('photoReference')
        max_width = request.args.get('maxwidth', 400, type=int)
        
        if not place_id or not photo_reference:
            return jsonify({"error": "地點ID和照片參考ID都是必需的"}), 400
        
        # 構建 v1 格式的資源名稱
        resource_name = f"places/{place_id}/photos/{photo_reference}/media"
        
        # 使用新版 Places API 獲取照片
        photo_url = f"https://places.googleapis.com/v1/{resource_name}"
        params = {
            "maxWidthPx": max_width,
            "key": GOOGLE_MAPS_API_KEY
        }
        
        # 打印請求信息
        print(f"請求 v1 格式照片: {photo_url}")
        print(f"參數: {params}")
        
        headers = {
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "Content-Type": "application/json"
        }
        
        # 首先獲取照片 URI
        response = requests.get(photo_url, params=params, headers=headers)
        
        # 打印響應信息
        print(f"API響應狀態碼: {response.status_code}")
        print(f"API響應頭: {response.headers}")
        
        if response.status_code != 200:
            print(f"API錯誤響應: {response.text}")
            return jsonify({"error": f"無法獲取照片URI: {response.status_code}"}), response.status_code
        
        # 解析JSON響應獲取照片URI
        data = response.json()
        print(f"API響應資料: {data}")
        
        if "photoUri" not in data:
            return jsonify({"error": "回應中沒有photoUri"}), 500
        
        # 獲取照片URI
        photo_uri = data["photoUri"]
        print(f"照片URI: {photo_uri}")
        
        # 獲取實際照片
        photo_response = requests.get(photo_uri, stream=True)
        
        if photo_response.status_code != 200:
            return jsonify({"error": "無法獲取照片內容"}), photo_response.status_code
        
        # 將照片數據作為二進制內容返回
        return Response(
            photo_response.content,
            content_type=photo_response.headers.get('content-type', 'image/jpeg'),
            headers={
                'Cache-Control': 'public, max-age=86400'  # 快取 24 小時
            }
        )
    
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"獲取 v1 格式照片時出錯: {e}")
        print(f"詳細錯誤信息: {error_traceback}")
        return jsonify({"error": f"獲取照片失敗: {str(e)}"}), 500

@places_bp.route('/test-photo', methods=['GET'])
def test_photo():
    """測試端點，返回一個簡單的測試圖片"""
    try:
        width = request.args.get('width', 400, type=int)
        height = request.args.get('height', 400, type=int)
        color = request.args.get('color', 'blue')
        
        # 生成一個簡單的 SVG 圖片
        svg = f'''<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#{color}80"/>
            <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="white">測試圖片 {width}x{height}</text>
        </svg>'''
        
        return Response(svg, content_type='image/svg+xml')
    except Exception as e:
        print(f"測試照片出錯: {e}")
        return jsonify({"error": "測試照片生成失敗"}), 500

@places_bp.route('/textsearch', methods=['POST'])
def text_search():
    try:
        data = request.json
        text_query = data.get('textQuery')
        fields = data.get('fields', [])
        
        if not text_query:
            return jsonify({'error': '必須提供搜尋字串'}), 400
        
        # 構建字段遮罩
        field_mask = ','.join([f'places.{field}' for field in fields]) if fields else 'places.id,places.location,places.formattedAddress,places.displayName'
        
        # 打印請求資訊以便調試
        print(f"發送請求到 Places API，查詢：{text_query}")
        print(f"字段遮罩：{field_mask}")
        
        # 使用新版 Places API
        response = requests.post(
            'https://places.googleapis.com/v1/places:searchText',
            json={
                'textQuery': text_query,
                'languageCode': 'zh-TW'
            },
            headers={
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': field_mask,
                'Content-Type': 'application/json'
            }
        )
        
        # 打印響應狀態和內容開頭部分
        print(f"API響應狀態碼: {response.status_code}")
        print(f"API響應頭: {response.headers}")
        
        # 檢查響應
        if response.status_code != 200:
            print(f"API錯誤響應: {response.text}")
            return jsonify({'error': f'Google API 錯誤: {response.status_code}', 'details': response.text}), response.status_code
        
        # 解析回應
        data = response.json()
        print(f"API響應資料: {data}")
        
        if 'places' in data and len(data['places']) > 0:
            # 返回第一個地點的資訊
            return jsonify(data['places'][0])
        else:
            return jsonify({'error': '找不到指定的地點'}), 404
            
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"錯誤詳情: {error_traceback}")
        return jsonify({'error': f'搜尋位置時發生錯誤: {str(e)}'}), 500

@places_bp.route('/details', methods=['GET'])
def get_place_details():
    """獲取 Google 地點詳情"""
    try:
        place_id = request.args.get('placeid')
        
        if not place_id:
            return jsonify({"error": "必須提供地點 ID"}), 400
        
        # 打印請求信息
        print(f"獲取地點詳情，place_id: {place_id}")
        
        # 構建 API 請求
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "placeid": place_id,
            "key": GOOGLE_MAPS_API_KEY,
            "fields": "name,formatted_address,photos,rating,user_ratings_total,formatted_phone_number"
        }
        
        # 發送請求
        response = requests.get(url, params=params)
        
        # 打印響應信息
        print(f"API響應狀態碼: {response.status_code}")
        
        if response.status_code != 200:
            print(f"API錯誤響應: {response.text}")
            return jsonify({"error": f"無法獲取地點詳情: {response.status_code}"}), response.status_code
        
        # 解析JSON響應
        data = response.json()
        
        if data.get("status") != "OK":
            error_message = data.get("error_message", "未知錯誤")
            print(f"API錯誤: {error_message}")
            return jsonify({"error": f"Google API錯誤: {error_message}"}), 400
        
        # 返回結果
        return jsonify(data.get("result", {}))
    
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"獲取地點詳情時出錯: {e}")
        print(f"詳細錯誤信息: {error_traceback}")
        return jsonify({"error": f"獲取地點詳情失敗: {str(e)}"}), 500

@places_bp.route('/photo', methods=['GET'])
def get_photo():
    """直接從 Google Places API 獲取照片"""
    try:
        photo_reference = request.args.get('photoReference')
        max_width = request.args.get('maxwidth', 400, type=int)
        
        if not photo_reference:
            return jsonify({"error": "照片參考ID是必需的"}), 400
        
        # 直接從 Google Place Photos API 獲取照片
        photo_url = "https://maps.googleapis.com/maps/api/place/photo"
        params = {
            "maxwidth": max_width,
            "photoreference": photo_reference,
            "key": GOOGLE_MAPS_API_KEY
        }
        
        response = requests.get(photo_url, params=params, stream=True)
        
        if response.status_code != 200:
            return jsonify({"error": "無法獲取照片"}), response.status_code
        
        # 將照片數據作為二進制內容返回
        return Response(
            response.content,
            content_type=response.headers.get('content-type', 'image/jpeg'),
            headers={
                'Cache-Control': 'public, max-age=86400'  # 快取 24 小時
            }
        )
    
    except Exception as e:
        print(f"獲取照片時出錯: {e}")
        return jsonify({"error": "獲取照片失敗"}), 500

@places_bp.route('/cached-photo', methods=['GET'])
def get_cached_photo():
    """帶快取的照片獲取接口"""
    try:
        photo_reference = request.args.get('photoReference')
        max_width = request.args.get('maxwidth', 400, type=int)
        
        if not photo_reference:
            return jsonify({"error": "照片參考ID是必需的"}), 400
        
        # 為照片創建一個緩存鍵
        cache_key = hashlib.md5(f"{photo_reference}_{max_width}".encode()).hexdigest()
        cache_path = os.path.join(CACHE_DIR, f"{cache_key}.jpg")
        
        # 檢查緩存
        if os.path.exists(cache_path):
            print(f"從快取提供照片: {cache_key}")
            with open(cache_path, 'rb') as f:
                cached_image = f.read()
            
            return Response(
                cached_image,
                content_type='image/jpeg',
                headers={
                    'Cache-Control': 'public, max-age=604800'  # 快取 7 天
                }
            )
        
        # 如果沒有快取，從 Google Place Photos API 獲取
        photo_url = "https://maps.googleapis.com/maps/api/place/photo"
        params = {
            "maxwidth": max_width,
            "photoreference": photo_reference,
            "key": GOOGLE_MAPS_API_KEY
        }
        
        response = requests.get(photo_url, params=params, stream=True)
        
        if response.status_code != 200:
            return jsonify({"error": "無法獲取照片"}), response.status_code
        
        # 儲存到快取
        with open(cache_path, 'wb') as f:
            f.write(response.content)
        
        print(f"已快取照片: {cache_key}")
        
        # 將照片數據作為二進制內容返回
        return Response(
            response.content,
            content_type=response.headers.get('content-type', 'image/jpeg'),
            headers={
                'Cache-Control': 'public, max-age=86400'  # 快取 24 小時
            }
        )
    
    except Exception as e:
        print(f"獲取照片時出錯: {e}")
        return jsonify({"error": "獲取照片失敗"}), 500 