import { create } from "zustand";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const getBarangays = async () => {
  const response = await axios.get(`${API_URL}/barangays/`);
  return response.data;
};

export const getStreets = async () => {
  const response = await axios.get(`${API_URL}/streets/`);
  return response.data;
}

export const useAddressesStore = create((set) => ({
  barangays: [],
  streets: [],
  loading: false,
  error: null,

  fetchBarangays: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getBarangays();
      set({ barangays: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  fetchStreets: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getStreets();
      set({ streets: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
