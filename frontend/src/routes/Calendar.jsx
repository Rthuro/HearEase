import { useEffect, useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { PageSync } from "@/components/PageSync";
import useHearingStore from "@/store/useHearingStore";
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
  const [error, setError] = useState(null);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

        return {
          id: hearing.id,
          title: `Hearing #${hearing.hearing_number || "?"}`,
          start: hearing.hearing_date + (hearing.time ? `T${hearing.time}` : ""),
          backgroundColor,
          borderColor,
          extendedProps: {
            ...hearing,
          },
        };
      });
  }, [hearings]);

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
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
      />

      {/* Hearing Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Hearing #{selectedHearing?.hearing_number || "N/A"} Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-medium">Date:</span>
              <span>{selectedHearing?.hearing_date || "Not set"}</span>

              <span className="font-medium">Time:</span>
              <span>{selectedHearing?.time || "Not set"}</span>

              <span className="font-medium">Status:</span>
              <span className="capitalize">
                {selectedHearing?.hearing_status?.replace(/_/g, " ") || "Unknown"}
              </span>

              <span className="font-medium">Case ID:</span>
              <span className="truncate">{selectedHearing?.case || "N/A"}</span>

              <span className="font-medium">Remarks:</span>
              <span>{selectedHearing?.remarks || "None"}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
