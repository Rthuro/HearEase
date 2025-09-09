import { barangays } from "./barangays";

export function dateFormatter(date) {
    return date.toLocaleDateString('en-US');
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