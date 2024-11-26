import { useState, useRef } from "react";
import axios from "axios";
import SingleDomainModal from "./SingleDomainModal";
import FileDomainLoadMoreModal from "./FileDomainLoadMoreModal";
import FileDomainModal from "./FileDomainModal";
import ErrorModal from "./ErrorModal";
import { useAuth } from "../store/Auth";
import logoMascot from "../assets/logo_mascot.png";
import introducerBackground from "../assets/introducer_background.jpg";
import producer_image_title_2 from "../assets/producer_image_title_2.png";
import introducer_content_image from "../assets/introducer_content_image.jpg";
import * as XLSX from "xlsx";

const Body = () => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [domain, setDomain] = useState("");
  const [selectedModel, setSelectedModel] = useState("old");
  const [singleDomainResult, setSingleDomainResult] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { data } = useAuth();
  const VITE_HOST_BACKEND = import.meta.env.VITE_HOST_BACKEND;

  const [fileContent, setFileContent] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  // const handleFileInput = (e) => {
  //   const selectedFile = e.target.files[0];

  //   if (selectedFile) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const data = new Uint8Array(e.target.result);
  //       const workbook = XLSX.read(data, { type: "array" });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  //       console.log(worksheet)
  //       setFileContent(worksheet);
  //     };
  //     reader.readAsArrayBuffer(selectedFile);
  //   }

  //   setFile(selectedFile);
  //   setSingleDomainResult(null);
  //   setDomain("");
  //   e.target.value = "";
  // };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (fileExtension === 'csv') {
            // Handle CSV file
            const csvText = e.target.result;
            const rows = csvText.split('\n');
            const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
            const domainIndex = headers.indexOf('domain');
            const urlIndex = headers.indexOf('url');
            
            if (domainIndex === -1 && urlIndex === -1) {
              setErrorMessage("CSV file must contain either a 'domain' or 'url' column");
              setIsErrorModalOpen(true);
              setFile(null);
              return;
            }
            
            const columnIndex = domainIndex !== -1 ? domainIndex : urlIndex;
            
            const domains = rows.slice(1)
              .map(row => {
                const columns = row.split(',');
                return columns[columnIndex]?.trim();
              })
              .filter(domain => domain && domain.length > 0); // Remove empty entries
              
            setFileContent(domains.map(domain => ({ domain })));
          } else {
            // Handle Excel file
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            
            // Check if either 'domain' or 'url' columns exist
            const hasDomainColumn = worksheet.some(row => 'domain' in row);
            const hasUrlColumn = worksheet.some(row => 'url' in row);
            
            if (!hasDomainColumn && !hasUrlColumn) {
              setErrorMessage("Excel file must contain either a 'domain' or 'url' column");
              setIsErrorModalOpen(true);
              setFile(null);
              return;
            }
            
            const domains = worksheet
              .map(row => {
                // Try to get value from domain column first, if not found try url column
                const value = row.domain || row.url;
                return value?.toString().trim();
              })
              .filter(domain => domain && domain.length > 0);
              
            setFileContent(domains.map(domain => ({ domain })));
          }
        } catch (error) {
          console.error("Error processing file:", error);
          setErrorMessage("Error processing file. Please ensure it's a valid CSV or Excel file.");
          setIsErrorModalOpen(true);
          setFile(null);
          return;
        }
      };
  
      if (fileExtension === 'csv') {
        reader.readAsText(selectedFile);
      } else {
        reader.readAsArrayBuffer(selectedFile);
      }
    }
  
    setFile(selectedFile);
    setSingleDomainResult(null);
    setDomain("");
    e.target.value = "";
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setFile(null);
    setFileContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const inferSingleDomain = async () => {
    setIsLoading(true);
    setFile(null);
    try {
      const response = await axios.get(
        `http://${VITE_HOST_BACKEND}/infer/?domain=${domain}&model_release=${selectedModel}`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      setSingleDomainResult(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error inferring single domain:", error);
      setSingleDomainResult({
        error: "An error occurred while inferring the domain",
      });
      setIsErrorModalOpen(true);
      setErrorMessage("An error occurred while inferring the domain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEvaluate();
    }
  };

  const handleEvaluate = () => {
    if (domain) {
      inferSingleDomain();
    } else if (file) {
      console.log(fileContent);
      setIsModalOpen(true);
    } else {
      alert("Please enter a domain or select a file");
    }
  };

  return (
    <>
      <div className="flex justify-center my-10">
        <img
          src={logoMascot}
          alt="logo_in_slide"
          className="max-h-60 max-w-60"
        />
      </div>
      <div className="flex uppercase text-6xl font-semibold font-sans items-center justify-center content-center">
        <a className="text-customBlue">Đánh giá</a>
        <a className="text-customOrange mx-3">Tín nhiệm</a>
        <a className="text-customBlue">Tên miền</a>
      </div>
      <div className="flex items-center justify-center content-center my-10 border-gray-300 rounded-lg p-4">
        <div className="relative w-full lg:max-w-sm justify-center items-center">
            <select defaultValue="release_v1" className="w-full p-2.5 text-gray-500 bg-transparent border-2 border-gray-300 rounded-md shadow-sm outline-none appearance-none focus:outline-none text-center"
            value={selectedModel}
            onChange={handleModelChange}>
                <option value="release_v1" >Model release v1</option>
                <option value="old">Model old</option>
            </select>
        </div>      
      </div>
      <div className="flex justify-center my-10">
        <div className="flex justify-center items-center h-14 w-full max-w-xl border-2 border-gray-300 rounded-md overflow-hidden">
          <input
            type="text"
            className="form-control h-full w-full px-4 text-lg focus:outline-none border-t-2 mt-2 mx-3 text-center bg-transparent"
            maxLength="150"
            placeholder="Nhập tên miền bạn muốn đánh giá"
            required=""
            id="label"
            name="label"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <a className="text-center font-sans text-customBlue font-bold text-2xl">
          {" "}
          Hoặc
        </a>
      </div>
      <div className="mt-10 mb-5 max-w-xl mx-auto">
        <div
          className="border-2 border-gray-300 rounded-lg p-6 text-center cursor-pointer relative h-24 flex items-center justify-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <p className="truncate  max-w-xs mb-2">{file.name}</p>
              <button
                onClick={handleRemoveFile}
                className="bg-red-500 font-sans text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Bỏ chọn
              </button>
            </div>
          ) : (
            <p className="font-sans">
              Drag and drop some files here, or click to select files
            </p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
      <div className="flex items-center justify-center mt-5">
        <button
          className="h-14 w-40 text-white bg-customOrange rounded-md font-sans font-semibold text-xl shadow-lg hover:bg-cyan-500 hover:underline hover:-translate-y-2 hover:scale-95 transition-transform duration-300 hover:shadow-cyan-600 "
          onClick={handleEvaluate}
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Đánh giá"}
        </button>
      </div>
      <div className="flex my-10 mx-5 w-100 items-center justify-center">
        <div className="rounded-xl overflow-hidden shadow-md mx-5  hover:scale-95 transition-transform duration-300">
          <div className="relative">
            <a
              className="header-card-item"
              href="https://guongmatso.tenmien.vn"
            >
              <img
                src={introducerBackground}
                alt="Background"
                className="h-96 w-full object-cover "
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white p-2">
                <div className="flex items-center justify-center space-x-2 ">
                  <img
                    src={producer_image_title_2}
                    alt="Logo"
                    className="h-14"
                  />
                  <span className="text-2xl font-semibold text-customBlue font-sans">
                    Định danh gương mặt số
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden shadow-md mx-5  hover:scale-95 transition-transform duration-300">
          <div className="relative">
            <a
              className="header-card-item"
              href="https://thuonghieuso.tenmien.vn"
            >
              <img
                src={introducer_content_image}
                alt="Background"
                className="h-96 w-full object-cover "
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white p-2">
                <div className="flex items-center justify-center space-x-2 ">
                  <img
                    src={producer_image_title_2}
                    alt="Logo"
                    className="h-14"
                  />
                  <span className="text-2xl font-semibold text-customBlue font-sans ">
                    Định danh thương hiệu số
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
      <SingleDomainModal
        selectedModel = {selectedModel}
        isOpen={isModalOpen && !file}
        onClose={() => {
          setIsModalOpen(false);
          setFile(null);
          setDomain("");
        }}
        result={singleDomainResult}
      />
      {isModalOpen && fileContent ? (
        <FileDomainLoadMoreModal
          selectedModel = {selectedModel}
          isOpen={isModalOpen && fileContent}
          onClose={() => {
            setIsModalOpen(false);
            setFile(null);
            setFileContent(null);
            setDomain("");
          }}
          fileContent={fileContent}
        />
        // <FileDomainModal
        //   selectedModel = {selectedModel}
        //   isOpen={isModalOpen && fileContent}
        //   onClose={() => {
        //     setIsModalOpen(false);
        //     setFile(null);
        //     setFileContent(null);
        //     setDomain("");
        //   }}
        //   fileContent={fileContent}
        // />
      ) : (
        <></>
      )}

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default Body;
