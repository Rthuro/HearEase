import axios from "axios";
import { create } from "zustand";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    return {
        headers: { Authorization: `Token ${data?.userInfo?.token}` },
    };
};

export const useTicketStore = create((set, get) => ({
    tickets: [],
    allTickets: [],
    loading: false,

    // User: fetch own tickets
    fetchMyTickets: async () => {
        set({ loading: true });
        try {
            const res = await axios.get(`${API_URL}/tickets/`, getAuthHeaders());
            set({ tickets: res.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
            toast.error("Failed to load your tickets.");
            set({ loading: false });
        }
    },

    // User: create a new ticket
    createTicket: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/tickets/`, data, getAuthHeaders());
            set((state) => ({ tickets: [res.data, ...state.tickets] }));
            toast.success("Ticket submitted successfully!");
            return res.data;
        } catch (error) {
            console.error("Failed to create ticket:", error);
            toast.error("Failed to submit ticket.");
            throw error;
        }
    },

    // Admin: fetch all tickets
    fetchAllTickets: async (statusFilter) => {
        set({ loading: true });
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const res = await axios.get(`${API_URL}/tickets/all/`, {
                ...getAuthHeaders(),
                params,
            });
            set({ allTickets: res.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch all tickets:", error);
            toast.error("Failed to load tickets.");
            set({ loading: false });
        }
    },

    // Admin: update ticket status
    updateTicketStatus: async (ticketId, status, adminReason) => {
        try {
            const res = await axios.put(
                `${API_URL}/tickets/${ticketId}/action/`,
                { status, admin_reason: adminReason || "" },
                getAuthHeaders()
            );
            // Update in both lists
            set((state) => ({
                allTickets: state.allTickets.map((t) =>
                    t.id === ticketId ? res.data : t
                ),
                tickets: state.tickets.map((t) =>
                    t.id === ticketId ? res.data : t
                ),
            }));
            toast.success(`Ticket #${ticketId} updated to "${status}".`);
            return res.data;
        } catch (error) {
            console.error("Failed to update ticket:", error);
            toast.error("Failed to update ticket.");
            throw error;
        }
    },
}));
