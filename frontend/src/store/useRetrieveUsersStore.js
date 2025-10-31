import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";


const API_URL = "http://127.0.0.1:8000/api";

export const getComplainants = async () => {
    const response = await axios.get(`${API_URL}/complainants`);
    return response.data;
}

export const useRetrieveUsersStore = create( (set) => ({
    complainantsUsers: [],
    fetchComplainants: async () => {
        try {
            const data = await getComplainants();
            set({ complainantsUsers: data })
        } catch (error) {
            toast.error(error);
        }
    }
}))