import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const LOCAL_STORAGE_KEY = "authData";

export const useSystemConfigStore = create((set, get) => ({
    updateCaseType: async (caseTypeId, updatedData) => {
        try {
            const response = await axios.put(`${API_URL}/case-types/${caseTypeId}/`, updatedData);
            return response.data;
        } catch (error) {
            console.error("Failed to update case type:", error);
            throw error;
        }
    },
    updateSettlementType: async (settlementTypeId, updatedData) => {
        try {
            const response = await axios.put(`${API_URL}/settlement-types/${settlementTypeId}/`, updatedData);
            return response.data;
        } catch (error) {
            console.error("Failed to update settlement type:", error);
            throw error;
        }
    },
    addCaseType: async (newCaseTypeData) => {
        try {
            const response = await axios.post(`${API_URL}/case-types/`, newCaseTypeData);
            return response.data;
        } catch (error) {
            console.error("Failed to add case type:", error);
            throw error;
        }
    },
    addSettlementType: async (newSettlementTypeData) => {
        try {
            const response = await axios.post(`${API_URL}/settlement-types/`, newSettlementTypeData);
            return response.data;
        } catch (error) {
            console.error("Failed to add settlement type:", error);
            throw error;
        }
    },
    deleteSystemConfig: async (configType, configId) => {
        try {
            const endpoint = configType === "caseType" ? "case-types" : "settlement-types";
            await axios.delete(`${API_URL}/${endpoint}/${configId}/`);
            return { success: true };
        } catch (error) {
            console.error(`Failed to delete ${configType}:`, error);
            throw error;
        }
    }
}));