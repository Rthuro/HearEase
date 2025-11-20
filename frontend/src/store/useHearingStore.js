import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { getUser } from "./useCaseStore";

const API_URL = "http://127.0.0.1:8000/api";
const LOCAL_STORAGE_KEY = "authData";

export const getHearings = async () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const data = JSON.parse(stored);

    const userData = await getUser();

    const response = await axios.get(`${API_URL}/hearings/`, {
        params: { 
          role: data.userRole,
          first_name: userData.user.first_name,
          last_name: userData.user.last_name
        }
    });

  return response.data;
};

export const getHearingsByCase = async (case_id) => {

    const response = await axios.get(`${API_URL}/hearing-cases/`, {
        params: { case_id: case_id }
    });
  return response.data;
};

const useHearingStore = create((set) => ({
  hearings: [],

  fetchHearings: async () => {
    try {
      const response = await getHearings();
      set({ hearings: response });
    } catch (error) {
      toast.error("Failed to fetch hearings", error);
    }
  },

  fetcHearingsByCase: async (case_id) => {
        try {
            const response = await getHearingsByCase(case_id);

            set({ hearings: response });
            
        } catch (error) {
            toast.error("Failed to fetch case hearings", error);
        }
  },

}));

export default useHearingStore;
