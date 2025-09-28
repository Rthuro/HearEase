import { create } from "zustand";

const useAuthenticationStore = create((set) => ({
    isAuthenticated: false,
    userRole: null, 
    userInfo: null, 
    userLinkName: null,
    login: (role, info) => set({ isAuthenticated: true, userRole: role, userInfo: info, userLinkName: 'u/@' + info.name.replace(" ", "_") }),
    logout: () => set({ isAuthenticated: false, userRole: null, userInfo: null, userLinkName: null }),

}));

export default useAuthenticationStore;