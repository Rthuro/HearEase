import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const getComplainants = async () => {
    const response = await axios.get(`${API_URL}/case-persons/`, {
        params: { type: "complainant" }
    });
    return response.data;
}

export const getRespondents = async () => {
    const response = await axios.get(`${API_URL}/case-persons/`, {
        params: { type: "respondent" }
    });
    return response.data;
}

export const getCaseComplainants = async (ids) => {
    const response = await axios.post(`${API_URL}/case-persons/`, {
        ids: ids
    });
    return response.data;
}

export const getCaseRespondents = async (ids) => {
    const response = await axios.post(`${API_URL}/case-persons/`, {
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
    const response = await axios.post(`${API_URL}/find-user/`, {
        email: email
    });
    return response.data.user;
}
export const getCasePersonById = async (id) => {
    const response = await axios.get(`${API_URL}/case-person-details/${id}/`);
    return response.data;
}
export const getCasePersonByEmail = async (email) => {
    const response = await axios.get(`${API_URL}/case-person/${email}/`);
    return response.data;
}
export const updateCasePersonById = async (id, data) => {
    const response = await axios.put(`${API_URL}/case-person-details/${id}/`, data);
    return response.data;
}

export const useRetrieveUsersStore = create((set) => ({
    complainants: [],
    fetchComplainants: async () => {
        try {
            const data = await getComplainants();
            set({ complainants: data })
        } catch (error) {
            toast.error(error.message || "Failed to fetch complainants");
        }
    },
    userInformation: null,
    fetchUser: async (email) => {
        try {
            const data = await getUser(email);
            set({ userInformation: data })
        } catch (error) {
            toast.error(error.message || "Failed to fetch user");
        }
    },
    users: [],
    fetchUsers: async () => {
        try {
            const data = await getUsers();
            set({ users: data })
        } catch (error) {
            toast.error(error.message || "Failed to fetch users");
        }
    },
    respondents: [],
    fetchRespondents: async () => {
        try {
            const data = await getRespondents();
            set({ respondents: data })
        } catch (error) {
            toast.error(error.message || "Failed to fetch respondents");
        }
    },

    case_complainants: [],
    case_respondents: [],
    fetchCaseComplainants: async (ids) => {
        try {
            if (!ids || ids.length === 0) {
                set({ case_complainants: [] });
                return;
            }
            const data = await getCaseComplainants(ids);
            set({ case_complainants: data })
        } catch (error) {
            console.error("Error fetching case complainants:", error);
            set({ case_complainants: [] });
        }
    },
    fetchCaseRespondents: async (ids) => {
        try {
            if (!ids || ids.length === 0) {
                set({ case_respondents: [] });
                return;
            }
            const data = await getCaseRespondents(ids);
            set({ case_respondents: data })
        } catch (error) {
            console.error("Error fetching case respondents:", error);
            set({ case_respondents: [] });
        }
    },

    admin_list: [],
    fetchAdmins: async () => {
        try {
            const data = await getAdmins();
            set({ admin_list: data })
            return data
        } catch (error) {
            toast.error(error.message || "Failed to fetch admins");
        }
    },

    fetchCasePersonById: async (id) => {
        try {
            const data = await getCasePersonById(id);
            return data;
        }
        catch (error) {
            toast.error(error.message || "Failed to fetch case person details");
            return null;
        }
    },

    fetchCasePersonByEmail: async (email) => {
        try {
            const data = await getCasePersonByEmail(email);
            return data;
        }
        catch (error) {
            toast.error(error.message || "Failed to fetch case person details");
            return null;
        }
    },
}))