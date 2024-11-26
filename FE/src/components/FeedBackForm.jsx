import { useState } from "react";
import * as XLSX from "xlsx";
import HandleFeedBackModal from "./HandleFeedBackModal";

const FeedBackModal = ({ isOpen, onClose, results }) => {
  console.log({ isOpen, onClose, results });
  const [isHandleFeedBackModal, setHandleFeedBackModal] = useState(false);
  const [currentDomainSelect, setCurrentDomainSelect] = useState();
  const [listDomainChecked, setListDomainChecked] = useState([]);

  if (!isOpen || !results?.length) return null;

  const handleAddDomainChecked = (domain) => {
    setListDomainChecked((pre) => {
      return [...pre, domain];
    });
  };

  console.log(listDomainChecked);

  const openHandleFeedBackModal = (currentDomainSelect) => {
    setHandleFeedBackModal(true);
    setCurrentDomainSelect(currentDomainSelect);
  };

  const closeHandleFeedBackModal = () => {
    setHandleFeedBackModal(false);
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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

  const renderTableRow = (result, index) => {
    const checkedItem = listDomainChecked.find(
      (item) => item.domain === result.domain
    );

    return (
      <tr key={index} className="text-center">
        {checkedItem ? (
          <>
            <td className="py-2 px-2 border">{checkedItem.domain}</td>
            <td className="py-2 px-2 border">{result.domainLength}</td>
            <td className="py-2 px-2 border">{checkedItem.typeDomain}</td>
            <td
              className={`py-2 px-4 border ${getResultColor(
                checkedItem.result
              )}`}
            >
              {renderResultText(checkedItem.result)}
            </td>
            <td className="py-2 px-2 border text-center ">
              <div
                className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap mx-auto"
                title={checkedItem.note}
              >
                {truncateText(checkedItem.note, 100)}
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
            <td className="py-2 px-2 border text-center">
              <i>*đã đánh giá</i>
            </td>
          </>
        ) : (
          <>
            <td className="py-2 px-2 border">{result.domain}</td>
            <td className="py-2 px-2 border">{result.domainLength}</td>
            <td className="py-2 px-2 border">{result.typeDomain}</td>
            <td className={`py-2 px-4 border ${getResultColor(result.result)}`}>
              {renderResultText(result.result)}
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
            <td className="py-2 px-2 border text-center">
              <button
                onClick={() => {
                  openHandleFeedBackModal(result);
                }}
                className="bg-blue-500 text-white px-1 py-1 rounded hover:bg-blue-600"
              >
                Đánh giá lại
              </button>
            </td>
          </>
        )}
      </tr>
    );
  };

  return (
    <>
      {isHandleFeedBackModal && (
        <HandleFeedBackModal
          isOpen={isHandleFeedBackModal}
          onClose={() => {
            closeHandleFeedBackModal();
          }}
          currentDomainSelect={currentDomainSelect}
          handleAddDomainChecked={handleAddDomainChecked}
        />
      )}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40"
        onClick={handleOutsideClick}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-50">
            <div className="flex-grow">
              <h2 className="text-center font-bold text-2xl">
                Đánh giá lại kết quả
              </h2>
              <p>
                <i>*kết quả đánh giá sẽ được lưu vào CSDL</i>
              </p>
            </div>
            <button onClick={onClose} className="text-2xl">
              &times;
            </button>
          </div>

          <div className="overflow-y-auto flex-grow">
            <div className="px-2">
              <table className="min-w-full bg-white mb-4">
                <thead>
                  <tr>
                    {[
                      "Domain",
                      "Độ dài domain",
                      "Thể loại",
                      "Kết quả (*)",
                      "Chú thích",
                      "Meta data",
                      "",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="py-2 px-4 border bg-white sticky top-0 z-10"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{results.map(renderTableRow)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedBackModal;
