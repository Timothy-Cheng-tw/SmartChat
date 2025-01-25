"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "../../libs/firebase";
import { collection, doc, onSnapshot, addDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { useUser } from "@/contexts/userContext";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";

const ChatPage = () => {
  const { user, loading } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const chatEndRef = useRef(null); // Ref to scroll to the bottom of the chat

  const chatRoomId = "chatRoom1";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const chatRef = collection(db, "chats", chatRoomId, "messages");
    const orderedQuery = query(chatRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => doc.data());
      setMessages(messagesData);

      // Scroll to the bottom when new messages are added
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const chatRef = doc(db, "chats", chatRoomId);
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

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.senderId === user?.displayName ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-4 rounded-xl shadow-md max-w-xs ${
                  message.senderId === user?.displayName
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
    </div>
  );
};

export default ChatPage;
