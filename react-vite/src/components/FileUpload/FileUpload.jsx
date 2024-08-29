import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "../store/actions/fileActions";
import "./FileUpload.css";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  // Access the upload state from the Redux store
  const { uploading, fileUrl, error } = useSelector((state) => state.file);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload when the form is submitted
  const handleUpload = (e) => {
    e.preventDefault();
    if (file) {
      dispatch(uploadFile(file));
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload a File</h3>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {fileUrl && (
        <div className="success-message">
          <p>File uploaded successfully!</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
