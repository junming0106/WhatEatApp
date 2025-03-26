#!/bin/bash

# 確保node_modules存在
if [ ! -d "node_modules" ]; then
    echo "安裝依賴..."
    npm install
fi

# 啟動開發服務器
echo "啟動前端開發服務器..."
npm run dev 