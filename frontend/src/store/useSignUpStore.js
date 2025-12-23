import axios from "axios";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import useAuthenticationStore from "./useAuthenticationStore"; 

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const checkSignUpEmail = async (email) => {

  try {
    const res = await axios.post(`${API_BASE_URL}/check-email/`, {
      email
    });

    if (res.data.error) {
        toast.error(res.data.error);
        return false;
    }

    // toast.success(res.data.message || "Email is available");
    return true;
  } catch (err) {
    toast.error(
        err.response?.data?.error
    );
    return false;
  }

};

const setUserLogin = (userInfo) => {
    const { login } = useAuthenticationStore.getState();
    login(userInfo.role, userInfo);
}

export const useSignUpStore = create((set, get) => ({

    formData: {
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        birth_date: null,
        contact_number: "",
        sex: "",
        barangay: "Tetuan",
        street: "",
        additional_info: "",
        is_user: true,
    },

    resetFormData: () => {
        set({
            formData: {
                email: "",
                password: "",
                first_name: "",
                last_name: "",
                middle_name: "",
                birth_date: null,
                contact_number: null,
                sex: "",
                barangay: "Tetuan",
                street: "",
                additional_info: "",
            }
        });
    },

    setFormData: (field, value) => {
        set((state) => ({
            formData: {
                ...state.formData,
                [field]: value
            }
        }));
    },

    registerUser: async () => {
        const { formData } = get();
        try {
            const res = await axios.post(`${API_BASE_URL}/register/`, {
                username: formData.email,
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                is_user: formData.is_user,
            });

            if (res.data.error) {
                toast.error(res.data.error);
                return false;
            }
            
            get().resetFormData();
            setUserLogin(res.data.user);
            toast.success("Registration successful");

            return true;
        } catch (err) {
            toast.error(
                err.response?.data?.error
            );
            return false;
        }
    },

    updateUser: async (userId) => {
        const { formData } = get();
        try {
            const res = await axios.put(`${API_BASE_URL}/update-user/${userId}/`, {
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                middle_name: formData.middle_name,
                birth_date: formData.birth_date.toISOString().split("T")[0],
                contact_number: formData.contact_number,
                sex: formData.sex,
                barangay: formData.barangay,
                street: formData.street,
                additional_info: formData.additional_info,
            });
            
            if (res.data.error) {
                toast.error(res.data.error);
                return false;
            }

            toast.success("User information updated successfully");
            return true;

        } catch (err) {
            toast.error(
                err.response?.data?.error
            );
            return false;
        }  
    }

}));