import { create } from "zustand";
import axios from "axios";

const LOCAL_STORAGE_KEY = "authData";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";


const useAuthenticationStore = create((set) => ({
  isAuthenticated: false,
  userRole: null,
  userInfo: null,
  userLinkName: null,
  username: null,

  // Initialize from localStorage
  initializeAuth: () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      set({
        isAuthenticated: true,
        userRole: data.userRole,
        userInfo: data.userInfo,
        userLinkName: data.userLinkName,
        username: data.username,
      });
    }
  },

  getLocalInfo: () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (stored) {
      const data = JSON.parse(stored);
      set({
        isAuthenticated: true,
        userRole: data.userRole,
        userInfo: data.userInfo,
        userLinkName: data.userLinkName,
        username: data.username,
      });
      return data
    }
    return;
  },
  // Login and save to localStorage
  login: (role, info) => {
    const authData = {
      isAuthenticated: true,
      userRole: role,
      userInfo: info,
      userLinkName: "u/@" + info.email.split("@")[0],
      username: info.email.split("@")[0],
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authData));

    set({
      isAuthenticated: true,
      userRole: role,
      userInfo: info,
      userLinkName: role === "admin" ? "/Admin" : "u/@" + info.email.split("@")[0],
      username: info.email.split("@")[0],
    });
  },

  // Logout and clear localStorage
  logout: async () => {
    // Get user email before clearing to disconnect Google Calendar
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Disconnect Google Calendar for this user (fire and forget)
        axios.post(`${API_URL}/google-calendar/disconnect/`, {
          email: data.userInfo?.email
        }).catch(() => { }); // Ignore errors silently
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({
      isAuthenticated: false,
      userRole: null,
      userInfo: null,
      userLinkName: null,
      username: null,
    });
  },

  googleLogin: async (token) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google/`, {
        token: token
      });
      const user = res.data.user;
      useAuthenticationStore.getState().login(user.role, user);
      return user;
    }
    catch (err) {
      console.error("Google login failed:", err);
      return false;
    }
  },

  googleSignUp: async (token) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google/`, {
        token: token
      });
      const user = res.data.user;
      useAuthenticationStore.getState().login(user.role, user);
      return user;
    }
    catch (err) {
      console.error("Google sign-up failed:", err);
      return false;
    }
  },

}));

export default useAuthenticationStore;