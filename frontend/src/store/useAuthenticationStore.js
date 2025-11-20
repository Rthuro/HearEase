import { create } from "zustand";

// const useAuthenticationStore = create((set) => ({
//     isAuthenticated: false,
//     userRole: null, 
//     userInfo: null, 
//     userLinkName: null,
//     username:null,
//     login: (role, info) => set({ isAuthenticated: true, userRole: role, userInfo: info, userLinkName: 'u/@' + info.email, username: info.email.split("@")[0] }),
//     logout: () => set({ isAuthenticated: false, userRole: null, userInfo: null, userLinkName: null, username: null }),

// }));

// export default useAuthenticationStore;

const LOCAL_STORAGE_KEY = "authData";

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

      return  data
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
      ...authData,
    });
  },

  // Logout and clear localStorage
  logout: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({
      isAuthenticated: false,
      userRole: null,
      userInfo: null,
      userLinkName: null,
      username: null,
    });
  },
}));

export default useAuthenticationStore;