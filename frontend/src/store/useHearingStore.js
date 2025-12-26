import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { getUser } from "./useCaseStore";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
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

const useHearingStore = create((set, get) => ({
  hearings: [],
  loading: false,

  fetchHearings: async () => {
    set({ loading: true });
    try {
      const response = await getHearings();
      set({ hearings: response });
      
    } catch (error) {
      toast.error("Failed to fetch hearings", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchHearingsByCase: async (case_id) => {
        try {
            const response = await getHearingsByCase(case_id);

            set({ hearings: response });
            
        } catch (error) {
            toast.error("Failed to fetch case hearings", error);
        }
  },
  updatedHearings: [],

  setUpdatedHearings: (hearings) => {
    set({ updatedHearings: hearings });
  },

   updateCaseHearings: async (case_id) => {
        set({ loading: true }); // 2. Start Loading
        try {
            const { updatedHearings, hearings } = get();
            
            const updatePromises = updatedHearings.map((hearing) => {

              let localDateString = null;
              if (hearing.hearing_date) {
                  const d = new Date(hearing.hearing_date);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  localDateString = `${year}-${month}-${day}`;
              }

              const payload = {
                  ...hearing,
                  hearing_date: localDateString, 
                  time: hearing.time || null,
                  lupon_member: hearing.lupon_member
              };

            return axios.put(`${API_URL}/update-single-hearing/${hearing.id}/`, payload);

            });

            const responses = await Promise.all(updatePromises);

            const savedHearings = responses.map(res => res.data);

            toast.success("Hearings updated successfully");
            
            await get().fetchHearings();

            set({ updatedHearings: savedHearings });

            const resetHearings = hearings.filter(h => h.case_id !== case_id);

            set({ hearings: [...resetHearings, ...savedHearings] });

        } catch (error) {
            console.error(error);
            toast.error("Failed to update hearings");
        } finally {
            set({ loading: false });
        }
    },

}));

export default useHearingStore;
