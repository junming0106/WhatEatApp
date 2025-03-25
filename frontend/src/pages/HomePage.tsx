import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import axios from "axios";

// 組件導入
import BottomNavigation from "../components/BottomNavigation";
import RestaurantCard from "../components/RestaurantCard";
import CategoryFilter from "../components/CategoryFilter";
import LocationSelector from "../components/LocationSelector";
import RandomModal from "../components/RandomModal";

interface Restaurant {
  id: number;
  name: string;
  place_id: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  photo_reference: string;
  photo_url?: string;
  is_favorite: boolean;
}

const categories = ["全部", "小吃", "餐廳", "甜點", "咖啡"];

const HomePage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    text: string;
  }>({
    lat: 25.0418, // 默認台北市
    lng: 121.5352,
    text: "台北市",
  });
  const [category, setCategory] = useState("全部");
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomRestaurant, setRandomRestaurant] = useState<Restaurant | null>(
    null
  );

  // 加載餐廳數據
  useEffect(() => {
    fetchRestaurants();
  }, [location, category]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      // 首先使用 Text Search 獲取地點詳細資訊
      const placeResponse = await axios.post("/api/places/textsearch", {
        textQuery: location.text,
        fields: ["id", "location", "formattedAddress", "displayName"],
      });

      // 使用獲取到的位置搜尋附近餐廳
      const response = await axios.get(`/api/restaurants/nearby`, {
        params: {
          lat: placeResponse.data.location.latitude || location.lat,
          lng: placeResponse.data.location.longitude || location.lng,
          category: category,
        },
      });

      setRestaurants(response.data);
      setCurrentRestaurantIndex(0);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  // 定位相關
  const handleLocationChange = (newLocation: {
    lat: number;
    lng: number;
    text: string;
  }) => {
    setLocation(newLocation);
  };

  // 獲取當前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            text: "當前位置",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("無法獲取您的位置，請手動選擇位置");
        }
      );
    } else {
      alert("您的瀏覽器不支持地理定位");
    }
  };

  // 類別篩選
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  // 收藏餐廳
  const toggleFavorite = async (restaurantId: number) => {
    try {
      const restaurant = restaurants[currentRestaurantIndex];
      if (!restaurant) return;

      const updatedRestaurants = [...restaurants];

      if (restaurant.is_favorite) {
        await axios.delete(`/api/favorites/${restaurantId}`);
        updatedRestaurants[currentRestaurantIndex].is_favorite = false;
      } else {
        await axios.post("/api/favorites", { restaurant_id: restaurantId });
        updatedRestaurants[currentRestaurantIndex].is_favorite = true;
      }

      setRestaurants(updatedRestaurants);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // 下一個餐廳
  const nextRestaurant = () => {
    if (currentRestaurantIndex < restaurants.length - 1) {
      setCurrentRestaurantIndex(currentRestaurantIndex + 1);
    } else {
      // 已經是最後一個餐廳，重新載入或其他處理
      alert("已經是最後一個餐廳了，重新載入更多餐廳");
      fetchRestaurants();
    }
  };

  // 隨機選擇一個收藏的餐廳
  const getRandomFavorite = async () => {
    try {
      const response = await axios.get("/api/favorites/random");
      setRandomRestaurant(response.data);
      setShowRandomModal(true);
    } catch (error) {
      console.error("Error getting random favorite:", error);
      alert("尚未收藏任何餐廳，請先收藏一些餐廳");
    }
  };

  // 滑動處理
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextRestaurant(),
    onSwipedRight: () => {
      const restaurant = restaurants[currentRestaurantIndex];
      if (restaurant) {
        toggleFavorite(restaurant.id);
        nextRestaurant();
      }
    },
    trackMouse: true,
    touchEventOptions: { passive: false },
  });

  const currentRestaurant = restaurants[currentRestaurantIndex];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 頂部區域 - 地點選擇 */}
      <div className="bg-primary text-white p-4">
        <LocationSelector
          location={location.text}
          onLocationChange={handleLocationChange}
          onGetCurrentLocation={getCurrentLocation}
        />
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">正在尋找附近的美食...</p>
            </div>
          </div>
        ) : restaurants.length > 0 ? (
          <div {...swipeHandlers} className="h-full">
            <RestaurantCard
              restaurant={currentRestaurant}
              onFavorite={() => toggleFavorite(currentRestaurant.id)}
              onNext={nextRestaurant}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 mb-4">未找到餐廳</p>
              <button
                onClick={fetchRestaurants}
                className="px-4 py-2 bg-primary text-white rounded-lg">
                重新載入
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 分類過濾 */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <CategoryFilter
          categories={categories}
          activeCategory={category}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* 底部導航 */}
      <BottomNavigation onRandomClick={getRandomFavorite} />

      {/* 隨機選擇餐廳彈窗 */}
      {showRandomModal && randomRestaurant && (
        <RandomModal
          restaurant={randomRestaurant}
          onClose={() => setShowRandomModal(false)}
          onNext={getRandomFavorite}
        />
      )}
    </div>
  );
};

export default HomePage;
