import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaHeart, FaRegHeart, FaDirections } from "react-icons/fa";

interface RestaurantDetails {
  id: number;
  name: string;
  place_id: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  user_ratings_total: number;
  photo_reference: string;
  is_favorite: boolean;
  details: {
    formatted_address: string;
    formatted_phone_number: string;
    opening_hours: {
      weekday_text: string[];
    };
    website: string;
    url: string;
    reviews: Array<{
      author_name: string;
      rating: number;
      relative_time_description: string;
      text: string;
    }>;
    photos: Array<{
      photo_reference: string;
    }>;
  };
}

interface MenuItem {
  name: string;
  price: string;
  photoUrl: string;
}

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/restaurants/${id}`);
      setRestaurant(response.data);

      // 模擬從 Google Maps 獲取推薦菜品
      // 實際應用應通過 API 獲取
      const mockMenuItems = [
        {
          name: "經典豚骨拉麵",
          price: "NT$ 180",
          photoUrl: response.data.details.photos?.[0]?.photo_reference
            ? `/api/restaurants/photo/${response.data.details.photos[0].photo_reference}?maxwidth=300`
            : "https://via.placeholder.com/300x200",
        },
        {
          name: "辣味味噌拉麵",
          price: "NT$ 190",
          photoUrl: response.data.details.photos?.[1]?.photo_reference
            ? `/api/restaurants/photo/${response.data.details.photos[1].photo_reference}?maxwidth=300`
            : "https://via.placeholder.com/300x200",
        },
        {
          name: "炸雞塊",
          price: "NT$ 120",
          photoUrl: response.data.details.photos?.[2]?.photo_reference
            ? `/api/restaurants/photo/${response.data.details.photos[2].photo_reference}?maxwidth=300`
            : "https://via.placeholder.com/300x200",
        },
      ];

      setMenuItems(mockMenuItems);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!restaurant) return;

    try {
      if (restaurant.is_favorite) {
        await axios.delete(`/api/favorites/${restaurant.id}`);
      } else {
        await axios.post("/api/favorites", { restaurant_id: restaurant.id });
      }

      setRestaurant({
        ...restaurant,
        is_favorite: !restaurant.is_favorite,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const openInGoogleMaps = () => {
    if (!restaurant) return;

    const url =
      restaurant.details.url ||
      `https://www.google.com/maps/search/?api=1&query=${restaurant.name}&query_place_id=${restaurant.place_id}`;

    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到餐廳資訊</p>
          <button
            onClick={() => navigate("/favorites")}
            className="px-4 py-2 bg-primary text-white rounded-lg">
            返回收藏列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 頂部區域 */}
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: restaurant.photo_reference
            ? `url(/api/restaurants/photo/${restaurant.photo_reference}?maxwidth=800)`
            : "linear-gradient(120deg, #f87171 0%, #ef4444 100%)",
        }}>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-4">
          <div className="flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-white bg-black bg-opacity-30 p-2 rounded-full">
              <FaArrowLeft />
            </button>
            <button
              onClick={toggleFavorite}
              className="text-white bg-black bg-opacity-30 p-2 rounded-full">
              {restaurant.is_favorite ? (
                <FaHeart className="text-primary" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          </div>

          <div className="text-white">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center mt-1">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{restaurant.rating}</span>
              <span className="mx-1">·</span>
              <span className="text-sm">({restaurant.user_ratings_total})</span>
            </div>
            <p className="text-sm mt-1">{restaurant.address}</p>
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 p-4">
        {/* 推薦餐點部分 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">推薦餐點</h2>
          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow overflow-hidden">
                <div className="flex">
                  <div className="w-1/3 h-24 bg-gray-200">
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-center">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-primary font-bold">{item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 餐廳資訊部分 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">餐廳資訊</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden p-4">
            {restaurant.details.formatted_address && (
              <div className="mb-3">
                <h3 className="text-sm text-gray-500">地址</h3>
                <p>{restaurant.details.formatted_address}</p>
              </div>
            )}

            {restaurant.details.formatted_phone_number && (
              <div className="mb-3">
                <h3 className="text-sm text-gray-500">電話</h3>
                <p>{restaurant.details.formatted_phone_number}</p>
              </div>
            )}

            {restaurant.details.opening_hours?.weekday_text && (
              <div className="mb-3">
                <h3 className="text-sm text-gray-500">營業時間</h3>
                <div className="text-sm">
                  {restaurant.details.opening_hours.weekday_text.map(
                    (day, index) => (
                      <p key={index}>{day}</p>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="p-4 bg-white border-t">
        <button
          onClick={openInGoogleMaps}
          className="w-full py-3 bg-secondary text-white rounded-lg font-medium flex items-center justify-center">
          <FaDirections className="mr-2" />在 Google 地圖中導航
        </button>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
