import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const useAIModelStore = create((set, get) => ({
    // Status
    status: null,
    loading: false,
    retraining: false,
    error: null,

    // Fetch training status
    fetchStatus: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/training-status/`);
            set({ status: response.data, loading: false });
            return response.data;
        } catch (error) {
            console.error("Error fetching training status:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch status",
                loading: false
            });
            return null;
        }
    },

    // Trigger manual retrain
    triggerRetrain: async () => {
        set({ retraining: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/trigger-retrain/`, {
                force: true
            });

            // Refresh status after training
            await get().fetchStatus();

            set({ retraining: false });
            return response.data;
        } catch (error) {
            console.error("Error triggering retrain:", error);
            set({
                error: error.response?.data?.message || error.response?.data?.error || "Retrain failed",
                retraining: false
            });
            return { success: false, error: error.response?.data };
        }
    },

    // Update configuration
    updateConfig: async (config) => {
        try {
            const response = await axios.post(`${API_URL}/retrain-config/`, config);

            // Refresh status
            await get().fetchStatus();

            return response.data;
        } catch (error) {
            console.error("Error updating config:", error);
            set({ error: error.response?.data?.error || "Failed to update config" });
            return { success: false };
        }
    },

    // Clear error
    clearError: () => set({ error: null })
}));
