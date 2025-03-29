import React, { useState, useEffect, useCallback } from "react";

// 獲取環境變數
const isDevelopment = import.meta.env.DEV || false;

interface RestaurantImageProps {
  photoReference: string;
  restaurantName: string;
  maxWidth?: number;
  className?: string;
  showDebug?: boolean;
  useRestaurantsAPI?: boolean; // 新增參數，控制是否使用 restaurants API
}

const RestaurantImage: React.FC<RestaurantImageProps> = ({
  photoReference,
  restaurantName,
  maxWidth: propMaxWidth = 400,
  className = "",
  showDebug = isDevelopment,
  useRestaurantsAPI = false, // 預設使用 places API
}) => {
  // 計算實際使用的寬度，基於螢幕大小
  const [responsiveWidth, setResponsiveWidth] = useState(propMaxWidth);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  // 記錄調試信息
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) =>
      [...prev, `${new Date().toLocaleTimeString()}: ${info}`].slice(-5)
    );
  };

  // 監聽視窗大小變化，調整圖片寬度
  useEffect(() => {
    // 初始設置
    const updateWidth = () => {
      const width = window.innerWidth < 640 ? 300 : 600;
      setResponsiveWidth(Math.min(width, propMaxWidth));
    };

    // 首次執行
    updateWidth();

    // 添加監聽
    window.addEventListener("resize", updateWidth);

    // 清理
    return () => window.removeEventListener("resize", updateWidth);
  }, [propMaxWidth]);

  // 重置載入狀態
  const resetLoading = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
    setRetryCount(0);
    setLoadStartTime(null);
    setDebugInfo([]);
  }, []);

  // 檢查是否是完整URL
  const isFullUrl = useCallback((url: string) => {
    return url.startsWith("/api/") || url.startsWith("http");
  }, []);

  // 嘗試使用不同的API載入圖片
  const tryLoadImage = useCallback(
    (photoRef: string, width: number, tryAlternative = false) => {
      setIsLoading(true);
      setLoadStartTime(Date.now());

      // 如果已經是完整的URL路徑，直接使用
      if (isFullUrl(photoRef)) {
        addDebugInfo(`使用完整URL路徑`);
        setImageUrl(photoRef);
        return;
      }

      if (!photoRef || photoRef.length < 5) {
        addDebugInfo(`無效的照片引用: ${photoRef || "空"}`);
        setImageError(true);
        setIsLoading(false);
        return;
      }

      // 根據選擇使用不同的API端點
      let url: string;

      if (useRestaurantsAPI) {
        // 使用 restaurants API
        url = `/api/restaurants/photo/${photoRef}?maxwidth=${width}`;
        addDebugInfo(`使用 restaurants API`);
      } else {
        // 使用 places API
        const apiEndpoint = tryAlternative
          ? `/api/places/photo`
          : `/api/places/cached-photo`;

        const encodedRef = encodeURIComponent(photoRef);
        url = `${apiEndpoint}?photoReference=${encodedRef}&maxwidth=${width}`;

        addDebugInfo(`嘗試載入: ${tryAlternative ? "標準API" : "緩存API"}`);
      }

      // 設置圖片URL
      setImageUrl(url);
    },
    [isFullUrl, useRestaurantsAPI]
  );

  // 當photoReference或responsiveWidth變化時，更新圖片url
  useEffect(() => {
    if (!photoReference) {
      resetLoading();
      return;
    }

    // 重置狀態並載入新圖片
    resetLoading();

    // 如果是完整URL，直接顯示原始信息
    if (isFullUrl(photoReference)) {
      addDebugInfo(`使用完整URL: ${photoReference.substring(0, 15)}...`);
    } else {
      addDebugInfo(`開始載入照片 ID: ${photoReference.substring(0, 8)}...`);
    }

    tryLoadImage(photoReference, responsiveWidth, false);
  }, [photoReference, responsiveWidth, resetLoading, tryLoadImage, isFullUrl]);

  // 使用Base64編碼的簡單灰色圖片當作預設圖片
  const placeholderImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAABGElEQVR4nO3XsQ3CMBAFURV3QH7E9K84UF2Cy1bciZWBmMko7FuNVxsjrE+fnQ+WDXD+2MBAAgEgCIEQBIEQBBaBHqN/ul+PKrbvdyrbvdyrbvdyrbvdyrbvdyrbvdyrbvdyrbvdyrbvdyrbvdyt/ObAdKDCWAkMBIkQkAaiUjQIqi0umAioUrkQiqT+6luV+AFAEXEUVIEQBBIEQBBIEQBIWwQRiBOEAkgSCGIESGMBiAUjGEQBAJEhDwAB0TJf3Ufae7cAAAAASUVORK5CYII=";

  // 處理圖片載入錯誤和重試
  const handleImageError = useCallback(() => {
    const elapsed = loadStartTime ? Date.now() - loadStartTime : 0;
    addDebugInfo(`載入失敗，已用時間: ${elapsed}ms，重試次數: ${retryCount}`);

    // 如果是完整URL，直接標記錯誤
    if (isFullUrl(photoReference)) {
      setImageError(true);
      setIsLoading(false);
      addDebugInfo(`完整URL載入失敗，顯示預設圖片`);
      return;
    }

    // 如果使用 restaurants API，嘗試使用 places API
    if (useRestaurantsAPI && retryCount < 1) {
      setRetryCount((prev) => prev + 1);
      addDebugInfo(`切換到 places API 重試`);
      tryLoadImage(photoReference, responsiveWidth, false);
      return;
    }

    if (retryCount < 1 && photoReference) {
      // 第一次失敗，嘗試使用標準API
      setRetryCount((prev) => prev + 1);
      addDebugInfo(`切換到標準API重試`);
      tryLoadImage(photoReference, responsiveWidth, true);
    } else {
      // 重試失敗或達到最大重試次數
      setImageError(true);
      setIsLoading(false);
      addDebugInfo(`所有嘗試均失敗，顯示預設圖片`);
    }
  }, [
    loadStartTime,
    retryCount,
    photoReference,
    responsiveWidth,
    tryLoadImage,
    isFullUrl,
    useRestaurantsAPI,
  ]);

  // 確保 photoReference 存在
  if (!photoReference || imageError) {
    return (
      <div className="relative">
        <img
          src={placeholderImage}
          alt={`${restaurantName} - 無圖片`}
          className={className}
          style={{ backgroundColor: "#f3f4f6" }}
        />
        {imageError && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center">
            圖片載入失敗
          </div>
        )}

        {/* 調試信息 - 只在允許時顯示 */}
        {showDebug && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 bg-opacity-80 text-white text-xs p-1">
            <p>錯誤信息：</p>
            {debugInfo.map((info, index) => (
              <p key={index} className="text-[10px]">
                {info}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 如果沒有圖片URL或仍在加載中，顯示加載器
  if (!imageUrl) {
    return (
      <div className="relative">
        <img
          src={placeholderImage}
          alt={`${restaurantName} - 加載中`}
          className={className}
          style={{ backgroundColor: "#f3f4f6" }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* 調試信息 - 只在允許時顯示 */}
        {showDebug && (
          <div className="absolute top-0 left-0 right-0 bg-blue-500 bg-opacity-80 text-white text-xs p-1">
            <p>加載中：</p>
            {debugInfo.map((info, index) => (
              <p key={index} className="text-[10px]">
                {info}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={restaurantName}
        className={className}
        onLoad={(e) => {
          const imgElement = e.target as HTMLImageElement;
          const elapsed = loadStartTime ? Date.now() - loadStartTime : 0;
          addDebugInfo(`載入成功，耗時: ${elapsed}ms`);

          // 檢查是否成功載入真實圖片 (有寬度和高度)
          if (imgElement.naturalWidth <= 1 || imgElement.naturalHeight <= 1) {
            addDebugInfo(
              `警告: 圖片尺寸異常 ${imgElement.naturalWidth}x${imgElement.naturalHeight}`
            );
          } else {
            addDebugInfo(
              `圖片尺寸: ${imgElement.naturalWidth}x${imgElement.naturalHeight}`
            );
          }
          setIsLoading(false);
        }}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />

      {/* 調試信息 - 只在允許時顯示 */}
      {showDebug && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 bg-opacity-80 text-white text-xs p-1">
          <p>載入狀態：</p>
          {debugInfo.map((info, index) => (
            <p key={index} className="text-[10px]">
              {info}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantImage;
