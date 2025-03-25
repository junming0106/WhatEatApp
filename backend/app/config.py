import os
from dotenv import load_dotenv

# 加載 .env 文件
load_dotenv()

# 資料庫配置
MYSQL_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'Qw66633358'),
    'database': os.getenv('DB_NAME', 'my_database'),
    'port': int(os.getenv('DB_PORT', '3306'))
}

# 應用配置
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key-here')
JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24  # 24 hours

# Google API 配置
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')

# 其他配置
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',') 