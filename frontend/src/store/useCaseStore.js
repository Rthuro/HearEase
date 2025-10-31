import { create } from "zustand";
import useAuthenticationStore from "./useAuthenticationStore";
import axios from "axios";
import toast from "react-hot-toast";

const { userInfo, userRole } = useAuthenticationStore.getState();
const API_URL = "http://127.0.0.1:8000/api";
const LOCAL_STORAGE_KEY = "authData";


export const getCaseTypes = async () => {
  const response = await axios.get(`${API_URL}/case-types/`);
  return response.data;
};

export const getSettlementTypes = async () => {
  const response = await axios.get(`${API_URL}/settlement-types/`);
  return response.data;
};

export const addCase = async (caseData) => {
  try {
    const response = await axios.post(`${API_URL}/cases/`, caseData);
    if (response.status === 201) {
      return response.data;
    }
  } catch (error) {
    console.error("Error adding case:", error.response?.data || error.message);
    return null;
  }
};

export const getCases = async () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const data = JSON.parse(stored);

//   const response = await axios.get(`${API_URL}/cases/`,{
  const response = await axios.post(`${API_URL}/case-list/`,{
    role: data.userRole,
    email: data.userInfo.email
  });
  return response.data;
};

export const getUser = async () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const data = JSON.parse(stored);
    const response = await axios.post(`${API_URL}/find-user/`, {
        email: data.userInfo.email
    });
  return response.data;
};


export const useCaseStore = create((set, get) => ({
    cases: [],
    caseTypes: [],
    settlementTypes: [],
    case : {
        case_number: "",
        date: "",
        case_status: "pending_approval",
        hearing_status: "pending_schedule",
    },
    setCaseInfo: (info) => {
        set({ case: { ...get().case, ...info } });
    },

    co_complainants: [],
    set_coComplainants: (updatedComplainants) =>{
        set({co_complainants: updatedComplainants})
    },

    formData: {
        complainant: {
            first_name: { value: "", required: true },
            last_name: { value: "", required: true },
            middle_name: { value: "", required: false },
            birth_date: { value: null, required: true },
            sex: { value: "", required: true },
            contact_number: { value: "", required: true },
            barangay: { value: "Tetuan", required: true },
            street: { value: "", required: true },
            additional_info: { value: "", required: false },
        },
        respondent: {
            first_name: { value: "", required: true },
            last_name: { value: "", required: true },
            middle_name: { value: "", required: false },
            birth_date: { value: null, required: false },
            sex: { value: "", required: true },
            contact_number: { value: "", required: false },
            barangay: { value: "Tetuan", required: true },
            street: { value: "", required: true },
            additional_info: { value: "", required: false },
        },
        caseDetails: {
            nature_of_complaint_code: { value: null, required: true },
            severity: { value: null, required: false },
            description: { value: "", required: true },
            settlement: { value: null, required: true },
            documents: { value: [], required: false },
        },
        hearingInfo: {
            predicted_number: { value: null, required: false },
            first_hearing_date: { value: null, required: false },
            time: { value: null, required: false },
            lupon_member_id: { value: null, required: true },
        }
    },

    setFormData: (section, field, value) => {
        set((state) => ({
            formData: {
                ...state.formData,
                [section]: {
                    ...state.formData[section],
                    [field]: {
                        ...state.formData[section][field],
                        value: value
                    },
                },
            },
        }));
    },

    resetFormData: () => {
        set({
             formData: {
                complainant: {
                    first_name: { value: "", required: true },
                    last_name: { value: "", required: true },
                    middle_name: { value: "", required: false },
                    birth_date: { value: null, required: true },
                    sex: { value: "", required: true },
                    contact_number: { value: "", required: true },
                    barangay: { value: "Tetuan", required: true },
                    street: { value: "", required: true },
                    additional_info: { value: "", required: false },
                },
                respondent: {
                    first_name: { value: "", required: true },
                    last_name: { value: "", required: true },
                    middle_name: { value: "", required: false },
                    birth_date: { value: null, required: false },
                    sex: { value: "", required: true },
                    contact_number: { value: "", required: false },
                    barangay: { value: "Tetuan", required: true },
                    street: { value: "", required: true },
                    additional_info: { value: "", required: false },
                },
                caseDetails: {
                    nature_of_complaint_code: { value: "", required: true },
                    severity: { value: null, required: false },
                    description: { value: "", required: true },
                    settlement: { value: "amicable", required: true },
                    documents: { value: [], required: false },
                },
                hearingInfo: {
                    predicted_number: { value: null, required: false },
                    first_hearing_date: { value: null, required: false },
                    time: { value: null, required: false },
                    lupon_member_id: { value: null, required: true },
                }
            },
        })
    },

    resetCase: () => {
        set({
            case: {
                case_number: "",
                date: "",
                case_status: "pending_approval",
                hearing_status: "pending_schedule",
            }
        })
    },

    // addCase: async () => {
    //     // e.preventDefault();

    //     const newCase = get().formData;

    //     const formatCase = {
    //         user_id: userInfo?.id,
    //         case_number: get().case.case_number,
    //         date: get().case.date,
    //         case_status: get().case.case_status,
    //         hearing_status: get().case.hearing_status,

    //         c_first_name: newCase.complainant.first_name.value,
    //         c_last_name: newCase.complainant.last_name.value,
    //         c_middle_name: newCase.complainant.middle_name.value,
    //         c_birth_date: newCase.complainant.birth_date.value,
    //         c_sex: newCase.complainant.sex.value,
    //         c_contact_number: newCase.complainant.contact_number.value,
    //         c_barangay: newCase.complainant.barangay.value,
    //         c_street: newCase.complainant.street.value,
    //         c_additional_info: newCase.complainant.additional_info.value,

    //         r_first_name: newCase.respondent.first_name.value,
    //         r_last_name: newCase.respondent.last_name.value,
    //         r_middle_name: newCase.respondent.middle_name.value,
    //         r_birth_date: newCase.respondent.birth_date.value,
    //         r_sex: newCase.respondent.sex.value,
    //         r_contact_number: newCase.respondent.contact_number.value,
    //         r_barangay: newCase.respondent.barangay.value,
    //         r_street: newCase.respondent.street.value,
    //         r_additional_info: newCase.respondent.additional_info.value,

    //         nature_of_complaint_code: newCase.caseDetails.nature_of_complaint_code.value,
    //         severity: newCase.caseDetails.severity.value,
    //         description: newCase.caseDetails.description.value,
    //         settlement: newCase.caseDetails.settlement.value,
    //         documents: Array.isArray(newCase.caseDetails.documents.value)
    //         ? [...newCase.caseDetails.documents.value]
    //         : [],
    //         predicted_number: newCase.hearingInfo.predicted_number.value,
    //         first_hearing_date: newCase.hearingInfo.first_hearing_date.value,
    //         time: newCase.hearingInfo.time.value,
    //         lupon_member_id: newCase.hearingInfo.lupon_member_id.value,
    //     };

    //     try{
    //         const checkLocalCases = localStorage.getItem('cases');
    //         let cases = [];

    //         if (checkLocalCases) {
    //             cases = JSON.parse(checkLocalCases);
    //         }

    //         if (cases.length > 0) {
    //             const newCases = [...cases, formatCase];
    //             localStorage.setItem('cases', JSON.stringify(newCases));
    //         } else {
    //             cases.push( formatCase );
    //             localStorage.setItem('cases', JSON.stringify(cases));
    //         }

    //         get().resetFormData();
    //         get().resetCase();

    //     } catch (error) {
    //         console.error('Error adding case:', error);
    //     }
    // },

    // getCases : () => {
    //     const storedCases = localStorage.getItem('cases');
    //     const userCases = storedCases ? JSON.parse(storedCases) : [];

    //     return userInfo?.role === 'admin' ? userCases : userCases.filter(c => c.user_id === userInfo?.id);
    // },

    // getCaseByNumber: (caseNumber) => {
    //     const storedCases = localStorage.getItem('cases');
    //     const userCases = storedCases ? JSON.parse(storedCases) : [];
    //     return userCases.find(c => c.case_number === caseNumber && c.user_id === userInfo?.id);
    // },

    addCaseData: async () => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const data = JSON.parse(stored);

        const { formData, co_complainants } = get();
        const caseData = {
            complainant_user: {
                email: data.userInfo.email,
                first_name: formData.complainant.first_name.value,
                last_name: formData.complainant.last_name.value,
                middle_name: formData.complainant.middle_name.value || undefined,
                birth_date: formData.complainant.birth_date.value ? formData.complainant.birth_date.value : null,
                sex: formData.complainant.sex.value,
                contact_number: formData.respondent.contact_number.value,
                barangay: formData.respondent.barangay.value,
                street: formData.respondent.street.value,
                additional_info: formData.complainant.additional_info.value,
            },
            co_complainants: co_complainants ,
            respondent: {
                first_name: formData.respondent.first_name.value,
                last_name: formData.respondent.last_name.value,
                middle_name: formData.respondent.middle_name.value || undefined,
                birth_date: formData.respondent.birth_date.value ? formData.respondent.birth_date.value.toISOString().split("T")[0] : null,
                sex: formData.respondent.sex.value,
                contact_number: formData.respondent.contact_number.value,
                barangay: formData.respondent.barangay.value,
                street: formData.respondent.street.value,
                additional_info: formData.respondent.additional_info.value,
            },
            case_type: formData.caseDetails.nature_of_complaint_code.value,
            settlement_type: formData.caseDetails.settlement.value,
            description: formData.caseDetails.description.value,
            hearing_info: {
                hearing_date: formData.hearingInfo.first_hearing_date.value ? formData.hearingInfo.first_hearing_date.value.toISOString().split("T")[0] : null,
                time: formData.hearingInfo.time.value ? formData.hearingInfo.time.value : null,
                lupon_member: formData.hearingInfo.lupon_member_id.value,
            },
        };
    
    
        try {
            const newCase = await addCase(caseData);
            set((state) => ({ cases: [...state.cases, newCase] }));
            get().resetFormData();

            if(newCase === null) {
                toast.error("Failed to file case.");
                return false;
            }

            toast.success("Case filed successfully!");
            return true;
        } catch (error) {
            console.error("Add case error:", error.response?.data || error.message);
            return false;
        }
    },

    complainant_info: null,

    setComplainantInfo: async () => {
        try {
        const data = await getUser(); 
        const user = data.user;

       set((state) => {
            const updatedComplainant = { ...state.formData.complainant };

            Object.keys(updatedComplainant).forEach((key) => {
                if (user[key] !== undefined && user[key] !== null) {
                updatedComplainant[key] = {
                    ...updatedComplainant[key],
                    value: user[key],
                };
                }
            });

            return {
                    formData: {
                    ...state.formData,
                    complainant: updatedComplainant,
                    },
                };
            });
        } catch (error) {
        console.error("Failed to fetch complainant info:", error);
        }
    },

    fetchCases: async () => {
        try {
            const data = await getCases();
            set({cases: data})
        
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    fetchCaseTypes: async () => {
        try {
            const caseTypes = await getCaseTypes();
            set({ caseTypes: caseTypes });
        } catch (error) {
            console.error("Fetch case types error:", error);
        }
    },

    fetchSettlementTypes: async () => {
        try {
            const settlementTypes = await getSettlementTypes();
            set({ settlementTypes: settlementTypes });
        } catch (error) {
            console.error("Fetch settlement types error:", error);
        }
    },


}))
