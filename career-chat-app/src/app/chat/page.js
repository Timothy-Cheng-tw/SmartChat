"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "../../libs/firebase";
import { collection, doc, onSnapshot, addDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { useUser } from "@/contexts/userContext";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { FiCopy, FiEdit } from "react-icons/fi"; // Import copy and edit icons
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations

const ChatPage = () => {
  const { user, loading } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoom, setChatRoom] = useState("");
  const [joinChatRoom, setJoinChatRoom] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [customChatRoom, setCustomChatRoom] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const router = useRouter();
  const chatEndRef = useRef(null); // Ref to scroll to the bottom of the chat

  useEffect(() => {
    // Generate a random chat room name
    const generateRandomChatRoom = () => {
      return `chatRoom-${Math.random().toString(36).substring(2, 15)}`;
    };

    // Check if a chat room name is already stored in local storage
    let storedChatRoom = localStorage.getItem("chatRoom");
    if (!storedChatRoom) {
      // If not, generate a new one and store it
      storedChatRoom = generateRandomChatRoom();
      localStorage.setItem("chatRoom", storedChatRoom);
    }

    // Set the chat room name in the state
    setChatRoom(storedChatRoom);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (chatRoom) {
      const chatRef = collection(db, "chats", chatRoom, "messages");
      const orderedQuery = query(chatRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => doc.data());
        setMessages(messagesData);

        // Scroll to the bottom when new messages are added
        scrollToBottom();
      });

      return () => unsubscribe();
    }
  }, [chatRoom]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const chatRef = doc(db, "chats", chatRoom);
    await addDoc(collection(chatRef, "messages"), {
      text: newMessage,
      senderId: user.displayName,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent newline in the input field
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCopyChatRoomId = () => {
    navigator.clipboard.writeText(chatRoom).then(() => {
      alert("Chat room ID copied to clipboard!");
    });
  };

  const handleJoinChatRoom = () => {
    if (joinChatRoom.trim()) {
      setChatRoom(joinChatRoom);
      localStorage.setItem("chatRoom", joinChatRoom);
      setJoinChatRoom(""); // Clear the input field
      setJoinSuccess(true); // Show success message
      setTimeout(() => setJoinSuccess(false), 3000); // Hide success message after 3 seconds
    }
  };

  const handleSetCustomChatRoom = () => {
    if (customChatRoom.trim()) {
      setChatRoom(customChatRoom);
      localStorage.setItem("chatRoom", customChatRoom);
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Chat Room</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={joinChatRoom}
              onChange={(e) => setJoinChatRoom(e.target.value)}
              placeholder="Enter chat room ID"
              className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-black"
            />
            <button
              type="button"
              onClick={handleJoinChatRoom}
              className="px-4 py-2 bg-green-500 text-white font-medium rounded-full hover:bg-green-600 focus:ring-2 focus:ring-green-400"
            >
              Join
            </button>
            <button
              type="button"
              onClick={handleCopyChatRoomId}
              className="p-2 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
            >
              <FiCopy className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="p-2 bg-yellow-500 text-white font-medium rounded-full hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
            >
              <FiEdit className="w-5 h-5" />
            </button>
            <div className="text-sm opacity-80">
              {user ? `Logged in as: ${user.displayName}` : "Guest"}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-5 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium text-sm rounded-full shadow-lg hover:from-red-600 hover:to-pink-600 focus:ring-2 focus:ring-red-400 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 12h.008v.008H18v-.008zm0 0l-3-3m3 3l-3 3"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Chat Room ID Display */}
      <div className="bg-white shadow-md py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-700">
            Chat Room ID: <span className="text-indigo-600">{chatRoom}</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.senderId === user?.displayName ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`p-4 rounded-xl shadow-md max-w-xs ${message.senderId === user?.displayName
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-800"
                  }`}
              >
                <div className="text-sm opacity-70 mb-1">{message.senderId}</div>
                <div>{message.text}</div>
              </div>
            </div>
          ))}
          {/* Scroll to the bottom */}
          <div ref={chatEndRef}></div>
        </div>
      </main>

      {/* Message Input */}
      <footer className="bg-white shadow-md">
        <div className="container mx-auto p-4 flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress} // Listen for Enter key press
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="px-6 py-2 bg-indigo-500 text-white font-medium rounded-full hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400"
          >
            Send
          </button>
        </div>
      </footer>

      {/* Modal for setting custom chat room ID */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Set Custom Chat Room ID</h2>
            <input
              type="text"
              value={customChatRoom}
              onChange={(e) => setCustomChatRoom(e.target.value)}
              placeholder="Enter custom chat room ID"
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white font-medium rounded-full hover:bg-gray-600 focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetCustomChatRoom}
                className="px-4 py-2 bg-indigo-500 text-white font-medium rounded-full hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success message for joining chat room */}
      <AnimatePresence>
        {joinSuccess && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25, duration: 0.2 }} // Adjust duration as needed
            className="fixed inset-0 flex items-center justify-center"
          >
            <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
              Joined {chatRoom}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;