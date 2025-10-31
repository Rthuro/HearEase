import { create } from "zustand";

export const useAddressesStore = create((set) => ({
  barangays: [],
  loading: false,
  error: null,

  fetchBarangays: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("http://127.0.0.1:8000/api/barangays/");
      const data = await res.json();
      set({ barangays: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
