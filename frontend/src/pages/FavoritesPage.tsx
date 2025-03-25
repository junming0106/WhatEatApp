import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import BottomNavigation from "../components/BottomNavigation";

interface Restaurant {
  id: number;
  name: string;
  place_id: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  photo_reference: string;
  photo_url?: string;
}

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/favorites");
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: number) => {
    try {
      await axios.delete(`/api/favorites/${restaurantId}`);
      setFavorites(favorites.filter((fav) => fav.id !== restaurantId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleRestaurantClick = (restaurantId: number) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const getRandomFavorite = async () => {
    try {
      await axios.get("/api/favorites/random");
      navigate("/");
    } catch (error) {
      console.error("Error getting random favorite:", error);
      alert("尚未收藏任何餐廳，請先收藏一些餐廳");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="text-white">
          <FaArrowLeft className="text-lg" />
        </button>
        <h1 className="text-xl font-bold">我的收藏</h1>
        <div className="w-6"></div> {/* 佔位 */}
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">載入中...</p>
            </div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow overflow-hidden flex">
                <div
                  className="flex-1 p-4 cursor-pointer"
                  onClick={() => handleRestaurantClick(restaurant.id)}>
                  <div className="flex">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                      {restaurant.photo_url ? (
                        <img
                          src={restaurant.photo_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500 text-xs">無圖片</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {restaurant.address}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm text-gray-700">
                            {restaurant.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          ({restaurant.user_ratings_total})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(restaurant.id)}
                  className="bg-red-100 text-red-500 flex items-center justify-center px-4">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 mb-4">您還沒有收藏任何餐廳</p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-primary text-white rounded-lg">
                開始收藏
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部導航 */}
      <BottomNavigation onRandomClick={getRandomFavorite} />
    </div>
  );
};

export default FavoritesPage;
