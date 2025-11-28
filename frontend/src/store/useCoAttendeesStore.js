import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useRetrieveUsersStore } from "./useRetrieveUsersStore";
const { fetchCaseCoRespondents, fetchCaseCoComplainants } = useRetrieveUsersStore.getState();

const API_URL = "http://127.0.0.1:8000/api";

export const getCoAttendee = async (id, type) => {
    const response = await axios.get(`${API_URL}/co-${type}/${id}/`);
    return response.data;
};

export const updateCoAttendee = async (id, type, data) => {
    const response = await axios.put(`${API_URL}/update-${type}/${id}/`, data);
    return response.data;
}

export const useCoAttendeesStore = create( (set) => ({
    fetchCoAttendee: async (id, type) => {
        try {
            await getCoAttendee(id, type);
        } catch (error) {
            toast.error(error);
        }
    },
    
    updateCoAttendeeInfo: async (co_attendees, id, type, coAttendeeData) => {
        try {
            const data = await updateCoAttendee(id, type, coAttendeeData);
            if (data) {
                if (type === "respondent") {
                    await fetchCaseCoRespondents(co_attendees);
                } else if (type === "complainant") {
                    await fetchCaseCoComplainants(co_attendees);
                }
                toast.success(`Co-${type} information updated successfully.`);
            }
            return;
        } catch (error) {
            toast.error(error);
        }
    }
    
}))