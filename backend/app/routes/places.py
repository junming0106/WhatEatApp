from flask import Blueprint, request, jsonify
import requests
import traceback
from app.config import GOOGLE_MAPS_API_KEY

places_bp = Blueprint('places', __name__)

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