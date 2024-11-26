/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

// eslint-disable-next-line no-unused-vars
import React from "react";

const ErrorModal = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) return null;
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-20 overflow-y-auto h-full w-full flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="relative p-6 bg-white w-full max-w-md m-auto flex-col flex rounded-lg shadow-lg">
        <div className="flex items-center mb-4 justify-center">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-2">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600 font-semibold leading-tight text-center">
            {errorMessage}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
export default ErrorModal;
