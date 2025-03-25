# 午餐吃什麼？WebApp

## 應用概述

**午餐吃什麼？**是一個幫助用戶決定午餐選擇的 Web 應用程序。它使用 Google Maps API 來查找用戶附近的餐廳，並提供多種功能來幫助用戶選擇最適合他們的餐廳。

## 主要功能

- **基於位置的餐廳顯示**：顯示用戶所選位置附近的餐廳
- **卡片式滑動**：用戶可以左右滑動卡片來收藏或跳過餐廳
- **類別篩選**：可以按餐廳類型進行篩選（全部、小吃、餐廳、甜點、咖啡）
- **收藏列表**：用戶可以查看和管理他們收藏的餐廳
- **從收藏中隨機選擇**：當不確定想吃什麼時，可以從收藏中隨機選擇一家餐廳
- **詳細餐廳信息**：查看餐廳的詳細信息，包括營業時間、評價等
- **一鍵導航**：直接跳轉到 Google Maps 進行導航

## 技術架構

### 前端

- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- React Swipeable

### 後端

- Flask
- MySQL
- JWT 身份驗證
- Google Maps API 整合

## 快速啟動

### 前置條件

- Node.js (v14+)
- Python (v3.9+)
- MySQL

### 環境設置

1. 克隆代碼庫

```bash
git clone https://github.com/junming0106/WhatEatApp.git
cd WhatEatApp
```

2. **使用啟動腳本 (推薦)**

```bash
chmod +x start.sh
./start.sh
```

這個腳本將會:

- 檢查必要的環境設置
- 創建和激活 Python 虛擬環境
- 安裝前後端依賴
- 啟動後端服務 (port 5000)
- 啟動前端開發服務器 (port 5173)

### 手動啟動

1. **後端設置**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 創建 .env 文件
cp .env.example .env
# 編輯 .env 文件，填入 API 密鑰和數據庫設置

# 啟動後端
python app.py
```

2. **前端設置**

```bash
cd frontend
npm install
npm run dev
```

## 數據庫結構

### users 表

- id (INT, PK): 用戶 ID
- name (VARCHAR): 用戶名
- email (VARCHAR): 電子郵件
- password (VARCHAR): 密碼哈希
- created_at (TIMESTAMP): 創建時間
- updated_at (TIMESTAMP): 更新時間

### restaurants 表

- id (INT, PK): 餐廳 ID
- place_id (VARCHAR): Google Place ID
- name (VARCHAR): 餐廳名稱
- address (VARCHAR): 地址
- lat (DOUBLE): 緯度
- lng (DOUBLE): 經度
- rating (FLOAT): 評分
- user_ratings_total (INT): 評分人數
- photo_reference (VARCHAR): Google 照片引用
- created_at (TIMESTAMP): 創建時間
- updated_at (TIMESTAMP): 更新時間

### favorites 表

- id (INT, PK): 收藏 ID
- user_id (INT, FK): 用戶 ID
- restaurant_id (INT, FK): 餐廳 ID
- created_at (TIMESTAMP): 創建時間

## API 接口文檔

### 認證相關

- `POST /api/auth/register`: 註冊新用戶
- `POST /api/auth/login`: 登入
- `POST /api/auth/google`: Google 登入
- `GET /api/auth/me`: 獲取當前用戶信息

### 餐廳相關

- `GET /api/restaurants/nearby`: 獲取附近餐廳
- `GET /api/restaurants/<id>`: 獲取餐廳詳情
- `GET /api/restaurants/photo/<photo_reference>`: 獲取餐廳照片

### 收藏相關

- `GET /api/favorites`: 獲取用戶收藏的餐廳
- `POST /api/favorites`: 添加餐廳到收藏
- `DELETE /api/favorites/<restaurant_id>`: 從收藏中移除餐廳
- `GET /api/favorites/random`: 從收藏中隨機選擇一家餐廳

## 注意事項

- 需要配置 Google Maps API 密鑰和 Google 客戶端 ID 來啟用相關功能
- 請在 `.env` 文件中設置數據庫連接信息

## 授權

MIT License
