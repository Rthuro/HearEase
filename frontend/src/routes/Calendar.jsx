import { useEffect, useState, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { PageSync } from "@/components/PageSync";
import useHearingStore from "@/store/useHearingStore";
import { useGoogleCalendarStore } from "@/store/useGoogleCalendarStore";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Error Boundary Component
function CalendarErrorFallback({ error, onRetry }) {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center gap-4">
      <AlertTriangle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-semibold text-red-700">Failed to Load Calendar</h2>
      <p className="text-red-600 text-center">
        {error?.message || "An error occurred while loading the calendar data."}
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}

// Loading Component
function CalendarLoading() {
  return (
    <div className="p-8 flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-gray-600">Loading calendar...</p>
    </div>
  );
}

export function Calendar() {
  const { hearings, fetchHearings, loading } = useHearingStore();
  const { holidays, fetchHolidays } = useGoogleCalendarStore();
  const [error, setError] = useState(null);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);

  // Fetch hearings on mount
  useEffect(() => {
    const loadHearings = async () => {
      try {
        setError(null);
        await fetchHearings();
      } catch (err) {
        setError(err);
      }
    };
    loadHearings();
  }, [fetchHearings]);

  // Fetch holidays when month/year changes
  useEffect(() => {
    fetchHolidays(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchHolidays]);

  // Handle calendar navigation (month change)
  const handleDatesSet = (dateInfo) => {
    const newMonth = dateInfo.view.currentStart.getMonth() + 1;
    const newYear = dateInfo.view.currentStart.getFullYear();
    if (newMonth !== currentMonth || newYear !== currentYear) {
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    }
  };

  // Transform hearings to calendar events
  const calendarEvents = useMemo(() => {
    if (!hearings || !Array.isArray(hearings)) return [];

    return hearings
      .filter(h => h.hearing_date) // Only hearings with dates
      .map(hearing => {
        // Determine color based on status
        let backgroundColor = "#3B82F6"; // default blue
        let borderColor = "#2563EB";

        switch (hearing.hearing_status) {
          case "completed":
            backgroundColor = "#10B981"; // green
            borderColor = "#059669";
            break;
          case "scheduled":
            backgroundColor = "#3B82F6"; // blue
            borderColor = "#2563EB";
            break;
          case "pending_schedule":
            backgroundColor = "#F59E0B"; // amber
            borderColor = "#D97706";
            break;
          case "rescheduled":
            backgroundColor = "#8B5CF6"; // purple
            borderColor = "#7C3AED";
            break;
          case "pending_decision":
            backgroundColor = "#EF4444"; // red
            borderColor = "#DC2626";
            break;
          default:
            backgroundColor = "#6B7280"; // gray
            borderColor = "#4B5563";
        }

        // Build title with Case ID and Hearing number
        const caseId = hearing.case_number || hearing.case || "?";
        const caseIdShort = typeof caseId === 'string' && caseId.length > 12
          ? caseId.substring(0, 12) + "..."
          : caseId;

        return {
          id: hearing.id,
          title: `#${caseIdShort} - Hearing #${hearing.hearing_number || "?"}`,
          start: hearing.hearing_date + (hearing.time ? `T${hearing.time}` : ""),
          backgroundColor,
          borderColor,
          extendedProps: {
            ...hearing,
          },
        };
      });
  }, [hearings]);

  // Transform holidays to calendar events
  const holidayEvents = useMemo(() => {
    if (!holidays || !Array.isArray(holidays)) return [];

    return holidays.map((holiday, index) => ({
      id: `holiday-${index}`,
      title: `🇵🇭 ${holiday.name}`,
      start: holiday.date,
      allDay: true,
      backgroundColor: holiday.type === "regular" ? "#DC2626" : "#991B1B", // Red for regular, dark red for special
      borderColor: holiday.type === "regular" ? "#B91C1C" : "#7F1D1D",
      textColor: "#FFFFFF",
      extendedProps: {
        isHoliday: true,
        holidayType: holiday.type,
        description: holiday.description,
        ...holiday,
      },
    }));
  }, [holidays]);

  // Merge hearing events and holiday events
  const allEvents = useMemo(() => {
    return [...calendarEvents, ...holidayEvents];
  }, [calendarEvents, holidayEvents]);

  // Count this month's hearings
  const thisMonthCount = useMemo(() => {
    if (!hearings || !Array.isArray(hearings)) return 0;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return hearings.filter(h => {
      if (!h.hearing_date) return false;
      const date = new Date(h.hearing_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length;
  }, [hearings]);

  // Handle event click
  const handleEventClick = (clickInfo) => {
    try {
      const data = clickInfo.event.extendedProps;
      if (!data) {
        console.error("No hearing data available");
        return;
      }
      setSelectedHearing(data);
      setDialogOpen(true);
    } catch (e) {
      console.error("Error handling event click:", e);
    }
  };

  // Retry handler
  const handleRetry = async () => {
    setError(null);
    try {
      await fetchHearings();
    } catch (err) {
      setError(err);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-white flex flex-col gap-2">
        <PageSync page="Calendar" />
        <h1 className="text-2xl font-bold">Hearing Calendar</h1>
        <CalendarErrorFallback error={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Loading state
  if (loading && (!hearings || hearings.length === 0)) {
    return (
      <div className="p-4 bg-white flex flex-col gap-2">
        <PageSync page="Calendar" />
        <h1 className="text-2xl font-bold">Hearing Calendar</h1>
        <CalendarLoading />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white flex flex-col gap-2">
      <PageSync page="Calendar" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hearing Calendar</h1>
          <p className="mb-4">
            You have{" "}
            <span className="font-medium text-redBase">{thisMonthCount}</span>{" "}
            upcoming hearings this month.
          </p>
        </div>
        <Button
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={allEvents}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
      />

      {/* Hearing Details Dialog - Enhanced like Google Calendar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="text-2xl">📋</span>
              Hearing #{selectedHearing?.hearing_number || "N/A"}
              {selectedHearing?.case_type_label && (
                <span className="text-base font-normal text-gray-500">
                  - {selectedHearing.case_type_label}
                </span>
              )}
            </DialogTitle>
            <p className="text-sm text-gray-500">
              {selectedHearing?.hearing_date && new Date(selectedHearing.hearing_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {selectedHearing?.time && ` · ${selectedHearing.time}`}
            </p>
          </DialogHeader>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">HearEase Hearing Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-gray-600 w-32">Case:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  #{selectedHearing?.case_number || selectedHearing?.case || "N/A"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 w-32">Type:</span>
                <span>{selectedHearing?.case_type_label || "Not specified"}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 w-32">Hearing Number:</span>
                <span>{selectedHearing?.hearing_number || "N/A"}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 w-32">Status:</span>
                <span className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${selectedHearing?.hearing_status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  selectedHearing?.hearing_status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedHearing?.hearing_status === 'pending_schedule' ? 'bg-amber-100 text-amber-700' :
                      selectedHearing?.hearing_status === 'pending_decision' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                  }`}>
                  {selectedHearing?.hearing_status?.replace(/_/g, " ") || "Unknown"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 w-32">Assigned Lupon:</span>
                <span>{selectedHearing?.lupon_member_name || "Unassigned"}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 w-32">Remarks:</span>
                <span className="text-gray-500">{selectedHearing?.remarks || "No remarks"}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
