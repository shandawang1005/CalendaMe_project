// Action Types
const FETCH_FILES_REQUEST = "FETCH_FILES_REQUEST";
const FETCH_FILES_SUCCESS = "FETCH_FILES_SUCCESS";
const FETCH_FILES_FAILURE = "FETCH_FILES_FAILURE";
const DELETE_FILE_REQUEST = "DELETE_FILE_REQUEST";
const DELETE_FILE_SUCCESS = "DELETE_FILE_SUCCESS";
const DELETE_FILE_FAILURE = "DELETE_FILE_FAILURE";
const UPLOAD_FILE_REQUEST = "UPLOAD_FILE_REQUEST"; // Add this
const UPLOAD_FILE_SUCCESS = "UPLOAD_FILE_SUCCESS"; // Add this
const UPLOAD_FILE_FAILURE = "UPLOAD_FILE_FAILURE"; // Add this
const SHARE_FILE_REQUEST = "SHARE_FILE_REQUEST"; // Add this
const SHARE_FILE_SUCCESS = "SHARE_FILE_SUCCESS"; // Add this
const SHARE_FILE_FAILURE = "SHARE_FILE_FAILURE"; // Add this

// Fetch Files Actions
export const fetchFilesRequest = () => ({
  type: FETCH_FILES_REQUEST,
});

export const fetchFilesSuccess = (files) => ({
  type: FETCH_FILES_SUCCESS,
  payload: files,
});

export const fetchFilesFailure = (error) => ({
  type: FETCH_FILES_FAILURE,
  payload: error,
});

// Delete File Actions
export const deleteFileRequest = () => ({
  type: DELETE_FILE_REQUEST,
});

export const deleteFileSuccess = (fileId) => ({
  type: DELETE_FILE_SUCCESS,
  payload: fileId,
});

export const deleteFileFailure = (error) => ({
  type: DELETE_FILE_FAILURE,
  payload: error,
});

// Upload File Actions
export const uploadFileRequest = () => ({
  type: UPLOAD_FILE_REQUEST,
});

export const uploadFileSuccess = (fileUrl) => ({
  type: UPLOAD_FILE_SUCCESS,
  payload: fileUrl,
});

export const uploadFileFailure = (error) => ({
  type: UPLOAD_FILE_FAILURE,
  payload: error,
});

// Share File Actions
export const shareFileRequest = () => ({
  type: SHARE_FILE_REQUEST,
});

export const shareFileSuccess = () => ({
  type: SHARE_FILE_SUCCESS,
});

export const shareFileFailure = (error) => ({
  type: SHARE_FILE_FAILURE,
  payload: error,
});

// Thunk to Delete a File
export const deleteFile = (fileId, fileUrl) => async (dispatch) => {
  dispatch(deleteFileRequest());

  try {
    const response = await fetch("/api/aws/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_id: fileId, file_url: fileUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete file");
    }

    dispatch(deleteFileSuccess(fileId));
  } catch (error) {
    dispatch(deleteFileFailure(error.message || "Delete file failed"));
  }
};

// Thunk to Fetch Files
export const fetchFiles = (friendId) => async (dispatch) => {
  dispatch(fetchFilesRequest());

  try {
    const response = await fetch(`/api/aws/files?friend_id=${friendId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }

    const data = await response.json();
    dispatch(fetchFilesSuccess(data.files));
  } catch (error) {
    dispatch(fetchFilesFailure(error.message || "Fetch files failed"));
  }
};

// Thunk to Upload and Share the File
export const uploadAndShareFile = (file, friendId) => async (dispatch) => {
  dispatch(uploadFileRequest());

  const formData = new FormData();
  formData.append("file", file);

  try {
    // Upload the file to AWS S3
    const uploadResponse = await fetch("/api/aws/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("File upload failed");
    }

    const uploadData = await uploadResponse.json();
    const fileUrl = uploadData.file_url;
    dispatch(uploadFileSuccess(fileUrl));

    // After successful upload, share the file with the friend by storing the info in your backend
    dispatch(shareFileRequest());

    const shareResponse = await fetch("/api/aws/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_url: fileUrl,
        friend_id: friendId,
      }),
    });

    if (!shareResponse.ok) {
      throw new Error("File sharing failed");
    }

    dispatch(shareFileSuccess());
  } catch (error) {
    dispatch(uploadFileFailure(error.message || "Upload failed"));
    dispatch(shareFileFailure(error.message || "Share failed"));
  }
};

const initialState = {
  uploading: false,
  fileUrl: "",
  error: null,
  sharing: false,
  shareError: null,
  files: [],
  filesLoading: false,
  filesError: null,
  deleting: false,
  deleteError: null,
};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    // Existing cases for uploading and sharing files
    case FETCH_FILES_REQUEST:
      return {
        ...state,
        filesLoading: true,
        filesError: null,
      };
    case FETCH_FILES_SUCCESS:
      return {
        ...state,
        filesLoading: false,
        files: action.payload,
      };
    case FETCH_FILES_FAILURE:
      return {
        ...state,
        filesLoading: false,
        filesError: action.payload,
      };
    case DELETE_FILE_REQUEST:
      return {
        ...state,
        deleting: true,
        deleteError: null,
      };
    case DELETE_FILE_SUCCESS:
      return {
        ...state,
        deleting: false,
        files: state.files.filter((file) => file.id !== action.payload),
      };
    case DELETE_FILE_FAILURE:
      return {
        ...state,
        deleting: false,
        deleteError: action.payload,
      };
    case UPLOAD_FILE_REQUEST:
      return {
        ...state,
        uploading: true,
        error: null,
      };
    case UPLOAD_FILE_SUCCESS:
      return {
        ...state,
        uploading: false,
        fileUrl: action.payload,
      };
    case UPLOAD_FILE_FAILURE:
      return {
        ...state,
        uploading: false,
        error: action.payload,
      };
    case SHARE_FILE_REQUEST:
      return {
        ...state,
        sharing: true,
        shareError: null,
      };
    case SHARE_FILE_SUCCESS:
      return {
        ...state,
        sharing: false,
      };
    case SHARE_FILE_FAILURE:
      return {
        ...state,
        sharing: false,
        shareError: action.payload,
      };
    default:
      return state;
  }
};

export default fileReducer;
