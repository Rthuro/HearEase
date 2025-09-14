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