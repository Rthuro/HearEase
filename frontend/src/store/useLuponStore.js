import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const getLuponMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}/lupon-members/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Lupon members:", error);
    toast.error("Failed to fetch Lupon members.");
    throw error;
  }
};


// POST (add Lupon member)
export const addLuponMember = async (memberData) => {
  try {
    const response = await axios.post(`${API_URL}/lupon-members/`, memberData);
    toast.success("Lupon member added successfully!");
    return response.data;
  } catch (error) {
    console.error("Error adding Lupon member:", error);
    toast.error("Failed to add Lupon member.");
    throw error;
  }
};

export const fetchLuponMemberDetails = async (id) => {
  const response = await axios.get(`${API_URL}/lupon-member/`, {
        params: { id: id }
    });
    return response.data;
}

export const updateLupon = async (id, data) => {
  const response = await axios.put(`${API_URL}/update-lupon/${id}/`,data);
    return response.data;
}

export const useLuponStore = create((set, get) => ({
  members: [],
  loading: false,

  formData: {
    first_name: { value: "", required: true },
    last_name: { value: "", required: true },
    middle_name: { value: "", required: false },
    birth_date: { value: null, required: true },
    sex: { value: "", required: true },
    contact_number: { value: "", required: true },
    barangay: { value: "Tetuan", required: true },
    street: { value: "", required: true },
    additional_info: { value: "", required: false },
    sched: { value: [], required: true },
  },

  // Fetch Lupon Members
  fetchMembers: async () => {
    set({ loading: true });
    try {
      const data = await getLuponMembers();
      set({ members: data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  // Add Lupon Member and refresh list
  addMember: async () => {
    const { formData } = get();
    const memberData = {
        first_name: formData.first_name.value,
        last_name: formData.last_name.value,
        middle_name: formData.middle_name.value || undefined,
        birth_date: formData.birth_date.value.toISOString().split("T")[0],
        sex: formData.sex.value,
        contact_number: formData.contact_number.value,
        barangay: formData.barangay.value,
        street: formData.street.value,
        additional_info: formData.additional_info.value,
        sched: formData.sched.value || [],
        role: "admin"
    };


    try {
        const newMember = await addLuponMember(memberData);
        set((state) => ({ members: [...state.members, newMember] }));
        get().resetFormData();
    } catch (error) {
        console.error("Add member error:", error.response?.data || error.message);
    }
},


  // Update specific form field
  setFormData: (field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: {
          ...state.formData[field],
          value,
        },
      },
    }));
  },

  // ✅ Reset form
  resetFormData: () => {
    set({
      formData: {
        first_name: { value: "", required: true },
        last_name: { value: "", required: true },
        middle_name: { value: "", required: false },
        birth_date: { value: null, required: true },
        sex: { value: "", required: true },
        contact_number: { value: "", required: true },
        barangay: { value: "Tetuan", required: true },
        street: { value: "", required: true },
        additional_info: { value: "", required: false },
        sched: { value: [], required: false },
      },
    });
  },
   deleteLupon: async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/delete-lupon/`, {
                data: {id: id}
            });

            if (res.status === 204) {
                toast.success("Lupon member has been removed");
            }
        } catch (error) {
            toast.error("Cannot removed lupon member:", error);
        }
    },
    updateLuponMember: async (id, data) => {
      try {
        const res = await updateLupon(id,data);
        if(res){
          await fetchLuponMemberDetails(id);
          toast.success("Lupon member information updated");
        }
        return
      } catch (error) {
          toast.error("Cannot update lupon member information:", error);
      }
    },
    getMemberDetails: async (id) => {
            try {
                const data = await fetchLuponMemberDetails(id);
                return data
            } catch (error) {
                toast.error("Error fetching Lupon member details:", error);
            }       
      }
}));
