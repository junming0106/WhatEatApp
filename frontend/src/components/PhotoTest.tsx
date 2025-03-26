import React, { useState } from "react";
import RestaurantImage from "./RestaurantImage";

const PhotoTest: React.FC = () => {
  const [photoReference, setPhotoReference] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // 測試圖片URL
  const testPhotoUrl = `/api/places/test-photo?width=400&height=400`;

  // 測試常見照片IDs
  const testPhotoIds = [
    "AWU5eFghvqMzitUgJTpORDdaKH-Z3ynY7zSxV3JUFpIvGAK9fOL1UTpSXBVZq3F8PFqr9KQR69TIFpKYQCPuM1-F2ZBSZrRXR65DuJEgCJm6iLpCQ-k",
    "AcJnMuFo3S_pUJCJ8Pvy-jAa0kOpVaW4iiYRaCGlUlOH8JDA2sZRyOFXcXnYqTZ2xm6uoXf6BbPmL_4nXo6_5fwH9qH_v7GSl9EwzMsm5NRpYGk-HCY",
    "1",
    "123456789",
    "AWU5eFghvqMzitUgJTpORDdaKH-Z3ynY7zSxV3JUFpIvGAK9fOL1UTpSXBVZq3F8PFqr9KQR69TIFpKYQCPuM1-F2ZBSZrRXR65DuJEgCJm6iLpCQ-k",
  ];

  // 測試Google Places照片API
  const testAPI = async () => {
    setStatusMessage("正在測試API連接...");
    try {
      const response = await fetch("/api/places/test-photo");
      if (response.ok) {
        setStatusMessage(`測試成功! 狀態碼: ${response.status}`);
      } else {
        setStatusMessage(`測試失敗! 狀態碼: ${response.status}`);
      }
    } catch (error) {
      setStatusMessage(`測試錯誤: ${error}`);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">照片載入測試頁面</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. 測試後端連接</h2>
        <button
          onClick={testAPI}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          測試後端API
        </button>
        {statusMessage && (
          <p className="mt-2 p-2 bg-gray-100 rounded">{statusMessage}</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. 靜態測試圖片</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">靜態SVG測試圖片</h3>
            <img
              src={testPhotoUrl}
              alt="測試圖片"
              className="w-full h-48 object-cover bg-gray-200"
              onLoad={() => console.log("測試圖片載入成功")}
              onError={() => console.error("測試圖片載入失敗")}
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">占位圖片</h3>
            <img
              src="https://via.placeholder.com/400x200?text=測試圖片"
              alt="占位圖片"
              className="w-full h-48 object-cover bg-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. 測試照片組件</h2>
        <div className="mb-4">
          <input
            type="text"
            value={photoReference}
            onChange={(e) => setPhotoReference(e.target.value)}
            placeholder="輸入photoReference測試"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={() => setPhotoReference("")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2">
            清除
          </button>
          {testPhotoIds.map((id, index) => (
            <button
              key={index}
              onClick={() => setPhotoReference(id)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mr-2 mb-2">
              測試ID {index + 1}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">RestaurantImage組件</h3>
            {photoReference ? (
              <RestaurantImage
                photoReference={photoReference}
                restaurantName="測試餐廳"
                maxWidth={400}
                className="w-full h-48 object-cover bg-gray-200"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500">
                請輸入photoReference或點擊測試按鈕
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium mb-2">直接使用img標籤</h3>
            {photoReference ? (
              <img
                src={`/api/places/photo?photoReference=${photoReference}&maxwidth=400`}
                alt="測試餐廳"
                className="w-full h-48 object-cover bg-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/400x200?text=載入失敗`;
                }}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500">
                請輸入photoReference或點擊測試按鈕
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoTest;
