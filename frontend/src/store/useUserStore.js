import axios from "axios";
import { create } from "zustand";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const storedUserInfo = () => {
    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    return data?.userInfo || null;
}

export const useUserStore = create((set, get) => ({
    loading: false,
    updateUser: async (userId, updatedData) => {
        set({ loading: true });
        try {
            const response = await axios.put(`${API_URL}/update-user/${userId}/`, {
                ...updatedData
            });

            set({ loading: false });

            if (response.status === 200) {
                toast.success("User updated successfully.");
            }

            return response.data;
        } catch (error) {
            toast.error("Failed to update user. Please try again.");
            throw error;
        }
    },

    fetchUser: async () => {
        const stored = localStorage.getItem("authData");
        const data = JSON.parse(stored);
        const response = await axios.post(`${API_URL}/find-user/`, {
            email: data.userInfo.email
        });
        return response.data.user;
    },

    syncUserCases: async (case_persons, email) => {
        try {
            const res = await axios.post(`${API_URL}/sync-user-cases/`,
                { case_persons: case_persons, email: email });

            if (res.status === 200) {
                toast.success("Cases successfully synced to your account!");
            }
        } catch (error) {
            toast.error("Failed to sync cases. Please try again.");
            console.error("Sync error:", error);
        }
    },
    notificationSettings: null,
    fetchNotificationSettings: async () => {
        try {

            const res = await axios.get(`${API_URL}/user/notifications/`, {
                headers: { Authorization: `Token ${storedUserInfo()?.token}` }
            });

            set({ notificationSettings: res.data });

        } catch (error) {
            toast.error("Failed to fetch notification settings.");
        }

    },

    patchNotificationSettings: async (updatedSettings) => {
        try {
            const res = await axios.patch(
                `${API_URL}/user/notifications/`,
                updatedSettings,
                {
                    headers: { Authorization: `Token ${storedUserInfo()?.token}` }
                }
            );
            set({ notificationSettings: res.data });
            toast.success("Settings saved");

        }
        catch (error) {
            toast.error("Failed to update notification settings.");
        }

    },

    syncVerificationWithBackend: async () => {
        try {
            const stored = localStorage.getItem("authData");
            const data = JSON.parse(stored);

            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            await user.reload();

            if (user.emailVerified) {
                // 2. Get fresh token
                const token = await user.getIdToken(true);

                const response = await axios.post(
                    `${API_URL}/auth/verify-email-sync/`,
                    { token: token },
                    {
                        headers: { Authorization: `Token ${data?.userInfo.token}` }
                    }
                );

                if (response.status === 200) {
                    toast.success("Email successfully verified!");
                }
            }
        } catch (error) {
            console.error("Sync failed", error);
        }
    },

    sendOTP: async (contact_number, type) => {
        const stored = localStorage.getItem("authData");
        const data = JSON.parse(stored);

        set({ loading: true });

        try {
            await axios.post(
                `${API_URL}/auth/send-otp/`,
                { type: type, contact_number: contact_number },
                { headers: { Authorization: `Token ${data?.userInfo.token}` } }
            );
            toast.success("Code sent! ");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send code.");
        } finally {
            set({ loading: false });
        }
    },

    verifyOTP: async (code, type) => {
        const stored = localStorage.getItem("authData");
        const data = JSON.parse(stored);

        try {
            const response = await axios.post(
                `${API_URL}/auth/verify-otp/`,
                { code: code, type: type },
                { headers: { Authorization: `Token ${data?.userInfo?.token}` } }
            );

            if (response.status === 200) {
                toast.success(`${type === "email" ? "Email" : "Phone"} successfully verified!`);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Verification failed");
        }
    },

    verifyIdentity: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/verify-identity/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Verification error:", error);
            // Return the error response data so the frontend can handle it properly
            if (error.response?.data) {
                return {
                    success: false,
                    ...error.response.data,
                    statusCode: error.response.status
                };
            }
            // Network or other error
            return {
                success: false,
                error: "Connection failed. Please check your internet connection.",
                statusCode: 0
            };
        }
    },

    // Update user verification status
    updateVerificationStatus: async (userId, isVerified) => {
        try {
            const response = await axios.put(`${API_URL}/update-user/${userId}/`, {
                is_identity_verified: isVerified
            });
            return response.data;
        } catch (error) {
            console.error("Failed to update verification status:", error);
            throw error;
        }
    },



}));