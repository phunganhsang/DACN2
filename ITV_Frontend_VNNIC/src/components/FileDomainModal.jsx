/* eslint-disable no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */

import { useState } from "react";
import * as XLSX from "xlsx";
import FeedBackModal from "./FeedBackForm";

const FileDomainModal = ({ isOpen, onClose, results }) => {
  if (!isOpen || !results?.data?.length) return null;
  const [isFeedBackModalOpen, setIsFeedBackModalOpen] = useState(false);
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const handleReview = () => {
    setIsFeedBackModalOpen(true);
  };
  const renderResultText = (result) => {
    switch (result) {
      case 0:
        return "Bình thường";
      case 1:
        return "Có tín nhiệm thấp";
      case 21:
        return "Cần xem xét";
      case 22:
        return "Cần xem xét";
      default:
        return "";
    }
  };
  const getResultColor = (result) => {
    if ([1].includes(result)) return "text-red-500 font-bold";
    if ([21, 22].includes(result)) return "text-yellow-700 font-bold";
    return "text-green-500 font-bol";
  };
  const renderTableRow = (result, index) => (
    <tr key={index} className="text-center">
      <td className="py-2 px-2 border">{result.domain}</td>
      <td className="py-2 px-2 border">{result.domainLength}</td>
      <td className="py-2 px-2 border">{result.typeDomain}</td>
      <td className={`py-2 px-4 border ${getResultColor(result.result)}`}>
        {renderResultText(result.result)}
        {result.result === 3 && (
          <div>
            Khả năng mạo danh{" "}
            <a
              className="text-blue-500 underline"
              href={`http://${result.officialDomain}`}
            >
              {result.officialDomain}
            </a>
          </div>
        )}
      </td>
      <td className="py-2 px-2 border text-center ">
        <div
          className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap mx-auto"
          title={result.note}
        >
          {truncateText(result.note, 100)}
        </div>
      </td>
      <td className="py-2 px-2 border text-center">
        <div
          className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap mx-auto"
          title={result.metadata}
        >
          {truncateText(result.metadata, 30)}
        </div>
      </td>
    </tr>
  );

  const downloadExcel = () => {
    // Extract data from the table rows
    const tableData = results.data.map((result) => ({
      Domain: result.domain,
      "Độ dài domain": result.domainLength,
      "Thể loại": result.typeDomain,
      "Kết quả": renderResultText(result.result),
      "Chú thích": result.note,
      "Meta data": result.metadata,
    }));
    // Convert the extracted data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Domain Results");

    // Write the Excel file
    XLSX.writeFile(workbook, "domain_results.xlsx");
  };

  return (
    <>
      <FeedBackModal
        isOpen={isFeedBackModalOpen}
        onClose={() => {
          setIsFeedBackModalOpen(false);
        }}
        results={results}
      />
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30"
        onClick={handleOutsideClick}
      >
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto px-6">
          <div className="flex items-center justify-between pb-4">
            <div className="flex-grow">
              <h2 className="text-center font-bold text-2xl">
                Kết quả đánh giá
              </h2>
            </div>
            <button onClick={onClose} className="text-2xl">
              &times;
            </button>
          </div>

          <table className="min-w-full bg-white mb-4 mx-4">
            <thead>
              <tr>
                {[
                  "Domain",
                  "Độ dài domain",
                  "Thể loại",
                  "Kết quả (*)",
                  "Chú thích",
                  "Meta data",
                ].map((header, index) => (
                  <th key={index} className="py-2 px-4 border">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{results.data.map(renderTableRow)}</tbody>
          </table>
          <div className="mt-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={downloadExcel}
                className="bg-green-500 text-white mx-2 px-4 py-2 rounded hover:bg-green-600"
              >
                Tải xuống Excel
              </button>
              <button
                onClick={handleReview}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Review
              </button>
            </div>
            <p>
              * Entropy là một thước đo mức độ ngẫu nhiên hoặc phức tạp của
              chuỗi ký tự.
            </p>
            <p>* Kết quả dự đoán từ model ngôn ngữ có tính chất tham khảo.</p>
          </div>
          <h2 className="text-xl font-bold mt-6 mb-4">
            Gợi ý cách đặt tên miền:
          </h2>
          <ul>
            {[
              "Sử dụng phần mở rộng tên miền phù hợp",
              "Tránh các ký tự đặc biệt và sử dụng nhiều số",
              "Từ khóa liên quan đến lĩnh vực kinh doanh, tránh các từ khóa nhạy cảm",
            ].map((suggestion, index) => (
              <li key={index} className="flex items-center">
                <span className="inline-block w-6 h-6 bg-green-500 mr-2"></span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default FileDomainModal;
