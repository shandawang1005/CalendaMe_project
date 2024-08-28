// import EmojiPicker from "emoji-picker-react";
// import Modal from "react-modal";
// import "./EmojiPickerModal.css"; // Custom CSS for positioning

// const EmojiPickerModal = ({ onEmojiSelect, isOpen, onRequestClose }) => {
//   const handleEmojiClick = (emojiObject) => {
//     if (emojiObject && emojiObject.emoji) {
//       onEmojiSelect(emojiObject.emoji);
//     } else {
//       console.error("Emoji data is not correctly structured:", emojiObject);
//     }
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onRequestClose}
//       contentLabel="Emoji Picker"
//       className="emoji-picker-modal"
//       overlayClassName="emoji-picker-overlay"
//       style={{
//         content: {
//           position: "relative",
//           top: "auto", // Position relative to parent container
//           left: "auto", // Adjust based on where you want it
//           right: "auto",
//           bottom: "auto",
//           width: "350px",
//           height: "450px",
//           backgroundColor: "white",
//           borderRadius: "12px",
//           zIndex: 1000,
//         },
//         overlay: {
//           backgroundColor: "transparent", // Transparent background so it doesn't block the rest of the UI
//         },
//       }}
//     >
//       <EmojiPicker onEmojiClick={handleEmojiClick} />
//     </Modal>
//   );
// };

// export default EmojiPickerModal;
