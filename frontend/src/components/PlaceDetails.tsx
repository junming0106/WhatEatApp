import React, { useState, useEffect } from "react";
import RestaurantImage from "./RestaurantImage";

interface PlaceDetailsProps {
  placeId?: string;
}

interface PlaceDetail {
  name: string;
  formatted_address: string;
  place_id: string;
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  website?: string;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ placeId }) => {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) return;

    const fetchPlaceDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/places/details?placeId=${placeId}`);

        if (!response.ok) {
          throw new Error(`獲取地點詳情失敗：${response.status}`);
        }

        const data = await response.json();
        setPlace(data);
      } catch (err: unknown) {
        console.error("獲取地點詳情錯誤:", err);
        const errorMessage =
          err instanceof Error ? err.message : "獲取地點詳情時發生錯誤";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [placeId]);

  // 顯示照片大圖
  const showPhotoModal = (photoReference: string) => {
    const largePhotoUrl = `/api/places/photo?photoReference=${photoReference}&maxwidth=1200&maxheight=900`;
    setSelectedPhotoUrl(largePhotoUrl);
  };

  // 關閉照片大圖模態框
  const closePhotoModal = () => {
    setSelectedPhotoUrl(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <p>錯誤：{error}</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="p-4 bg-gray-50 text-gray-500 rounded-md">
        <p>請選擇一個地點查看詳情</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-2xl font-bold mb-2">{place.name}</h2>
      <p className="text-gray-600 mb-4">{place.formatted_address}</p>

      {place.rating && (
        <p className="mb-2">
          <span className="font-semibold">評分：</span>
          {place.rating} / 5 ({place.user_ratings_total || 0} 則評論)
        </p>
      )}

      {place.formatted_phone_number && (
        <p className="mb-2">
          <span className="font-semibold">電話：</span>
          {place.formatted_phone_number}
        </p>
      )}

      {place.website && (
        <p className="mb-4">
          <span className="font-semibold">網站：</span>
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline">
            {place.website}
          </a>
        </p>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-3">照片:</h3>
        {place.photos && place.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {place.photos.slice(0, 9).map((photo, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={() => showPhotoModal(photo.photo_reference)}>
                <RestaurantImage
                  photoReference={photo.photo_reference}
                  restaurantName={place.name}
                  maxWidth={400}
                  className="w-full h-32 object-cover rounded-md hover:opacity-90 transition"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">無照片可顯示</p>
        )}
      </div>

      {/* 照片大圖模態框 */}
      {selectedPhotoUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4"
          onClick={closePhotoModal}>
          <div className="relative max-w-4xl max-h-screen">
            <img
              src={selectedPhotoUrl}
              alt="地點照片大圖"
              className="max-w-full max-h-screen"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200"
              onClick={closePhotoModal}>
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetails;
