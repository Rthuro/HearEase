import { barangays } from "./barangays";
import { natureOfComplaints } from "@/test/data";

export function dateFormatter(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
}

export const getBarangayNames = () => barangays.map(b => b.name);

export const getStreets = (barangayName) => {
    return barangays.find(b => b.name === barangayName)?.streets || [];
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

export function getNatureLabel(code){
    return natureOfComplaints.find(n => n.code === code )?.label;
}
