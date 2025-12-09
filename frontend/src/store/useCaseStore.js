import { create } from "zustand";
// import useAuthenticationStore from "./useAuthenticationStore";
import axios from "axios";
import toast from "react-hot-toast";
import useHearingStore from "./useHearingStore";

const { fetchHearings } = useHearingStore.getState();
// const { userInfo, userRole } = useAuthenticationStore.getState();
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

    const userData = await getUser();

    const response = await axios.post(`${API_URL}/case-list/`, {
        role: data.userRole,
        first_name: userData.user.first_name,
        last_name: userData.user.last_name
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

export const fetchRespondent = async (respondent_id) => {
    const response = await axios.get(`${API_URL}/update-respondent/${respondent_id}/`);
    return response.data;
}

export const fetchCase = async (case_id) => {
    const response = await axios.get(`${API_URL}/single-case/`, {
        params: { case_id: case_id }
    });
    return response.data;
}

export const useCaseStore = create((set, get) => ({
    cases: [],
    caseTypes: [],
    settlementTypes: [],
    relationshipTypes: [],
    predictions: null,
    predictionsLoading: false,
    case: {
        case_number: "",
        date: "",
        case_status: "pending_approval",
        hearing_status: "pending_schedule",
    },
    setCaseInfo: (info) => {
        set({ case: { ...get().case, ...info } });
    },

    co_complainants: [],
    set_coComplainants: (updatedComplainants) => {
        set({ co_complainants: updatedComplainants })
    },
    co_respondents: [],
    set_coRespondents: (updatedRespondents) => {
        set({ co_respondents: updatedRespondents })
    },

    complainantList: [],
    set_complainants: (updatedComplainants) => {
        set({ complainantList: updatedComplainants })
    },
    respondentList: [],
    set_respondents: (updatedRespondents) => {
        set({ respondentList: updatedRespondents })
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
            relationship: { value: "Neighbor", required: true },
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
            relationship: { value: "Neighbor", required: true },
            additional_info: { value: "", required: false },
        },
        caseDetails: {
            nature_of_complaint_code: { value: null, required: true },
            severity: { value: null, required: false },
            description: { value: "", required: true },
            documents: { value: [], required: false },
        },
        hearingInfo: {
            predicted_number: { value: 3, required: false },
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
                    relationship: { value: "Neighbor", required: true },
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
                    relationship: { value: "Neighbor", required: true },
                    additional_info: { value: "", required: false },
                },
                caseDetails: {
                    nature_of_complaint_code: { value: "", required: true },
                    severity: { value: null, required: false },
                    description: { value: "", required: true },
                    documents: { value: [], required: false },
                },
                hearingInfo: {
                    predicted_number: { value: null, required: false },
                    first_hearing_date: { value: null, required: false },
                    time: { value: null, required: false },
                    lupon_member_id: { value: null, required: true },
                }
            },
            predictions: null,
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

    addCaseData: async () => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const data = JSON.parse(stored);

        const { formData, complainantList, respondentList } = get();
        const caseData = {
            id: get().case.case_number,
            complainants: complainantList,
            respondents: respondentList,
            case_type: formData.caseDetails.nature_of_complaint_code.value,
            description: formData.caseDetails.description.value,
            predicted_hearings: formData.hearingInfo.predicted_number.value,
            remarks: "",
            case_status: data.userRole === 'admin' ? "approved" : "pending_approval",
            hearing_info: {
                hearing_date: formData.hearingInfo.first_hearing_date.value ? formData.hearingInfo.first_hearing_date.value.toISOString().split("T")[0] : null,
                time: formData.hearingInfo.time.value ? formData.hearingInfo.time.value : null,
                lupon_member: formData.hearingInfo.lupon_member_id.value,
            },
        };

        const case_documents = formData.caseDetails.documents.value;

        try {
            const newCase = await addCase(caseData);
            set((state) => ({ cases: [...state.cases, newCase] }));

            if (newCase === null) {
                toast.error("Failed to file case.");
                return false;
            }

            if (case_documents && case_documents.length > 0) {
                for (const case_doc of case_documents) {
                    const case_document_formData = new FormData();
                    case_document_formData.append("case", newCase.id);
                    case_document_formData.append("title", case_doc.name);
                    case_document_formData.append("file", case_doc);

                    try {
                        const res = await axios.post(
                            "http://127.0.0.1:8000/api/case-documents/",
                            case_document_formData,
                            {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                },
                            }
                        );
                        console.log("Uploaded successfully:", res.data);
                    } catch (error) {
                        console.error("Upload failed:", error);
                    }
                }
            }


            toast.success("Case filed successfully!");
            get().resetFormData();
            fetchHearings();
            get().fetchCases();

            return true;
        } catch (error) {
            console.error("Add case error:", error.response?.data || error.message);
            return false;
        }
    },

    complainant_info: null,

    setComplainantInfo: async () => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            const user_data = JSON.parse(stored);

            if (user_data.userRole !== 'user') {
                return;
            }

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
            set({ cases: data })

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

    deleteCase: async (case_id) => {
        try {
            const res = await axios.delete(`${API_URL}/delete-case/`, {
                data: { case_id: case_id }
            });

            if (res.status === 204) {
                get().fetchCases();
                toast.success("Case " + case_id + " deleted successfully.");
            }

        } catch (error) {
            toast.error("Delete case unsuccessful:", error);
        }
    },

    updateCaseInfo: async (data, update, id, forResubmission) => {

        // Update user info if they have account
        // const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        // const data = JSON.parse(stored);

        const { fetchCases } = get();
        switch (update) {
            case 'complainant': {
                try {
                    const res = await axios.put(`${API_URL}/update-complainant/${id}/`, data);

                    if (forResubmission) {
                        await axios.put(`${API_URL}/update-case/${id}/`, {
                            case_status: "pending_approval",
                            remarks: "",
                            rejection_section: "none"
                        });

                    }

                    if (res.status === 200) {
                        fetchCases();
                        toast.success("Complainant updated successfully.");
                    }
                } catch (error) {
                    toast.error("Update complainant unsuccessful:", error);
                }

                break;
            }
            case 'respondent':
                {
                    try {
                        const res = await axios.put(`${API_URL}/update-respondent/${id}/`, data);

                        if (forResubmission) {
                            await axios.put(`${API_URL}/update-case/${id}/`, {
                                case_status: "pending_approval",
                                remarks: "",
                                rejection_section: "none"
                            });

                        }

                        if (res.status === 200) {
                            fetchCases();
                            toast.success("Respondent updated successfully.");
                        }
                    } catch (error) {
                        toast.error("Update respondent unsuccessful:", error);
                    }

                    break;
                }
            case "case":
                try {
                    const edited = forResubmission
                        ? {
                            ...data,
                            case_status: "pending_approval",
                            remarks: "",
                            rejection_section: "none"
                        }
                        : data;

                    const res = await axios.put(`${API_URL}/update-case/${id}/`, edited);

                    console.log(res);

                    if (res.status === 200) {
                        fetchCases();
                        toast.success("Case updated successfully.");
                    }
                } catch (error) {
                    console.error(error);
                    toast.error("Update case unsuccessful: " + (error?.response?.data || error.message));
                }
                break;

            default:
                break;
        }
    },

    updateCaseStatus: async (caseInfo, update) => {
        const { fetchCases } = get();
        switch (update) {
            case 'rejected': {
                try {
                    const res = await axios.put(`${API_URL}/update-case/${caseInfo.id}/`, caseInfo);
                    if (res.status === 200) {
                        fetchCases();
                        toast.success("Case rejected successfully.");
                    }
                } catch (error) {
                    toast.error("Update case status unsuccessful:", error);
                }

                break;
            }
            case 'approved': {
                try {
                    const res = await axios.put(`${API_URL}/update-case/${caseInfo.id}/`, caseInfo);
                    if (res.status === 200) {
                        fetchCases();
                        toast.success("Case approved successfully.");
                    }
                } catch (error) {
                    toast.error("Update case status unsuccessful:", error);
                }

                break;
            }
            default:
                break;
        }
    },

    // AI Model Prediction Functions
    fetchPredictions: async () => {
        const { formData, complainantList, respondentList, caseTypes } = get();

        console.log("fetchPredictions called, caseTypes:", caseTypes.length, "items");

        // Get the case type name from the caseTypes list
        const caseTypeId = formData.caseDetails.nature_of_complaint_code.value;
        console.log("Looking for case type ID:", caseTypeId);

        const caseType = caseTypes.find(ct => ct.id === caseTypeId);

        if (!caseType) {
            console.error("Case type not found for ID:", caseTypeId, "Available types:", caseTypes.map(c => ({ id: c.id, name: c.name })));
            set({ predictionsLoading: false });
            return null;
        }

        console.log("Found case type:", caseType.case_name);

        // Get severity (default to 1 if not set)
        const severity = formData.caseDetails.severity.value || 1;

        // Get relationship from complainant (using primary complainant's relationship)
        const relationship = formData.complainant.relationship.value || "Neighbor";

        // Count complainants and respondents
        const numComplainants = Math.max(1, complainantList.length);
        const numRespondents = Math.max(1, respondentList.length);

        set({ predictionsLoading: true });

        const requestPayload = {
            case_type: caseType.case_name,  // Fixed: API uses 'case_name' not 'name'
            severity: severity,
            relationship: relationship,
            num_complainants: numComplainants,
            num_respondents: numRespondents,
            lockdown_status: "Normal"
        };

        console.log("Sending prediction request:", requestPayload);

        try {
            const response = await axios.post(`${API_URL}/predict-case/`, requestPayload);

            if (response.data.success) {
                set({
                    predictions: response.data.predictions,
                    predictionsLoading: false
                });
                return response.data.predictions;
            } else {
                console.error("Prediction failed:", response.data.error);
                set({
                    predictions: null,
                    predictionsLoading: false
                });
                return null;
            }
        } catch (error) {
            console.error("Error fetching predictions:", error);
            set({
                predictions: null,
                predictionsLoading: false
            });
            return null;
        }
    },

    clearPredictions: () => {
        set({ predictions: null, predictionsLoading: false });
    },

    // Fetch relationship types from the AI model
    fetchRelationshipTypes: async () => {
        try {
            const response = await axios.get(`${API_URL}/model-info/`);
            if (response.data.success && response.data.relationship_types) {
                set({ relationshipTypes: response.data.relationship_types });
            }
        } catch (error) {
            console.error("Error fetching relationship types:", error);
            // Default relationship types if API fails
            set({
                relationshipTypes: [
                    "Neighbor", "Family", "Coworker", "Stranger",
                    "Ex-Partner", "Tenant/Landlord"
                ]
            });
        }
    },

}))

