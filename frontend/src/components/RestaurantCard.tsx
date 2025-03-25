import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

interface Restaurant {
  id: number;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  photo_reference: string;
  photo_url?: string;
  is_favorite: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onFavorite: () => void;
  onNext: () => void;
}

const RestaurantCard = ({
  restaurant,
  onFavorite,
  onNext,
}: RestaurantCardProps) => {
  const photoUrl = restaurant.photo_reference
    ? `/api/restaurants/photo/${restaurant.photo_reference}?maxwidth=600`
    : "https://via.placeholder.com/600x400";

  return (
    <div className="card h-full flex flex-col max-w-md mx-auto">
      {/* 餐廳圖片 */}
      <div className="relative h-72 bg-gray-200">
        <img
          src={photoUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent h-24"></div>
        <div className="absolute left-4 right-4 bottom-4 text-white">
          <h2 className="text-xl font-bold">{restaurant.name}</h2>
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">★</span>
            <span>{restaurant.rating}</span>
            <span className="mx-1">·</span>
            <span className="text-sm">({restaurant.user_ratings_total})</span>
          </div>
          <p className="text-sm mt-1 truncate">{restaurant.address}</p>
        </div>
      </div>

      {/* 卡片底部操作區域 */}
      <div className="p-4 flex items-center justify-between mt-auto">
        <p className="text-gray-500 text-sm">左右滑動選擇或跳過</p>

        <div className="flex space-x-4">
          <button
            onClick={onFavorite}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-red-50">
            {restaurant.is_favorite ? (
              <FaHeart className="text-primary text-xl" />
            ) : (
              <FaRegHeart className="text-gray-500 text-xl" />
            )}
          </button>

          <button
            onClick={onNext}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-100">
            <IoClose className="text-gray-500 text-2xl" />
          </button>
        </div>
      </div>

      {/* 卡片底部說明文字 */}
      <div className="text-center text-sm text-gray-500 pb-4">
        左右滑動卡片即可收藏或換下一個
      </div>
    </div>
  );
};

export default RestaurantCard;
