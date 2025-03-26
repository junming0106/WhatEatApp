import React, { useState } from "react";
import PlaceSearch from "../components/PlaceSearch";
import PlaceDetails from "../components/PlaceDetails";

const PlaceExplorerPage: React.FC = () => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>(
    undefined
  );

  const handlePlaceSelect = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">地點探索</h1>

      <div className="mb-6">
        <PlaceSearch onPlaceSelect={handlePlaceSelect} />
      </div>

      {selectedPlaceId ? (
        <PlaceDetails placeId={selectedPlaceId} />
      ) : (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <h3 className="text-xl font-medium text-gray-600">
            搜尋並選擇一個地點查看詳情
          </h3>
          <p className="mt-2 text-gray-500">
            輸入地點名稱、地址或關鍵字開始搜尋
          </p>
        </div>
      )}
    </div>
  );
};

export default PlaceExplorerPage;
