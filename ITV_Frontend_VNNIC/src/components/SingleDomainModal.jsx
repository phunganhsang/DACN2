/* eslint-disable react/prop-types */
// eslint-disable-next-line react/prop-types
// eslint-disable-next-line no-unused-vars

const SingleDomainModal = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
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

  const renderResultCell = (result) => {
    let textColorClass = "py-2 px-4 border text-green-500 font-bold";
    if ([1].includes(result.result)) {
      textColorClass = "text-red-500 font-bold";
    } else if ([21, 22].includes(result.result)) {
      textColorClass = "text-yellow-700 font-bold";
    }

    return (
      <td className={`py-2 px-4 border ${textColorClass}`}>
        {renderResultText(result.result)}
      </td>
    );
  };

  const renderContent = (res) => {
    if (res.error) return res.error; // làm UI cho cái ni

    return (
      <div>
        <div className="text-xl font-bold mb-4 flex">
          <h2>Kết quả đánh giá:</h2>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {[
                "Domain",
                "Độ dài domain",
                "Thể loại",
                "Kết quả (*)",
                "Chú thích",
                "Metadata",
              ].map((header, index) => (
                <th key={index} className="py-2 px-4 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              {["domain", "domainLength", "typeDomain"].map((field, index) => (
                <td key={index} className="py-2 px-4 border">
                  {res[field]}
                </td>
              ))}
              {renderResultCell(res)}
              <td className="py-2 px-4 border text-center">
                <div
                  className="max-w-[200px] max-h-[200px] mx-auto"
                  title={res.note}
                >
                  {truncateText(res.note, 100)}
                </div>
              </td>
              <td className="py-2 px-4 border text-center">
                <div
                  className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap mx-auto   "
                  title={res.metadata}
                >
                  {truncateText(res.metadata, 100)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4">
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
    );
  };

  return (
    <div
      className="fixed h-100 w-100 inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        {renderContent(result)}
      </div>
    </div>
  );
};

export default SingleDomainModal;
