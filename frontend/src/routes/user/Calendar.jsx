import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { hearingEvents } from "@/test/data";
import { PageSync } from "@/components/PageSync";
import { thisMonthHearings } from "@/test/data";

export function Calendar() {

  return (
    <div className="p-4 bg-white flex flex-col gap-2">
      <PageSync page="Calendar" />
      <h1 className="text-2xl font-bold">Hearing Calendar</h1>
      <p className=" mb-4" >You have <span className="font-medium text-redBase">{thisMonthHearings?.length}</span> upcoming hearings this month.</p>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={hearingEvents}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
      />
    </div>
  );
}
