'use client';

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, doc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 聊天房間 ID（假設固定為 chatRoom1）
  const chatRoomId = "chatRoom1";

  // 即時同步聊天訊息
  useEffect(() => {
    const chatRef = collection(db, "chats", chatRoomId, "messages");

    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      // Since we're listening to a collection, use snapshot.docs
      const messagesData = snapshot.docs.map(doc => doc.data());
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  // 發送訊息
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    const chatRef = doc(db, "chats", chatRoomId);
  
    // 為每條訊息創建一個單獨的文檔
    await addDoc(collection(chatRef, "messages"), {
      text: newMessage,
      senderId: "user1", // 這裡可以使用當前用戶的 ID
      timestamp: serverTimestamp(),
    });
  
    setNewMessage(""); // 清空輸入框
  };


  return (
    <div>
      <h1>聊天室</h1>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "400px", overflowY: "scroll" }}>
        {messages.map((message, index) => (
          <div key={index} style={{ margin: "5px 0" }}>
            <strong>{message.senderId}</strong>: {message.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="輸入訊息..."
      />
      <button type="button" onClick={sendMessage}>送出</button>
    </div>
  );
};

export default ChatPage;
