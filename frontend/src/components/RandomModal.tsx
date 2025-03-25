import { FaDirections } from "react-icons/fa";

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

interface RandomModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onNext: () => void;
}

const RandomModal = ({ restaurant, onClose, onNext }: RandomModalProps) => {
  const photoUrl =
    restaurant.photo_url ||
    (restaurant.photo_reference
      ? `/api/restaurants/photo/${restaurant.photo_reference}?maxwidth=400`
      : "https://via.placeholder.com/400x300");

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.name}&query_place_id=${restaurant.place_id}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full">
        {/* 餐廳圖片 */}
        <div className="h-40 bg-gray-200">
          <img
            src={photoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 餐廳資訊 */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-1">{restaurant.name}</h2>
          <div className="flex items-center mb-2">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{restaurant.rating}</span>
            <span className="mx-1">·</span>
            <span className="text-sm text-gray-600">
              ({restaurant.user_ratings_total})
            </span>
          </div>
          <p className="text-gray-600 mb-4">{restaurant.address}</p>

          {/* 按鈕 */}
          <div className="flex space-x-3">
            <button
              onClick={openInGoogleMaps}
              className="flex-1 bg-secondary text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <FaDirections className="mr-2" />
              <span>前往</span>
            </button>
            <button
              onClick={onNext}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">
              下一個
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomModal;
