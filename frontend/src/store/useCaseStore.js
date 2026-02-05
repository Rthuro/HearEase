import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import useHearingStore from "./useHearingStore";

const { fetchHearings } = useHearingStore.getState();

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const LOCAL_STORAGE_KEY = "authData";

export const getUser = async () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const data = JSON.parse(stored);
    const response = await axios.post(`${API_URL}/find-user/`, {
        email: data?.userInfo?.email
    });
    return response.data;
};

export const getCasePersonByUserEmail = async (email) => {
    const response = await axios.get(`${API_URL}/case-person/${email}/`);
    return response.data;
}; 

export const getCaseTypes = async () => {
    const response = await axios.get(`${API_URL}/case-types/`);
    return response.data;
};

export const getSettlementTypes = async () => {
    const response = await axios.get(`${API_URL}/settlement-types/`);
    return response.data;
};

export const getRelationshipList = async () => {
    const response = await axios.get(`${API_URL}/relationship-list/`);
    return response.data;
};

export const addCase = async (caseData) => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const data = JSON.parse(stored);
    try {
        const response = await axios.post(`${API_URL}/cases/`, caseData,
            { headers: { Authorization: `Token ${data?.userInfo.token}` } }
        );
        if (response.status === 201) {
            return response.data;
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || "Unknown error";
        console.error("Error adding case:", errorMessage, error.response?.data);
        toast.error(`Failed to file case: ${errorMessage}`);
        return null;
    }
};

export const getCases = async () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const data = JSON.parse(stored);

    const response = await axios.post(`${API_URL}/case-list/`, {
        first_name: data.userInfo.first_name,
        middle_name: data.userInfo.middle_name,
        last_name: data.userInfo.last_name
    });
    return response.data;
};

export const getCaseList = async () => {
    const userData = await getUser();
    const response = await axios.get(`${API_URL}/case-list/`, {
        params: {
            is_admin: userData.user.is_admin,
            email: userData.user.email
        }
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
    testEmail: async () => {
        try {
            await axios.get(`${API_URL}/test-email/`);
        } catch (error) {
            console.error("Test email error:", error);
        }
    },
    cases: [],
    caseTypes: [],
    settlementTypes: [],
    relationshipTypes: [],
    relationshipList: [],
    loading: false,

    // Jurisdiction validation state
    jurisdictionWarning: null,
    setJurisdictionWarning: (warning) => set({ jurisdictionWarning: warning }),

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
            additional_info: { value: "", required: false },
        },
        caseDetails: {
            nature_of_complaint_code: { value: null, required: true },
            custom_case_type_name: { value: "", required: false },  // For "Other" case types
            severity: { value: null, required: false },
            relationship: { value: "", required: true },
            description: { value: "", required: true },
            documents: { value: [], required: false },
            predicted_number: { value: null, required: false },
        },
        hearingInfo: [],
    },

    setHearings: (hearingData) => {
        set((state) => ({
            formData: {
                ...state.formData,
                hearingInfo: hearingData,
            },
        }));
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
                    custom_case_type_name: { value: "", required: false },
                    severity: { value: null, required: false },
                    relationship: { value: "", required: true },
                    description: { value: "", required: true },
                    documents: { value: [], required: false },
                    predicted_number: { value: "", required: false },
                },
                hearingInfo: [],
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
            custom_case_type_name: formData.caseDetails.custom_case_type_name?.value || "",
            custom_severity: formData.caseDetails.severity?.value || null,  // For custom case types
            description: formData.caseDetails.description.value,
            predicted_hearings: formData.caseDetails.predicted_number.value || 0,
            remarks: "",
            case_status: data.userRole === 'admin' ? "approved" : "pending_approval",
            hearing_info: formData.hearingInfo,
        };

        if (data.userRole !== 'admin') {
            const loggedInFirst = data.userInfo.first_name.trim().toLowerCase();
            const loggedInLast = data.userInfo.last_name.trim().toLowerCase();

            caseData.complainants = complainantList.map(person => {
                if (
                    person.first_name.trim().toLowerCase() === loggedInFirst &&
                    person.last_name.trim().toLowerCase() === loggedInLast
                ) {
                    return {
                        ...person,
                        email: data.userInfo.email
                    };
                }
                return person;
            });
        }

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
    initialUserComplainantInfo: {},

    setComplainantInfo: async () => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            const user_data = JSON.parse(stored);

            if (user_data.userRole !== 'user') {
                return;
            }

            const data = await getUser(user_data?.userInfo.email);
            console.log("Fetched complainant info data:", data);

            if(!data) return;

            set({ initialUserComplainantInfo: {
                first_name: data?.user?.first_name,
                last_name:data?.user?.last_name,
                middle_name: data?.user?.middle_name,
                birth_date: data?.user?.birth_date,
                sex: data?.user?.sex,
                contact_number: data?.user?.contact_number,
                barangay: data?.user?.barangay,
                street: data?.user?.street,
                additional_info: data?.user?.additional_info
                }
            });

            // set((state) => {
            //     const updatedComplainant = { 
            //         ...state.formData.complainant };

            //     Object.keys(updatedComplainant).forEach((key) => {
            //         if (user[key] !== undefined && user[key] !== null) {
            //             updatedComplainant[key] = {
            //                 ...updatedComplainant[key],
            //                 value: user[key],
            //             };
            //         }
            //     });

            //     return {
            //         formData: {
            //             ...state.formData,
            //             complainant: updatedComplainant,
            //         },
            //     };
            // });
        } catch (error) {
            console.error("Failed to fetch complainant info:", error);
        }
    },

    relatedCases: {},
    fetchUserRelatedCase: async () => {
        try {
            const data = await getCases();
            set({ relatedCases: data })

        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    fetchCases: async () => {
        try {
            const data = await getCaseList();
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

    deleteCase: async (case_id, type) => {
        try {
            const res = await axios.delete(`${API_URL}/delete-case/`, {
                data: { case_id: case_id }
            });

            if (res.status === 204) {
                get().fetchCases();
               toast.success("Case " + case_id + `${ type == 'delete' ? 'deleted' : 'withdrawn'} successfully.` );
            }

        } catch (error) {
             toast.error(`${type == 'delete' ? 'Delete' : 'Withdraw'} case unsuccessful:`, error);
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
                    const res = await axios.put(`${API_URL}/case-persons/${id}/`, data);

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
                        const res = await axios.put(`${API_URL}/case-persons/${id}/`, data);

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
            
            case "update_case":
                try {
                    const res = await axios.put(`${API_URL}/update-case/${id}/`, data);

                    if (res.status === 200) {
                        fetchCases();
                        toast.success("Case updated successfully.");
                    }
                    
                } catch (error) {
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

    updateHearings: async (case_id, hearing_data, prediction) => {
        try {
            set({ loading: true });

            if (hearing_data.length === 0) {
                toast.error("No hearing data to update.");
                set({ loading: false });
                return;
            };

            const res_hearing = await axios.post(`${API_URL}/update-hearings/${case_id}/`, {
                hearings: hearing_data,
            });

            if (!(res_hearing.status === 200)) return;

            const res_case = await axios.put(`${API_URL}/update-case/${case_id}/`, {
                case_status: "in_progress",
                predicted_hearings: prediction ? prediction.predicted_hearings : null,
            });

            if (!(res_case.status === 200)) return;

            if (res_case.status === 200 && res_hearing.status === 200) {
                set({ loading: false });
                toast.success("Hearings successfully created.");
                get().resetFormData();
                fetchHearings();
                get().fetchCases();
            }
        } catch (error) {
            set({ loading: false });
            toast.error("Update hearings unsuccessful:", error);
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
        const relationship = formData.caseDetails.relationship.value || "Neighbor";

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
                // Check if case is beyond jurisdiction
                if (response.data.beyond_jurisdiction) {
                    toast.error(response.data.error);
                    if (response.data.recommendation) {
                        toast(response.data.recommendation, { icon: '⚠️', duration: 5000 });
                    }
                }
                set({
                    predictions: null,
                    predictionsLoading: false
                });
                return null;
            }
        } catch (error) {
            console.error("Error fetching predictions:", error);
            // Handle jurisdiction error from API response
            if (error.response?.data?.beyond_jurisdiction) {
                toast.error(error.response.data.error);
                if (error.response.data.recommendation) {
                    toast(error.response.data.recommendation, { icon: '⚠️', duration: 5000 });
                }
            }
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

    fetchRelationshipList: async () => {
        try {
            const relationshipList = await getRelationshipList();
            set({ relationshipList: relationshipList });
        } catch (error) {
            console.error("Fetch relationship types error:", error);
        }
    },

}))

