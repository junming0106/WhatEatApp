from flask import Flask
from flask_cors import CORS
from app.config import CORS_ORIGINS

def create_app():
    app = Flask(__name__)
    
    # 配置 CORS
    CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})
    
    # 導入並註冊藍圖
    from app.routes.auth import auth_bp
    from app.routes.restaurants import restaurants_bp
    from app.routes.favorites import favorites_bp
    from app.routes.places import places_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(restaurants_bp, url_prefix='/api/restaurants')
    app.register_blueprint(favorites_bp, url_prefix='/api/favorites')
    app.register_blueprint(places_bp, url_prefix='/api/places')
    
    # 註冊錯誤處理
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Not found"}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500
    
    # 測試路由
    @app.route('/api/ping')
    def ping():
        return {"message": "pong"}
    
    return app 