import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"

const useCaseDocumentsStore = create((set) => ({
  case_documents: [],
  fetchCaseDocuments: async (caseId) => {
    try {
      const res = await axios.get(
        `${API_URL}/case-documents/?case_number=${caseId}`
      );
      set({ case_documents: res.data });
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  },
}));

export default useCaseDocumentsStore;
