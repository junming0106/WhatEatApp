import { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaCrosshairs } from "react-icons/fa";

interface LocationSelectorProps {
  location: string;
  onLocationChange: (location: {
    lat: number;
    lng: number;
    text: string;
  }) => void;
  onGetCurrentLocation: () => void;
}

const popularLocations = [
  { name: "台北市", lat: 25.0418, lng: 121.5352 },
  { name: "新北市", lat: 25.0093, lng: 121.4603 },
  { name: "桃園市", lat: 24.9889, lng: 121.3177 },
  { name: "台中市", lat: 24.1383, lng: 120.6785 },
  { name: "高雄市", lat: 22.6319, lng: 120.3117 },
];

const LocationSelector = ({
  location,
  onLocationChange,
  onGetCurrentLocation,
}: LocationSelectorProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 處理點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLocation = (loc: {
    name: string;
    lat: number;
    lng: number;
  }) => {
    onLocationChange({
      lat: loc.lat,
      lng: loc.lng,
      text: loc.name,
    });
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}>
        <FaMapMarkerAlt className="mr-2" />
        <span className="font-medium">{location}</span>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg w-56 overflow-hidden z-10">
          <div className="p-2">
            <button
              onClick={() => {
                onGetCurrentLocation();
                setShowDropdown(false);
              }}
              className="w-full flex items-center p-3 text-left hover:bg-gray-100 rounded-lg">
              <FaCrosshairs className="mr-2 text-gray-600" />
              <span className="text-gray-600">使用當前位置</span>
            </button>

            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="px-3 py-1 text-xs text-gray-500">熱門地點</p>
              {popularLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full p-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg">
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
