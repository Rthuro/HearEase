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

export const getCaseComplainants = async (ids) => {
    const response = await axios.post(`${API_URL}/case-complainant/`, {
        ids: ids
    });
    return response.data;
}

export const getCaseRespondents = async (ids) => {
    const response = await axios.post(`${API_URL}/case-respondent/`, {
        ids: ids
    });
    return response.data;
}

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/find-user`);
    return response.data.users;
}

export const getAdmins = async () => {
    const response = await axios.get(`${API_URL}/admins/`);
    return response.data;
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
    complainants: [],    
    fetchComplainants: async () => {
        try {
            const data = await getComplainants();
            set({ complainants: data })
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

    case_complainants: [],
    case_respondents: [],
    fetchCaseComplainants: async (ids) => {
        try {
            const data = await getCaseComplainants(ids);
            set({ case_complainants: data })
        } catch (error) {
            toast.error(error);
        }
    },
    fetchCaseRespondents: async (ids) => {
        try {
            const data = await getCaseRespondents(ids);
            set({ case_respondents: data })
        } catch (error) {
            toast.error(error);
        }
    },

    admin_list: [],
    fetchAdmins: async () => {
        try {
            const data = await getAdmins();
            set({ admin_list: data })
        } catch (error) {
            toast.error(error);
        }
    },
}))