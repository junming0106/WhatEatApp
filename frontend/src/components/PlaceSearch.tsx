import React, { useState } from "react";

interface PlaceSearchProps {
  onPlaceSelect: (placeId: string) => void;
}

interface PlaceResult {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ onPlaceSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("請輸入搜尋關鍵字");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/places/textsearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textQuery: searchTerm,
          fields: ["id", "displayName", "formattedAddress", "photos"],
        }),
      });

      if (!response.ok) {
        throw new Error(`搜尋失敗：${response.status}`);
      }

      const data = await response.json();

      // 檢查回應格式，因為新版 Google Places API 的回應可能有不同結構
      if (data.error) {
        throw new Error(data.error);
      }

      // 如果是單一結果（非陣列）
      if (data.id) {
        setSearchResults([data]);
      }
      // 如果是結果陣列
      else if (Array.isArray(data.places)) {
        setSearchResults(data.places);
      }
      // 其他可能的格式
      else {
        setSearchResults([]);
        console.warn("未預期的回應格式：", data);
      }
    } catch (err) {
      console.error("搜尋錯誤:", err);
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? String(err.message)
          : "搜尋時發生錯誤"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="輸入地點名稱或地址..."
          className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-r hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-400">
          {loading ? "搜尋中..." : "搜尋"}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {searchResults.length > 0 ? (
        <div className="rounded-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <h3 className="font-medium">搜尋結果</h3>
          </div>
          <ul>
            {searchResults.map((place) => (
              <li
                key={place.id}
                className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => onPlaceSelect(place.id)}>
                <div className="font-medium">{place.displayName.text}</div>
                <div className="text-gray-600 text-sm mt-1">
                  {place.formattedAddress}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading &&
        !error &&
        searchTerm && (
          <div className="p-3 bg-gray-50 text-gray-600 rounded-md">
            沒有找到相關地點，請嘗試其他關鍵字
          </div>
        )
      )}
    </div>
  );
};

export default PlaceSearch;
