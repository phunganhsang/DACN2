import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/Auth";
import vnnicLogo from "../assets/vnnic-logo-f.png";

const Header = () => {
  const navigate = useNavigate();
  const { data, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-md p-4">
      <div className="flex items-center">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.vnnic.vn/"
          className="mr-6"
        >
          <img src={vnnicLogo} alt="logo-vi" className="h-12" />
        </a>
        {/* <nav className="flex space-x-4">
          <button className="text-gray-700 hover:text-gray-900">Tên miền</button>
          <button className="text-red-500 hover:text-red-700">
            Chương trình đặc biệt
            <sup className="text-red-500">★</sup>
          </button>
        </nav> */}
      </div>
      <div className="relative">
        {data.token ? (
          <>
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <span>{data.username}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleDashboardClick}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={handleLoginClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
