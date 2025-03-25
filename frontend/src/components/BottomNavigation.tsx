import { Link, useLocation } from "react-router-dom";
import { FaHome, FaHeart, FaUser, FaRandom } from "react-icons/fa";

interface BottomNavigationProps {
  onRandomClick: () => void;
}

const BottomNavigation = ({ onRandomClick }: BottomNavigationProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-t border-gray-200 py-2 px-4">
      <div className="grid grid-cols-4 gap-2">
        <Link to="/" className="flex flex-col items-center justify-center">
          <div
            className={`p-1 ${
              isActive("/") ? "text-primary" : "text-gray-500"
            }`}>
            <FaHome className="text-xl mx-auto" />
          </div>
          <span
            className={`text-xs ${
              isActive("/") ? "text-primary" : "text-gray-500"
            }`}>
            首頁
          </span>
        </Link>

        <Link
          to="/favorites"
          className="flex flex-col items-center justify-center">
          <div
            className={`p-1 ${
              isActive("/favorites") ? "text-primary" : "text-gray-500"
            }`}>
            <FaHeart className="text-xl mx-auto" />
          </div>
          <span
            className={`text-xs ${
              isActive("/favorites") ? "text-primary" : "text-gray-500"
            }`}>
            收藏
          </span>
        </Link>

        <button
          onClick={onRandomClick}
          className="flex flex-col items-center justify-center bg-transparent border-0">
          <div className="p-1 text-gray-500">
            <FaRandom className="text-xl mx-auto" />
          </div>
          <span className="text-xs text-gray-500">隨機</span>
        </button>

        <Link
          to="/profile"
          className="flex flex-col items-center justify-center">
          <div
            className={`p-1 ${
              isActive("/profile") ? "text-primary" : "text-gray-500"
            }`}>
            <FaUser className="text-xl mx-auto" />
          </div>
          <span
            className={`text-xs ${
              isActive("/profile") ? "text-primary" : "text-gray-500"
            }`}>
            我的
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
