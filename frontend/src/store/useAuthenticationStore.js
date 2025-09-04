import { create } from "zustand";

const useAuthenticationStore = create((set) => ({
    isAuthenticated: false,
    userRole: null, 
    userInfo: null, 
    login: (role, info) => set({ isAuthenticated: true, userRole: role, userInfo: info }),
    logout: () => set({ isAuthenticated: false, userRole: null, userInfo: null }),
    
}));

export default useAuthenticationStore;