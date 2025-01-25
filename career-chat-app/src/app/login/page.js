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
  }, []);

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
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>聊天室</h1>
      {!user ? (
        <button onClick={handleGoogleLogin}>Login with Google</button>
      ) : (
        <div>
          <p>Welcome, {user.displayName}</p>
          <img src={user.photoURL} alt="User Avatar" style={{ width: 50, height: 50, borderRadius: "50%" }} />
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      {/* Chat UI can go here */}
    </div>
  );
};

export default ChatPage;
