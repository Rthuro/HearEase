import axios from "axios";
import { toast } from "react-hot-toast";
import useAuthenticationStore from "./useAuthenticationStore"; 
import { getUser } from "./useCaseStore";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const loginUser = async (email, password) => {
  const { login } = useAuthenticationStore.getState();

  try {
    const res = await axios.post(`${API_URL}/login/`, {
      email,
      password,
    });

    const user = res.data.user;
    login(user.role, user);

    toast.success("Login successful!");
    return user;
  } catch (err) {
    toast.error(
      err.response?.data?.non_field_errors?.[0] ||
        "Invalid email or password"
    );
    return false;
  }
};

export const userInfo = async () => {
  try {
    const data = await getUser(); 
    const user = data.user;
    return user 

  } catch (error) {
    console.error("Failed to fetch user info:", error);
  }
}
