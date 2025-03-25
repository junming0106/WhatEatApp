import mysql.connector
from mysql.connector import Error
from app.config import MYSQL_CONFIG

def get_db_connection():
    """
    創建並返回 MySQL 數據庫連接
    """
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None
        
def execute_query(query, params=None, fetch_all=False, fetch_one=False, commit=False):
    """
    執行 SQL 查詢並返回結果
    
    參數:
    - query: SQL 查詢字符串
    - params: 查詢參數（元組或字典）
    - fetch_all: 是否獲取所有結果
    - fetch_one: 是否獲取單個結果
    - commit: 是否提交事務
    
    返回:
    - 查詢結果或影響的行數
    """
    connection = get_db_connection()
    cursor = None
    result = None
    
    try:
        if connection:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params)
            
            if fetch_all:
                result = cursor.fetchall()
            elif fetch_one:
                result = cursor.fetchone()
            
            if commit:
                connection.commit()
                result = cursor.rowcount
    except Error as e:
        print(f"Error executing query: {e}")
        if commit and connection:
            connection.rollback()
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            
    return result

def create_tables():
    """
    創建初始數據表結構
    """
    # 用戶表
    users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """
    
    # 餐廳表（從 Google Maps 獲取的數據）
    restaurants_table = """
    CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        place_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        lat DOUBLE,
        lng DOUBLE,
        rating FLOAT,
        user_ratings_total INT,
        photo_reference VARCHAR(255),
        cuisines VARCHAR(255),
        price_level INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """
    
    # 收藏表
    favorites_table = """
    CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        restaurant_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        UNIQUE KEY user_restaurant (user_id, restaurant_id)
    );
    """
    
    # 執行創建表
    execute_query(users_table, commit=True)
    execute_query(restaurants_table, commit=True)
    execute_query(favorites_table, commit=True)

# 當模塊直接運行時初始化數據庫
if __name__ == "__main__":
    create_tables()
    print("Database tables created or already exist.") 