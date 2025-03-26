#!/bin/bash

# 確保緩存目錄存在
mkdir -p ./app/cache/photos

# 判斷使用python還是python3命令
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "使用命令: $PYTHON_CMD 啟動應用..."

# 確保應用停止運行
pkill -f "app.py" || true

# 延遲一秒以確保資源釋放
sleep 1

# 啟動應用
$PYTHON_CMD app.py 