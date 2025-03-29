import React, { useState } from "react";
import RestaurantImage from "./RestaurantImage";
import axios from "axios";

// 定義更明確的類型來避免 'any'
interface PhotoItem {
  photo_reference: string;
  height?: number;
  width?: number;
}

interface PlaceDetails {
  name: string;
  formatted_address?: string;
  photos?: PhotoItem[];
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  [key: string]: string | number | boolean | PhotoItem[] | undefined;
}

const PhotoTest: React.FC = () => {
  const [photoReference, setPhotoReference] = useState<string>("");
  const [placeId, setPlaceId] = useState<string>("");
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loadingPlaceDetails, setLoadingPlaceDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const clearResults = () => {
    setImageUrl(null);
    setError(null);
    setSuccess(null);
    setDebugInfo("");
  };

  const testPlacesV1PhotoAPI = async () => {
    if (!placeId || !photoReference) {
      setError("地點ID和照片參考ID都是必需的！");
      return;
    }

    clearResults();
    setLoading(true);
    setDebugInfo(`正在測試 Places API V1 照片端點...\n`);
    setDebugInfo((prev) => `${prev}placeId: ${placeId}\n`);
    setDebugInfo((prev) => `${prev}photoReference: ${photoReference}\n`);

    try {
      const url = `/api/places/v1-photo?placeId=${placeId}&photoReference=${photoReference}&maxwidth=400`;
      setDebugInfo((prev) => `${prev}請求 URL: ${url}\n`);

      // 直接設置圖片 URL
      setImageUrl(url);
      setSuccess("已成功設置 v1 照片 API URL");
    } catch (err) {
      console.error("測試照片 API 時出錯:", err);
      setError(`測試失敗: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const testRestaurantsPhotoAPI = async () => {
    if (!photoReference) {
      setError("必須提供照片參考ID！");
      return;
    }

    clearResults();
    setLoading(true);
    setDebugInfo(`正在測試餐廳照片 API...\n`);
    setDebugInfo((prev) => `${prev}photoReference: ${photoReference}\n`);

    try {
      const url = `/api/restaurants/photo/${photoReference}`;
      setDebugInfo((prev) => `${prev}請求 URL: ${url}\n`);

      // 直接設置圖片 URL
      setImageUrl(url);
      setSuccess("已成功設置餐廳照片 API URL");
    } catch (err) {
      console.error("測試照片 API 時出錯:", err);
      setError(`測試失敗: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const testPlacesPhotoAPI = async () => {
    if (!photoReference) {
      setError("必須提供照片參考ID！");
      return;
    }

    clearResults();
    setLoading(true);
    setDebugInfo(`正在測試 Places 照片 API...\n`);
    setDebugInfo((prev) => `${prev}photoReference: ${photoReference}\n`);

    try {
      const url = `/api/places/photo?photoreference=${photoReference}&maxwidth=400`;
      setDebugInfo((prev) => `${prev}請求 URL: ${url}\n`);

      // 直接設置圖片 URL
      setImageUrl(url);
      setSuccess("已成功設置 Places 照片 API URL");
    } catch (err) {
      console.error("測試照片 API 時出錯:", err);
      setError(`測試失敗: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const testCachedPhotoAPI = async () => {
    if (!photoReference) {
      setError("必須提供照片參考ID！");
      return;
    }

    clearResults();
    setLoading(true);
    setDebugInfo(`正在測試快取照片 API...\n`);
    setDebugInfo((prev) => `${prev}photoReference: ${photoReference}\n`);

    try {
      const url = `/api/places/cached-photo?photoreference=${photoReference}&maxwidth=400`;
      setDebugInfo((prev) => `${prev}請求 URL: ${url}\n`);

      // 直接設置圖片 URL
      setImageUrl(url);
      setSuccess("已成功設置快取照片 API URL");
    } catch (err) {
      console.error("測試照片 API 時出錯:", err);
      setError(`測試失敗: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async () => {
    if (!placeId) {
      setError("必須提供地點ID！");
      return;
    }

    setLoadingPlaceDetails(true);
    setError(null);
    setSuccess(null);
    setDebugInfo(`正在獲取地點詳情...\n`);
    setDebugInfo((prev) => `${prev}placeId: ${placeId}\n`);

    try {
      const url = `/api/places/details?placeid=${placeId}`;
      setDebugInfo((prev) => `${prev}請求 URL: ${url}\n`);

      const response = await axios.get(url);
      setDebugInfo((prev) => `${prev}響應狀態: ${response.status}\n`);
      const details = response.data as PlaceDetails;

      setPlaceDetails(details);
      setDebugInfo(
        (prev) =>
          `${prev}獲取地點詳情成功: ${JSON.stringify(details, null, 2)}\n`
      );

      setSuccess("成功獲取地點詳情");

      // 如果有照片，自動選擇第一張照片的參考 ID
      if (details.photos && details.photos.length > 0) {
        const firstPhotoRef = details.photos[0].photo_reference;
        setPhotoReference(firstPhotoRef);
        setDebugInfo(
          (prev) => `${prev}自動選擇第一張照片參考ID: ${firstPhotoRef}\n`
        );
      }
    } catch (err) {
      console.error("獲取地點詳情時出錯:", err);

      setDebugInfo((prev) => `${prev}錯誤類型: ${typeof err}\n`);

      // 檢查錯誤類型並安全地訪問其屬性
      if (err && typeof err === "object") {
        const errorObj = err as Record<string, unknown>;

        setDebugInfo(
          (prev) =>
            `${prev}錯誤訊息: ${
              errorObj.message ? String(errorObj.message) : "未知錯誤"
            }\n`
        );

        // 檢查是否有響應
        if (errorObj.response && typeof errorObj.response === "object") {
          const response = errorObj.response as Record<string, unknown>;
          setDebugInfo(
            (prev) => `${prev}錯誤狀態碼: ${response.status || "未知"}\n`
          );

          if (response.data) {
            try {
              setDebugInfo(
                (prev) =>
                  `${prev}錯誤數據: ${JSON.stringify(response.data, null, 2)}\n`
              );
            } catch (e) {
              setDebugInfo((prev) => `${prev}錯誤數據: [無法序列化]\n`);
            }
          }
        }
        // 檢查是否請求已發送但沒有收到響應
        else if (errorObj.request) {
          setDebugInfo(
            (prev) => `${prev}已發送請求但沒有收到響應，可能是網絡問題\n`
          );
        }
        // 其他錯誤
        else {
          setDebugInfo((prev) => `${prev}請求設置過程中出錯\n`);
        }
      } else {
        setDebugInfo((prev) => `${prev}未知錯誤類型\n`);
      }

      setError(
        `獲取地點詳情失敗: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoadingPlaceDetails(false);
    }
  };

  const testPlaceV1DirectUrl = () => {
    if (!placeId || !photoReference) {
      setError("地點ID和照片參考ID都是必需的！");
      return;
    }

    clearResults();

    const resourceName = `places/${placeId}/photos/${photoReference}/media`;
    const url = `https://places.googleapis.com/v1/${resourceName}?key=YOUR_API_KEY&maxWidthPx=400`;

    setDebugInfo(`Google Places API V1 直接 URL 格式:\n`);
    setDebugInfo((prev) => `${prev}${url}\n`);
    setDebugInfo(
      (prev) => `${prev}注意: 這只是格式示例，您需要替換 YOUR_API_KEY。\n`
    );
    setDebugInfo(
      (prev) =>
        `${prev}實際使用時，建議通過後端代理來發送請求以保護 API 密鑰。\n`
    );

    setSuccess("已生成 Places API V1 URL 格式示例");
  };

  const containerStyle = {
    padding: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
  };

  const paperStyle = {
    padding: "16px",
    marginBottom: "24px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const alertStyle = {
    marginBottom: "16px",
  };

  const buttonStyle = {
    padding: "8px 16px",
    margin: "4px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#1976d2",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc004e",
    color: "white",
  };

  const infoButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#0288d1",
    color: "white",
  };

  const warningButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ff9800",
    color: "white",
  };

  const flexCenterStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "16px 0",
  };

  const debugBoxStyle = {
    padding: "16px",
    marginBottom: "24px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    whiteSpace: "pre-wrap" as const,
    fontSize: "14px",
    overflow: "auto",
    maxHeight: "200px",
  };

  const imageBoxStyle = {
    width: "100%",
    height: "200px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
  };

  const imageStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain" as const,
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "16px" }}>照片 API 測試工具</h2>

      {error && (
        <div
          style={{
            ...alertStyle,
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            padding: "12px",
            borderRadius: "4px",
          }}>
          <strong>錯誤：</strong> {error}
        </div>
      )}

      {success && (
        <div
          style={{
            ...alertStyle,
            backgroundColor: "#e8f5e9",
            color: "#388e3c",
            padding: "12px",
            borderRadius: "4px",
          }}>
          <strong>成功：</strong> {success}
        </div>
      )}

      <div style={paperStyle}>
        <h3 style={{ marginTop: 0 }}>地點詳情獲取</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <input
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              placeholder="輸入 Google 地點 ID"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
            />
          </div>
          <div>
            <button
              style={primaryButtonStyle}
              onClick={fetchPlaceDetails}
              disabled={loadingPlaceDetails || !placeId}>
              {loadingPlaceDetails ? "獲取中..." : "獲取地點詳情"}
            </button>
          </div>
        </div>

        {placeDetails && (
          <div
            style={{
              marginTop: "16px",
              padding: "8px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
            }}>
            <p>
              <strong>地點名稱:</strong> {placeDetails.name}
            </p>
            <p>
              <strong>地址:</strong> {placeDetails.formatted_address}
            </p>
            <p>
              <strong>照片數量:</strong>{" "}
              {placeDetails.photos ? placeDetails.photos.length : 0}
            </p>
          </div>
        )}
      </div>

      <div style={paperStyle}>
        <h3 style={{ marginTop: 0 }}>照片參考 ID</h3>
        <input
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "16px",
          }}
          placeholder="輸入照片參考 ID"
          value={photoReference}
          onChange={(e) => setPhotoReference(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "8px",
          }}>
          <button
            style={primaryButtonStyle}
            onClick={testRestaurantsPhotoAPI}
            disabled={loading || !photoReference}>
            測試餐廳照片 API
          </button>

          <button
            style={secondaryButtonStyle}
            onClick={testPlacesPhotoAPI}
            disabled={loading || !photoReference}>
            測試 Places 照片 API
          </button>

          <button
            style={infoButtonStyle}
            onClick={testCachedPhotoAPI}
            disabled={loading || !photoReference}>
            測試快取照片 API
          </button>

          <button
            style={warningButtonStyle}
            onClick={testPlacesV1PhotoAPI}
            disabled={loading || !photoReference || !placeId}>
            測試 V1 照片 API
          </button>
        </div>

        <button
          style={{
            ...buttonStyle,
            marginTop: "16px",
            backgroundColor: "#f5f5f5",
            color: "#0288d1",
            border: "1px solid #0288d1",
          }}
          onClick={testPlaceV1DirectUrl}
          disabled={!photoReference || !placeId}>
          顯示 V1 API URL 格式
        </button>
      </div>

      {loading && (
        <div style={flexCenterStyle}>
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}></div>
        </div>
      )}

      {debugInfo && (
        <div style={paperStyle}>
          <h3 style={{ marginTop: 0 }}>調試信息</h3>
          <div style={debugBoxStyle}>{debugInfo}</div>
        </div>
      )}

      {imageUrl && (
        <div style={paperStyle}>
          <h3 style={{ marginTop: 0 }}>圖片測試結果</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <h4 style={{ marginTop: 0 }}>直接使用 img 標籤</h4>
              <div style={imageBoxStyle}>
                <img
                  src={imageUrl}
                  alt="測試照片"
                  style={imageStyle}
                  onError={() => setError("圖片載入失敗")}
                  onLoad={() => {
                    setSuccess((prev) => prev || "圖片載入成功");
                    setDebugInfo((prev) => `${prev}圖片成功載入\n`);
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: "250px" }}>
              <h4 style={{ marginTop: 0 }}>使用 RestaurantImage 組件</h4>
              <div style={imageBoxStyle}>
                <RestaurantImage
                  photoReference={photoReference}
                  restaurantName="測試餐廳"
                  maxWidth={400}
                  className="w-full h-full object-contain"
                  useRestaurantsAPI={true}
                  showDebug={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PhotoTest;
