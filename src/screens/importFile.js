import React, { useRef } from "react";

const UploadFile = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onFileUpload(file);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
      <button
        style={{ padding: 10 }}
        type="button"
        onClick={() => fileInputRef.current.click()}
      >
        Select File
      </button>
    </div>
  );
};

export default UploadFile;
