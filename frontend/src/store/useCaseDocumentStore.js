import { create } from "zustand";
import axios from "axios";

const useCaseDocumentsStore = create((set) => ({
  case_documents: [],
  fetchCaseDocuments: async (caseId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/case-documents/?case_number=${caseId}`
      );
      set({ case_documents: res.data });
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  },
}));

export default useCaseDocumentsStore;
