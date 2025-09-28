import { create } from "zustand";
import useAuthenticationStore from "./useAuthenticationStore";

const { userInfo } = useAuthenticationStore.getState();

export const useCaseStore = create((set, get) => ({
    case : {
        case_number: "",
        date: "",
        case_status: "pending_approval",
        hearing_status: "pending_schedule",
    },
    setCaseInfo: (info) => {
        set({ case: { ...get().case, ...info } });
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

    addCase: async () => {
        // e.preventDefault();

        const newCase = get().formData;

        const formatCase = {
            user_id: userInfo?.id,
            case_number: get().case.case_number,
            date: get().case.date,
            case_status: get().case.case_status,
            hearing_status: get().case.hearing_status,

            c_first_name: newCase.complainant.first_name.value,
            c_last_name: newCase.complainant.last_name.value,
            c_middle_name: newCase.complainant.middle_name.value,
            c_birth_date: newCase.complainant.birth_date.value,
            c_sex: newCase.complainant.sex.value,
            c_contact_number: newCase.complainant.contact_number.value,
            c_barangay: newCase.complainant.barangay.value,
            c_street: newCase.complainant.street.value,
            c_additional_info: newCase.complainant.additional_info.value,

            r_first_name: newCase.respondent.first_name.value,
            r_last_name: newCase.respondent.last_name.value,
            r_middle_name: newCase.respondent.middle_name.value,
            r_birth_date: newCase.respondent.birth_date.value,
            r_sex: newCase.respondent.sex.value,
            r_contact_number: newCase.respondent.contact_number.value,
            r_barangay: newCase.respondent.barangay.value,
            r_street: newCase.respondent.street.value,
            r_additional_info: newCase.respondent.additional_info.value,

            nature_of_complaint_code: newCase.caseDetails.nature_of_complaint_code.value,
            severity: newCase.caseDetails.severity.value,
            description: newCase.caseDetails.description.value,
            documents: Array.isArray(newCase.caseDetails.documents.value)
            ? [...newCase.caseDetails.documents.value]
            : [],
            predicted_number: newCase.hearingInfo.predicted_number.value,
            first_hearing_date: newCase.hearingInfo.first_hearing_date.value,
            time: newCase.hearingInfo.time.value,
            lupon_member_id: newCase.hearingInfo.lupon_member_id.value,
        };

        try{
            const checkLocalCases = localStorage.getItem('cases');
            let cases = [];

            if (checkLocalCases) {
                cases = JSON.parse(checkLocalCases);
            }

            if (cases.length > 0) {
                const newCases = [...cases, formatCase];
                localStorage.setItem('cases', JSON.stringify(newCases));
            } else {
                cases.push( formatCase );
                localStorage.setItem('cases', JSON.stringify(cases));
            }

            get().resetFormData();
            get().resetCase();

        } catch (error) {
            console.error('Error adding case:', error);
        }
    },

    getCases : () => {
        const storedCases = localStorage.getItem('cases');
        const userCases = storedCases ? JSON.parse(storedCases) : [];

        return userInfo?.role === 'admin' ? userCases : userCases.filter(c => c.user_id === userInfo?.id);
    },

    getCaseByNumber: (caseNumber) => {
        const storedCases = localStorage.getItem('cases');
        const userCases = storedCases ? JSON.parse(storedCases) : [];
        return userCases.find(c => c.case_number === caseNumber && c.user_id === userInfo?.id);
    }
}))
