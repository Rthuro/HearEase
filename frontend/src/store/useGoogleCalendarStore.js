import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const useGoogleCalendarStore = create((set, get) => ({
    connected: false,
    connectedUser: null,
    calendarId: null,
    loading: false,
    syncing: false,
    lastUpdated: null,

    // Sync settings state
    syncSettings: null,

    // Holidays state
    holidays: [],
    holidaysLoading: false,

    // Check connection status
    checkStatus: async () => {
        set({ loading: true });
        try {
            const response = await axios.get(`${API_URL}/google-calendar/status/`);
            set({
                connected: response.data.connected,
                connectedUser: response.data.connected_user || null,
                calendarId: response.data.calendar_id || null,
                lastUpdated: response.data.last_updated || null,
                loading: false,
            });
            return response.data;
        } catch (error) {
            console.error("Error checking Google Calendar status:", error);
            set({ loading: false });
            return null;
        }
    },

    // Get OAuth URL and redirect
    connectGoogleCalendar: async () => {
        set({ loading: true });
        try {
            const response = await axios.get(`${API_URL}/google-calendar/auth-url/`);
            const authUrl = response.data.auth_url;

            // Redirect to Google OAuth
            window.location.href = authUrl;
        } catch (error) {
            console.error("Error getting auth URL:", error);
            toast.error("Failed to connect to Google Calendar");
            set({ loading: false });
        }
    },

    // Disconnect Google Calendar
    disconnect: async () => {
        set({ loading: true });
        try {
            await axios.post(`${API_URL}/google-calendar/disconnect/`);
            set({
                connected: false,
                connectedUser: null,
                calendarId: null,
                lastUpdated: null,
                loading: false,
            });
            toast.success("Google Calendar disconnected");
        } catch (error) {
            console.error("Error disconnecting:", error);
            toast.error("Failed to disconnect");
            set({ loading: false });
        }
    },

    // Sync all hearings
    syncAll: async () => {
        set({ syncing: true });
        try {
            const response = await axios.post(`${API_URL}/google-calendar/sync-all/`);
            const { synced, total, errors } = response.data;

            if (errors && errors.length > 0) {
                console.error("Sync errors:", errors);
                // Show first 3 errors max
                const errorPreview = errors.slice(0, 3).join(", ");
                toast.error(`Synced ${synced}/${total} hearings with some errors: ${errorPreview}`);
            } else if (synced === 0 && total > 0) {
                toast.error(`Failed to sync any hearings (0/${total})`);
            } else {
                toast.success(`Successfully synced ${synced} hearings to Google Calendar!`);
            }

            set({ syncing: false });
            return response.data;
        } catch (error) {
            console.error("Error syncing:", error.response?.data || error);
            toast.error(error.response?.data?.error || "Failed to sync hearings");
            set({ syncing: false });
            return null;
        }
    },

    // Fetch sync settings
    fetchSyncSettings: async () => {
        try {
            const response = await axios.get(`${API_URL}/google-calendar/sync-settings/`);
            set({ syncSettings: response.data });
            return response.data;
        } catch (error) {
            console.error("Error fetching sync settings:", error);
            // If no settings exist, use defaults
            set({
                syncSettings: {
                    auto_sync_enabled: false,
                    sync_on_create: true,
                    sync_on_update: true,
                    sync_on_delete: true,
                }
            });
            return null;
        }
    },

    // Update sync settings
    updateSyncSettings: async (updates) => {
        try {
            const currentSettings = get().syncSettings || {};
            const newSettings = { ...currentSettings, ...updates };

            const response = await axios.put(`${API_URL}/google-calendar/sync-settings/`, newSettings);
            set({ syncSettings: response.data });
            toast.success("Sync settings updated");
            return response.data;
        } catch (error) {
            console.error("Error updating sync settings:", error);
            toast.error("Failed to update sync settings");
            return null;
        }
    },

    // Fetch Philippine holidays for calendar display
    fetchHolidays: async (month, year) => {
        set({ holidaysLoading: true });
        try {
            const params = new URLSearchParams();
            if (month) params.append("month", month);
            if (year) params.append("year", year);

            const response = await axios.get(`${API_URL}/google-calendar/holidays/?${params.toString()}`);
            set({
                holidays: response.data.holidays || [],
                holidaysLoading: false
            });
            return response.data.holidays;
        } catch (error) {
            console.error("Error fetching holidays:", error);
            set({ holidaysLoading: false });
            return [];
        }
    },
}));
