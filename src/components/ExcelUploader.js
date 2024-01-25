import React, { useRef } from "react";

const ExcelUploader = ({ onFileUpload }) => {
	const fileInputRef = useRef(null);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		onFileUpload(file);
	};

	return (
		<div style={{ margin: "15px 60px" }}>
			<input
				type="file"
				onChange={handleFileChange}
				style={{ display: "none" }}
				ref={fileInputRef}
			/>
			<button
				style={{ padding: 5 }}
				type="button"
				onClick={() => fileInputRef.current.click()}
			>
				Select File
			</button>
		</div>
	);
};

export default ExcelUploader;
