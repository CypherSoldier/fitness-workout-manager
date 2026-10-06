// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";

export const useAuth = () => {
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  const [jwtUser, setJwtUser] = useState(null);
  const [jwtLoading, setJwtLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchCurrentUser(token);
    } else {
      setJwtLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await response.json();
      setJwtUser(userData);
    } catch (error) {
      console.error("Error fetching current user:", error);
      localStorage.removeItem("accessToken");
      setJwtUser(null);
    } finally {
      setJwtLoading(false);
    }
  };

  const loginWithJWT = (token) => {
    localStorage.setItem("accessToken", token);
    fetchCurrentUser(token);
  };

  const logout = async () => {
    if (firebaseUser) {
      await auth.signOut();
    }
    if (jwtUser) {
      localStorage.removeItem("accessToken");
      setJwtUser(null);
    }
  };

  return {
    user: firebaseUser || jwtUser,
    isFirebaseUser: !!firebaseUser,
    isJWTUser: !!jwtUser,
    loading: firebaseLoading || jwtLoading,
    loginWithJWT,
    logout,
  };
};
