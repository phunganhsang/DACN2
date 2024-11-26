/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../store/Auth";
import FeedBackModal from "./FeedBackForm";

const INITIAL_ITEMS = 100000;
const LOAD_MORE_ITEMS = 100000;

const FileDomainLoadMoreModal = ({ isOpen, onClose, fileContent , selectedModel }) => {
  const [displayedContent, setDisplayedContent] = useState([]);
  const [isFeedBackModalOpen, setIsFeedBackModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState([]);

  const VITE_HOST_BACKEND = import.meta.env.VITE_HOST_BACKEND;
  const { data } = useAuth();

  useEffect(() => {
    async function fetchData(extractedUrls) {
      if (isOpen) {
        setIsLoading(true);
        await loadInitialContent(extractedUrls);
        setIsLoading(false);
      }
    }
    if (isOpen) {
      const extractedUrls = fileContent.map((item) => item.domain || item.url);
      setUrls(extractedUrls);
      fetchData(extractedUrls);
    }
  }, [isOpen]);

  const loadInitialContent = async (extractedUrls) => {
    const initialContent = extractedUrls.slice(0, INITIAL_ITEMS);
    try {
      const response = await axios.post(
        `http://${VITE_HOST_BACKEND}/infer/chunk`,
        initialContent,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
          timeout: 999999999999999999999999999999999999999999999999999999999999999999999999999 * 2,
        }
      );
      const infers = response.data;
      setDisplayedContent(infers);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading initial content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = currentPage + 1;
    const startIndex = INITIAL_ITEMS + (nextPage - 2) * LOAD_MORE_ITEMS;
    const endIndex = startIndex + LOAD_MORE_ITEMS;
    const newContent = urls.slice(startIndex, endIndex);
    console.log(newContent)
    try {
      const response = await axios.post(
        `http://${VITE_HOST_BACKEND}/infer/chunk?model_release=${selectedModel}`,
        newContent,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
          timeout: 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 * 2,
        }
      );
      const infers = response.data;
      setDisplayedContent((prevContent) => [...prevContent, ...infers]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !fileContent?.length) return null;

  const renderResultText = (result) => {
    switch (result) {
      case 0:
        return "Bình thường";
      case 1:
        return "Có tín nhiệm thấp";
      case 21:
      case 22:
        return "Cần xem xét";
      default:
        return "";
    }
  };

  const getResultColor = (result) => {
    if ([1].includes(result)) return "text-red-500 font-bold";
    if ([21, 22].includes(result)) return "text-yellow-700 font-bold";
    return "text-green-500 font-bold";
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-2xl">Kết quả đánh giá</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full bg-white">
            <thead className="sticky top-0 bg-white shadow z-10">
              <tr>
                {[
                  "STT",
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
            <tbody>
              {displayedContent.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border">{index + 1}</td>
                  <td className="py-2 px-4 border">{item.domain}</td>
                  <td className="py-2 px-4 border">{item.domainLength}</td>
                  <td className="py-2 px-4 border">{item.typeDomain}</td>
                  <td
                    className={`py-2 px-4 border ${getResultColor(
                      item.result
                    )}`}
                  >
                    {renderResultText(item.result)}
                  </td>
                  <td className="py-2 px-4 border">{item.note}</td>
                  <td className="py-2 px-4 border">
                    {truncateText(item.metadata, 30)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedContent.length < fileContent.length && (
            <div className="flex justify-center p-4 border-t">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
        <div className="p-2">
          <div className="mt-4">
            <div className="flex justify-end mb-4">
              <button
                className={`mx-2 px-4 py-2 rounded ${
                  isLoading
                    ? "bg-green-300 text-white cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                disabled={isLoading}
              >
                Tải xuống Excel
              </button>
              <button
                onClick={() => {
                  setIsFeedBackModalOpen(true);
                }}
                className={`mx-2 px-4 py-2 rounded ${
                  isLoading
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>
      <FeedBackModal
        isOpen={isFeedBackModalOpen}
        onClose={() => {
          setIsFeedBackModalOpen(false);
        }}
        results={displayedContent}
      />
    </div>
  );
};

export default FileDomainLoadMoreModal;
