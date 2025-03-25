#!/bin/bash

# 顏色編碼
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}      午餐吃什麼？啟動腳本       ${NC}"
echo -e "${BLUE}=========================================${NC}"

# 檢查是否有 .env 文件
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}找不到 backend/.env 文件${NC}"
    echo -e "${BLUE}正在從範例文件創建...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}創建成功！請檢查 backend/.env 並更新您的配置${NC}"
fi

# 啟動後端
echo -e "${BLUE}正在啟動後端服務...${NC}"
cd backend
python3 -m venv venv || python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}後端服務已啟動！ (PID: $BACKEND_PID)${NC}"

# 暫停一下確保後端已經啟動
sleep 2

# 啟動前端
echo -e "${BLUE}正在啟動前端服務...${NC}"
cd frontend
rm -rf node_modules/.vite
npm run build
npm run dev
npm install -D tailwindcss postcss autoprefixer
npm install
npx tailwindcss init -p
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}前端服務已啟動！ (PID: $FRONTEND_PID)${NC}"

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}所有服務已啟動！${NC}"
echo -e "${GREEN}前端地址: http://localhost:5173${NC}"
echo -e "${GREEN}後端地址: http://localhost:5000${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${RED}按 Ctrl+C 停止所有服務${NC}"

# 等待用戶按 Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 

cd frontend
touch src/TestComponent.tsx 