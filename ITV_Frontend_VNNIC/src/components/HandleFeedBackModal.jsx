/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../store/Auth";

const HandleFeedBackModal = ({
  isOpen,
  onClose,
  currentDomainSelect,
  handleAddDomainChecked,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState(currentDomainSelect.typeDomain);
  const [result, setResult] = useState(currentDomainSelect.result.toString());
  const [comment, setComment] = useState(currentDomainSelect.note);
  const [isChanged, setIsChanged] = useState(false);
  const VITE_HOST_BACKEND = import.meta.env.VITE_HOST_BACKEND;
  const { data } = useAuth();

  useEffect(() => {
    const hasChanges =
      category !== currentDomainSelect.typeDomain ||
      result !== currentDomainSelect.result.toString() ||
      (comment.trim() !== currentDomainSelect.note.trim() &&
        comment.trim() !== "");

    setIsChanged(hasChanges);
  }, [category, result, comment, currentDomainSelect]);

  const handleSubmit = async () => {
    if (isChanged) {
      try {
        // Thực hiện API call với axios
        const response = await axios.post(
          `http://${VITE_HOST_BACKEND}/domain/review`,
          {
            typeDomain: category,
            domain: currentDomainSelect.domain,
            note: comment,
            result: parseInt(result),
          },
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
            timeout: 1800000 * 2,
          }
        );

        if (response.status === 200) {
          // Kiểm tra nếu response thành công
          handleAddDomainChecked({
            typeDomain: category,
            domain: currentDomainSelect.domain,
            note: comment,
            result: parseInt(result),
          });
          onClose(); // Đóng modal nếu thành công
        } else {
          console.error("Submission failed:", response.statusText);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderResultText = (result) => {
    switch (result) {
      case "0":
        return "Bình thường";
      case "1":
        return "Có tín nhiệm thấp";
      case "21":
      case "22":
        return "Cần xem xét";
      default:
        return "";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-center font-bold text-2xl mb-4">Đánh giá lại</h2>
        <p>
          Đánh giá lại cho domain: <strong>{currentDomainSelect.domain}</strong>
        </p>

        <div className="mt-4">
          <label className="block mb-2 font-semibold">Loại:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value={currentDomainSelect.typeDomain}>
              {currentDomainSelect.typeDomain.trim()
                ? currentDomainSelect.typeDomain
                : "Chưa xác định"}
            </option>
            <option value="Báo chí, tin tức">Báo chí, tin tức</option>
            <option value="Nội dung khiêu dâm">Nội dung khiêu dâm</option>
            <option value="Cờ bạc, lừa đảo, vay tín dụng">
              Cờ bạc, lừa đảo, vay tín dụng
            </option>
            <option value="Tổ chức">Tổ chức</option>
            <option value="Chưa xác định">Chưa xác định</option>
          </select>

          <label className="block mb-2 font-semibold">Kết quả:</label>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value={currentDomainSelect.result}>
              {renderResultText(currentDomainSelect.result.toString())}
            </option>
            <option value="0">Bình thường</option>
            <option value="1">Tín nhiệm thấp</option>
            <option value="22">Cần xem xét</option>
          </select>

          <label className="block mb-2 font-semibold">Chú thích:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Nhập chú thích..."
          />

          <button
            onClick={handleSubmit}
            className={`text-white px-4 py-2 rounded mr-2 ${
              isChanged
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isChanged}
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandleFeedBackModal;
