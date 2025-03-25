import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSignOutAlt, FaUserEdit, FaHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import BottomNavigation from "../components/BottomNavigation";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    // 獲取收藏數量
    const fetchFavoritesCount = async () => {
      try {
        const response = await fetch("/api/favorites", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setFavoritesCount(data.length || 0);
      } catch (error) {
        console.error("Error fetching favorites count:", error);
      }
    };

    fetchFavoritesCount();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRandomClick = () => {
    navigate("/"); // 跳轉至首頁然後觸發隨機
  };

  if (!user) {
    return <div className="p-4">載入中...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="text-white">
          <FaArrowLeft className="text-lg" />
        </button>
        <h1 className="text-xl font-bold">個人資料</h1>
        <div className="w-6"></div> {/* 佔位 */}
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 用戶資訊卡 */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mr-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* 統計資訊 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">我的數據</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">
                {favoritesCount}
              </p>
              <p className="text-sm text-gray-600">已收藏餐廳</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-gray-600">已評價餐廳</p>
            </div>
          </div>
        </div>

        {/* 操作選項 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div
            className="p-4 border-b border-gray-100 flex items-center"
            onClick={() => navigate("/favorites")}>
            <FaHeart className="text-primary mr-3" />
            <span>我的收藏</span>
          </div>
          <div
            className="p-4 border-b border-gray-100 flex items-center"
            onClick={() => alert("功能開發中")}>
            <FaUserEdit className="text-gray-600 mr-3" />
            <span>編輯個人資料</span>
          </div>
          <div
            className="p-4 flex items-center text-red-500"
            onClick={handleLogout}>
            <FaSignOutAlt className="mr-3" />
            <span>登出</span>
          </div>
        </div>
      </div>

      {/* 底部導航 */}
      <BottomNavigation onRandomClick={handleRandomClick} />
    </div>
  );
};

export default ProfilePage;
