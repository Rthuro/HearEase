export const cases = [
    {
        case_number: "BRGY-2025-001",
        nature: "Noise Disturbance",
        hearingDate: "2025-09-19",
        status: "in_progress",
    },
    {
        case_number: "BRGY-2025-002",
        nature: "Property Damage",
        hearingDate: "2025-09-22",
        status: "escalated",
    },
    {
        case_number: "BRGY-2025-003",
        nature: "Physical Assault",
        hearingDate: "2025-09-25",
        status: "pending",
    },
    {
        case_number: "BRGY-2025-004",
        nature: "Verbal Harassment",
        hearingDate: "2025-09-28",
        status: "resolved",
    },
];

export const hearingEvents = [
  {
    title: "Case #BRGY-2025-001 Hearing",
    start: "2025-09-19T09:00:00",
    end: "2025-09-19T10:00:00",
  },
  {
    title: "Case #BRGY-2025-002 Hearing",
    start: "2025-09-22T14:00:00",
    end: "2025-09-22T15:00:00",
  },
];

export const natureOfComplaints = [
  {
    code: "NOISE_NUISANCE",
    label: "Noise Nuisance",
    examples: ["Karaoke past quiet hours", "Loud parties", "Barking dogs"],
    severity: 1,
    recommended_action: "Barangay conciliation (Lupon mediation)",
    legal_notes: ["Covered by KP; typical neighbor dispute."],
  },
  {
    code: "OBSTRUCTION_NUISANCE",
    label: "Obstruction",
    examples: ["Blocking driveway or alley", "Improper sidewalk use"],
    severity: 1,
    recommended_action: "Barangay conciliation; issue barangay notice",
    legal_notes: ["Covered by KP unless tied to a serious offense."],
  },
  {
    code: "SMALL_MONEY_CLAIM",
    label: "Unpaid Debt ",
    examples: ["Utang/loan unpaid", "Split-bill disputes"],
    severity: 2,
    recommended_action: "Barangay conciliation; settlement agreement",
    legal_notes: ["KP covers civil disputes among residents of same city/municipality."],
  },
  {
    code: "PROPERTY_BOUNDARY",
    label: "Property Boundary",
    examples: ["Fence encroachment", "Right-of-way access"],
    severity: 2,
    recommended_action: "Barangay conciliation; minutes & settlement",
    legal_notes: ["KP-coverage civil dispute unless cross-LGU boundary (exempt)."],
  },
  {
    code: "MINOR_PROPERTY_DAMAGE",
    label: "Minor Property Damage",
    examples: ["Broken plant pots", "Scratched gate"],
    severity: 2,
    recommended_action: "Barangay conciliation; consider settlement for damages",
    legal_notes: ["Covered if penalty is not >1 year or fine >₱5,000."],
  },
  {
    code: "VERBAL_ABUSE_DEFAMATION",
    label: "Verbal Abuse",
    examples: ["Name-calling", "Shouting matches"],
    severity: 2,
    recommended_action: "Barangay conciliation; apology/undertakings",
    legal_notes: ["Often handled at KP level unless escalated to serious threats."],
  },
  {
    code: "THREATS_ALARMS",
    label: "Threats and Scandals (non-deadly)",
    examples: ["Non-specific threats", "Disturbance in public"],
    severity: 3,
    recommended_action: "Barangay conciliation or police blotter depending on gravity",
    legal_notes: ["KP covers minor offenses; serious threats should go to police/prosecutor."],
  },
  {
    code: "TRESSPASS_SIMPLE",
    label: "Simple Trespass to Dwelling (no violence)",
    examples: ["Entered yard without permission"],
    severity: 3,
    recommended_action: "Barangay conciliation; escalate if aggravated",
    legal_notes: ["Check penalty; if likely >1 year, KP exemption applies → police/court."],
  },
  {
    code: "MINOR_PHYSICAL_INJURY",
    label: "Minor Physical Injuries (no weapon, brief medical attention)",
    examples: ["Pushing/shoving", "Small bruise"],
    severity: 3,
    recommended_action: "Barangay conciliation; medical note for records",
    legal_notes: ["KP may cover if penalty does not exceed 1 year/₱5,000."],
  },
  {
    code: "PETTY_THEFT_LOSS",
    label: "Loss of Property (low value, no violence)",
    examples: ["Missing laundry", "Stolen plant"],
    severity: 4,
    recommended_action: "Police blotter; KP conciliation usually not required",
    legal_notes: ["Criminal; many theft cases are exempt from KP—file with police/prosecutor."],
  },
  {
    code: "VANDALISM_MODERATE",
    label: " Moderate Property Damage",
    examples: ["Spray paint on wall", "Broken window"],
    severity: 4,
    recommended_action: "Police blotter; civil damages may be settled",
    legal_notes: ["Criminal + civil; KP may handle civil aspect but crimes go to police/court."],
  },
  {
    code: "ASSAULT_SERIOUS",
    label: "Assault (Serious Injuries) / Weapon Involved",
    examples: ["Knife attack", "Fractures, severe wounds"],
    severity: 5,
    recommended_action: "Emergency services + police; not for KP",
    legal_notes: ["Exempt from KP (serious offense)."],
  },
  {
    code: "VAWC_RA9262",
    label: "Violence Against Women and their Children (RA 9262)",
    examples: ["Physical/psychological/economic abuse", "Stalking, harassment"],
    severity: 5,
    recommended_action: "Issue BPO; assist victim; immediate police if danger",
    legal_notes: ["Barangay Protection Order (BPO) under RA 9262; urgent handling."],
  },
  {
    code: "CHILD_ABUSE_RA7610",
    label: "Child Abuse / Exploitation (RA 7610)",
    examples: ["Physical/psychological abuse of minors"],
    severity: 5,
    recommended_action: "Immediate report to police/DSWD; not for KP",
    legal_notes: ["Serious offense; KP-exempt."],
  },
  {
    code: "DRUGS_ILLEGAL",
    label: "Illegal Drugs",
    examples: ["Suspected shabu use/sale"],
    severity: 5,
    recommended_action: "Police/PNP; not for KP",
    legal_notes: ["Criminal offense; KP-exempt."],
  },
];

function getHearingsForCurrentMonth(events) {
  const now = new Date();
  const currentMonth = now.getMonth();   // 0–11
  const currentYear = now.getFullYear();

  return events.filter(event => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getMonth() === currentMonth &&
      eventDate.getFullYear() === currentYear
    );
  });
}

export const thisMonthHearings = getHearingsForCurrentMonth(hearingEvents);