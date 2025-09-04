import { create } from 'zustand'

const usePageStore = create((set) => ({
  currentPage: window.location.pathname.includes("Admin") ? "Dashboard" : "Home",
  
  setCurrentPage: (page) => set({ currentPage: page }),
}))

export default usePageStore