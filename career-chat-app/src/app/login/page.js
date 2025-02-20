'use client';

import { useEffect, useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track the loading state

  const provider = new GoogleAuthProvider(); // Google Auth provider
  const router = new useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once the user state is updated
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [auth]);

  // Google Login Function
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      setUser(loggedInUser); // Set the logged-in user
      router.push("/chat");
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the user state
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  // Show loading state while Firebase is checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">聊天室</h1>
        {!user ? (
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Login with Google
          </button>
        ) : (
          <div className="text-center">
            <p className="mb-4">Welcome, {user.displayName}</p>
            <img
              src={user.photoURL}
              alt="User Avatar"
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;