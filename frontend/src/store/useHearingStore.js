import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { getUser } from "./useCaseStore";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const LOCAL_STORAGE_KEY = "authData";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Helper function for retry logic
const withRetry = async (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isNetworkError = !error.response;
      const isServerError = error.response?.status >= 500;

      if ((isNetworkError || isServerError) && attempt < retries) {
        console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      throw error;
    }
  }
};

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
  error: null,

  // Clear error state
  clearError: () => set({ error: null }),

  fetchHearings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await withRetry(() => getHearings());
      set({ hearings: response, error: null });
      return { success: true };
    } catch (error) {
      const isNetworkError = !error.response;
      const errorMessage = isNetworkError
        ? "Network error. Please check your connection."
        : error.response?.data?.error || "Failed to fetch hearings";

      set({ error: { message: errorMessage, isNetworkError } });
      toast.error(errorMessage);
      return { success: false, retry: isNetworkError };
    } finally {
      set({ loading: false });
    }
  },

  fetchHearingsByCase: async (case_id) => {
    set({ loading: true, error: null });
    try {
      const response = await withRetry(() => getHearingsByCase(case_id));
      set({ hearings: response, error: null });
      return { success: true };
    } catch (error) {
      const isNetworkError = !error.response;
      const errorMessage = isNetworkError
        ? "Network error. Please check your connection."
        : "Failed to fetch case hearings";

      set({ error: { message: errorMessage, isNetworkError } });
      toast.error(errorMessage);
      return { success: false, retry: isNetworkError };
    } finally {
      set({ loading: false });
    }
  },

  updatedHearings: [],

  setUpdatedHearings: (hearings) => {
    set({ updatedHearings: hearings });
  },

  updateCaseHearings: async (case_id) => {
    const previousHearings = get().hearings; // Save for rollback
    set({ loading: true, error: null });

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

        return withRetry(() =>
          axios.put(`${API_URL}/update-single-hearing/${hearing.id}/`, payload)
        );
      });

      const responses = await Promise.all(updatePromises);
      const savedHearings = responses.map(res => res.data);

      toast.success("Hearings updated successfully");

      await get().fetchHearings();
      set({ updatedHearings: savedHearings, error: null });

      const resetHearings = hearings.filter(h => h.case_id !== case_id);
      set({ hearings: [...resetHearings, ...savedHearings] });

      return { success: true };
    } catch (error) {
      console.error(error);

      // Rollback on failure
      set({ hearings: previousHearings });

      const isNetworkError = !error.response;
      const errorMessage = isNetworkError
        ? "Network error. Changes reverted. Please check your connection."
        : "Failed to update hearings. Changes reverted.";

      set({ error: { message: errorMessage, isNetworkError } });
      toast.error(errorMessage);

      return { success: false, retry: isNetworkError };
    } finally {
      set({ loading: false });
    }
  },

}));

export default useHearingStore;

