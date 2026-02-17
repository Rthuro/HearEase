import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { PageSync } from "@/components/PageSync";
import useHearingStore from "@/store/useHearingStore";
import { useGoogleCalendarStore } from "@/store/useGoogleCalendarStore";
import { AlertTriangle, RefreshCw, Loader2, CalendarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const LOCAL_STORAGE_KEY = "authData";

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

// Event Color Legend Component
function EventLegend() {
  const items = [
    { color: "#3B82F6", label: "Scheduled" },
    { color: "#10B981", label: "Completed" },
    { color: "#F59E0B", label: "Pending Schedule" },
    { color: "#8B5CF6", label: "Rescheduled" },
    { color: "#EF4444", label: "Pending Decision" },
    { color: "#6B7280", label: "Other" },
    { color: "#DC2626", label: "Holiday" },
    { color: "#7C3AED", label: "Non-Working Day" },
  ];
  return (
    <div className="flex flex-wrap gap-3 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-xs font-medium text-gray-500 mr-1 self-center">Legend:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}



// Heatmap Legend
function HeatmapLegend() {
  const items = [
    { color: "#E5E7EB", label: "No hearings" },
    { color: "#10B981", label: "1–3 (light)" },
    { color: "#F59E0B", label: "4–6 (moderate)" },
    { color: "#EF4444", label: "7+ (heavy)" },
  ];
  return (
    <div className="flex flex-wrap gap-3 mt-1 px-3 py-2 bg-white rounded-lg border border-gray-100">
      <span className="text-xs font-medium text-gray-500 mr-1 self-center">Day Load:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block border border-gray-300"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}


export function Calendar() {
  const {
    hearings, fetchHearings, loading,
    nonWorkingDays, fetchNonWorkingDays, markNonWorkingDay, removeNonWorkingDay, nonWorkingDaysLoading,
    heatMap, fetchHeatMap,
  } = useHearingStore();
  const { holidays, fetchHolidays, holidaysLoading } = useGoogleCalendarStore();
  const [error, setError] = useState(null);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);

  // Non-working day dialog state
  const [markDayDialogOpen, setMarkDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markDayReason, setMarkDayReason] = useState("holiday");
  const [markDayDescription, setMarkDayDescription] = useState("");
  const [hearingsOnSelectedDate, setHearingsOnSelectedDate] = useState(0);

  // Get user role
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  const authData = stored ? JSON.parse(stored) : {};
  const userRole = authData.userRole;

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



  // Fetch holidays, non-working days, and heatmap when month/year changes
  useEffect(() => {
    const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    fetchHolidays(currentMonth, currentYear);
    fetchNonWorkingDays(monthStr);
    fetchHeatMap(monthStr);
  }, [currentMonth, currentYear, fetchHolidays, fetchNonWorkingDays, fetchHeatMap]);

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
        const otTag = hearing.is_overtime ? " ⏰OT" : "";

        return {
          id: hearing.id,
          title: `#${caseIdShort} - Hearing #${hearing.hearing_number || "?"}${otTag}`,
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

  // Transform non-working days to calendar events
  const nonWorkingDayEvents = useMemo(() => {
    if (!nonWorkingDays || !Array.isArray(nonWorkingDays)) return [];

    return nonWorkingDays.map((day) => ({
      id: `non-working-${day.id}`,
      title: `⛔ ${day.reason_display}${day.description ? `: ${day.description}` : ""}`,
      start: day.date,
      allDay: true,
      backgroundColor: "#7C3AED", // Purple
      borderColor: "#6D28D9",
      textColor: "#FFFFFF",
      extendedProps: {
        isNonWorkingDay: true,
        ...day,
      },
    }));
  }, [nonWorkingDays]);

  // Merge hearing events, holiday events, and non-working day events
  const allEvents = useMemo(() => {
    return [...calendarEvents, ...holidayEvents, ...nonWorkingDayEvents];
  }, [calendarEvents, holidayEvents, nonWorkingDayEvents]);

  // Count hearings for the currently viewed month
  const viewedMonthCount = useMemo(() => {
    if (!hearings || !Array.isArray(hearings)) return 0;

    return hearings.filter(h => {
      if (!h.hearing_date) return false;
      const date = new Date(h.hearing_date);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    }).length;
  }, [hearings, currentMonth, currentYear]);

  // Apply heatmap background colors to day cells
  const dayCellClassNames = useCallback((arg) => {
    // Only apply in dayGridMonth view
    const dateStr = arg.date.toISOString().split("T")[0];
    const dayData = heatMap[dateStr];
    if (!dayData) return [];
    // Return a CSS class based on load level
    switch (dayData.load) {
      case "light": return ["heatmap-light"];
      case "moderate": return ["heatmap-moderate"];
      case "heavy": return ["heatmap-heavy"];
      default: return [];
    }
  }, [heatMap]);

  // Handle event click
  const handleEventClick = (clickInfo) => {
    try {
      const data = clickInfo.event.extendedProps;
      if (!data) {
        console.error("No hearing data available");
        return;
      }

      // If it's a non-working day and admin, show remove option
      if (data.isNonWorkingDay && userRole === "admin") {
        setSelectedHearing(data);
        setDialogOpen(true);
        return;
      }

      setSelectedHearing(data);
      setDialogOpen(true);
    } catch (e) {
      console.error("Error handling event click:", e);
    }
  };

  // Handle date click (admin only - mark as non-working)
  const handleDateClick = (info) => {
    if (userRole !== "admin") return;

    const clickedDate = info.dateStr;

    // Check if already a non-working day
    const isAlreadyNonWorking = nonWorkingDays?.some(d => d.date === clickedDate);
    if (isAlreadyNonWorking) {
      return; // Don't allow marking again
    }

    // Count hearings on this date
    const hearingsCount = hearings?.filter(h => h.hearing_date === clickedDate).length || 0;

    setSelectedDate(clickedDate);
    setHearingsOnSelectedDate(hearingsCount);
    setMarkDayReason("holiday");
    setMarkDayDescription("");
    setMarkDayDialogOpen(true);
  };

  // Handle marking a day as non-working
  const handleMarkNonWorkingDay = async () => {
    if (!selectedDate) return;

    const result = await markNonWorkingDay(selectedDate, markDayReason, markDayDescription);
    if (result) {
      setMarkDayDialogOpen(false);
      setSelectedDate(null);
      // Refresh heatmap after marking
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      fetchHeatMap(monthStr);
    }
  };

  // Handle removing a non-working day
  const handleRemoveNonWorkingDay = async (date) => {
    const result = await removeNonWorkingDay(date);
    if (result) {
      setDialogOpen(false);
      setSelectedHearing(null);
      // Refresh heatmap after removal
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      fetchHeatMap(monthStr);
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

  // Check if data is loading (holidays or NWDs)
  const isRefreshing = holidaysLoading || nonWorkingDaysLoading;

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
          <p className="mb-4 text-sm md:text-lg">
            You have{" "}
            <span className=" font-medium text-redBase">{viewedMonthCount}</span>{" "}
            hearings this month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRefreshing && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
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
      </div>


      {/* Heatmap CSS — injected inline for simplicity */}
      <style>{`
        .heatmap-light { background-color: rgba(16, 185, 129, 0.1) !important; }
        .heatmap-moderate { background-color: rgba(245, 158, 11, 0.12) !important; }
        .heatmap-heavy { background-color: rgba(239, 68, 68, 0.12) !important; }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={allEvents}
        eventClick={handleEventClick}
        dateClick={userRole === "admin" ? handleDateClick : undefined}
        selectable={userRole === "admin"}
        datesSet={handleDatesSet}
        dayCellClassNames={dayCellClassNames}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
      />



      {/* Legends */}
      <EventLegend />
      <HeatmapLegend />

      {/* Hearing Details Dialog / Non-Working Day Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {/* Non-Working Day detail view */}
          {selectedHearing?.isNonWorkingDay ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <CalendarOff className="w-5 h-5 text-purple-600" />
                  Non-Working Day
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  {selectedHearing.date && new Date(selectedHearing.date + "T00:00:00").toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </DialogHeader>
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600 w-28">Reason:</span>
                  <span className="capitalize">{selectedHearing.reason_display || selectedHearing.reason}</span>
                </div>
                {selectedHearing.description && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 w-28">Description:</span>
                    <span>{selectedHearing.description}</span>
                  </div>
                )}
              </div>
              {userRole === "admin" && (
                <DialogFooter>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleRemoveNonWorkingDay(selectedHearing.date)}
                    disabled={nonWorkingDaysLoading}
                  >
                    {nonWorkingDaysLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Removing...</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Remove Non-Working Day</>
                    )}
                  </Button>
                </DialogFooter>
              )}
            </>
          ) : selectedHearing?.isHoliday ? (
            /* Holiday detail view */
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">🇵🇭</span>
                  {selectedHearing.name}
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  {selectedHearing.date && new Date(selectedHearing.date + "T00:00:00").toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </DialogHeader>
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600 w-28">Type:</span>
                  <span className="capitalize px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    {selectedHearing.holidayType || selectedHearing.type || "Holiday"}
                  </span>
                </div>
                {selectedHearing.description && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 w-28">Description:</span>
                    <span>{selectedHearing.description}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Hearing detail view */
            <>
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark Non-Working Day Dialog (Admin only) */}
      <Dialog open={markDayDialogOpen} onOpenChange={setMarkDayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-purple-600" />
              Mark as Non-Working Day
            </DialogTitle>
            <DialogDescription>
              {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {hearingsOnSelectedDate > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ {hearingsOnSelectedDate} hearing(s) scheduled for this day
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {hearingsOnSelectedDate <= 2
                    ? "They will be inserted into available slots on the next working day."
                    : "All hearings will be pushed to the next working day (cascade effect)."}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={markDayReason} onValueChange={setMarkDayReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="typhoon">Typhoon/Weather</SelectItem>
                  <SelectItem value="event">Barangay Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Typhoon Signal #3, Fiesta, etc."
                value={markDayDescription}
                onChange={(e) => setMarkDayDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkDayDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkNonWorkingDay}
              disabled={nonWorkingDaysLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {nonWorkingDaysLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Marking...</>
              ) : (
                <>Mark as Non-Working</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
