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
      email: userData.email
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

export const updateHearingProgress = async (hearingId, payload) => {
  const response = await axios.put(`${API_URL}/hearing-progress-update/${hearingId}/`, payload);
  return response.data;
};

export const getHearingAttendance = async (hearingId) => {
  const response = await axios.get(`${API_URL}/hearing-attendance/`, {
    params: { hearing_id: hearingId }
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

  // Non-Working Day Management
  nonWorkingDays: [],
  nonWorkingDaysLoading: false,

  fetchNonWorkingDays: async (month = null) => {
    set({ nonWorkingDaysLoading: true });
    try {
      const params = month ? { month } : {};
      const response = await axios.get(`${API_URL}/non-working-days/`, { params });
      set({ nonWorkingDays: response.data.non_working_days || [] });
      return response.data;
    } catch (error) {
      console.error("Error fetching non-working days:", error);
      return null;
    } finally {
      set({ nonWorkingDaysLoading: false });
    }
  },

  markNonWorkingDay: async (date, reason, description) => {
    set({ nonWorkingDaysLoading: true });
    try {
      const response = await axios.post(`${API_URL}/non-working-day/`, {
        date,
        reason,
        description
      });

      if (response.data.success) {
        // Refresh non-working days list
        await get().fetchNonWorkingDays();
        // Refresh hearings to reflect rescheduled ones
        await get().fetchHearings();

        const count = response.data.rescheduled_count;
        if (count > 0) {
          toast.success(`Day marked as non-working. ${count} hearing(s) rescheduled.`);
        } else {
          toast.success("Day marked as non-working.");
        }
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error marking non-working day:", error);
      toast.error(error.response?.data?.error || "Failed to mark day as non-working");
      return null;
    } finally {
      set({ nonWorkingDaysLoading: false });
    }
  },
  fetchHearingAttendance: async (hearingId) => {
    try {
      const response = await getHearingAttendance(hearingId);
      return { success: true, data: response };
    } catch (error) {
      const isNetworkError = !error.response;
      const errorMessage = isNetworkError
        ? "Network error. Please check your connection."
        : "Failed to fetch hearing attendance";
      toast.error(errorMessage);
      return { success: false, retry: isNetworkError };
    }
  },

  removeNonWorkingDay: async (date) => {
    try {
      const response = await axios.delete(`${API_URL}/non-working-day/${date}/`);
      if (response.data.success) {
        await get().fetchNonWorkingDays();
        toast.success("Non-working day removed");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing non-working day:", error);
      toast.error(error.response?.data?.error || "Failed to remove non-working day");
      return false;
    }
  },

}));

export default useHearingStore;

