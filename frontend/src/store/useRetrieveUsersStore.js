import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";


const API_URL = "http://127.0.0.1:8000/api";

export const getComplainants = async () => {
    const response = await axios.get(`${API_URL}/complainants`);
    return response.data;
}

export const getRespondents = async () => {
    const response = await axios.get(`${API_URL}/respondents`);
    return response.data;
}

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/find-user`);
    return response.data.users;
}

export const getUser = async (email) => {
    const response = await axios.post(`${API_URL}/find-user`, { 
        email: email
     });
    return response.data.user;
}

export const getCaseCoRespondents = async (corespondent_ids) => {
    const response = await axios.post(`${API_URL}/get-case-co-respondents/`, {
        ids: corespondent_ids
    });
    return response.data;
}
export const getCaseCoComplainants = async (cocomplainant_ids) => {
    const response = await axios.post(`${API_URL}/get-case-co-complainants/`, {
        ids: cocomplainant_ids
    });
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
    },
    users: [],
    fetchUsers: async () => {
        try {
            const data = await getUsers();
            set({ users: data })
        } catch (error) {
            toast.error(error);
        }
    },
    respondents: [],
    fetchRespondents: async () => {
        try {
            const data = await getRespondents();
            set({ respondents: data })
        } catch (error) {
            toast.error(error);
        }
    },
    caseCoComplainants:[],
    fetchCaseCoComplainants: async (Ids) => {
        try {
            const data = await getCaseCoComplainants(Ids);
            set({ caseCoComplainants: data });
        } catch (error) {
            toast.error(error);
        }
    },
    caseCoRespondents:[],
    fetchCaseCoRespondents: async (Ids) => {
        try {
            const data = await getCaseCoRespondents(Ids);
            set({ caseCoRespondents: data });
        } catch (error) {
            toast.error(error);
        }
    },
}))