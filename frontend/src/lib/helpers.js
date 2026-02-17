import { natureOfComplaints } from "@/test/data";

export function dateFormatter(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
}


export function getFirstHearingDate(scheduledDate = new Date()) {
    const date = new Date(scheduledDate);
    date.setDate(date.getDate() + 7);
    return date;
}

export function invalidContactNumber(number) {
    const regex = /^09\d{9}$/;
    return !regex.test(number);
}

export function getNatureLabel(code) {
    return natureOfComplaints.find(n => n.code === code)?.label;
}

export const formatedBday = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export const formatedDateTimeToString = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,      // Set to false for 24-hour format (14:38)
    });
};

export const maskString = (str) => {
    if (!str) return "";
    if (str.length <= 1) return str;
    return str.charAt(0) + "*".repeat(str.length - 1);
};

export const getStreets = (streetsList, barangay) => {
    return streetsList?.filter(s => s.barangay === barangay).map(s => s.name);
}
// get street by barangay id
// {selectedStreet ? selectedStreet :
// getStreets(streets, getBarangay(barangays, selectedBarangay)?.id)[0]
// }
export const getBarangayName = (barangayList, barangayName) => {
    const barangay = barangayList.find(b => b.name === barangayName);
    return barangay ? barangay.name : "";
}
export const getBarangay = (barangayList, barangayName) => {
    const barangay = barangayList.find(b => b.name === barangayName);
    return barangay;
}

export const checkIndividual = (list, check) => {
    return list.some((u) => {
        const fullName = `${u.first_name}${u.middle_name || ''}${u.last_name}`;
        
        const normalizedListImg = fullName.toLowerCase().replace(/\s+/g, '');
        
        const normalizedInputName = check.name.toLowerCase().replace(/\s+/g, '');

        return normalizedListImg === normalizedInputName && u?.type === check?.type;
    });
}

export const checkOrg = (list, check) => {
    return list.some((u) => {
        const fullName = u?.representative_name;
        
        const normalizedListImg = fullName?.toLowerCase().replace(/\s+/g, '');
        
        const normalizedInputName = check?.name?.toLowerCase().replace(/\s+/g, '');

        return normalizedListImg === normalizedInputName && u?.type === check?.type;
    });
}