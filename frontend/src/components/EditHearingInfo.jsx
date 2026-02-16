import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { dateFormatter } from "@/lib/helpers";
import { Calendar } from "./ui/calendar";
import useHearingStore from "@/store/useHearingStore";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Available time slots for hearings
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00"
];

export function EditHearingInfo({ hearing_number, luponMembers }) {
  const { setUpdatedHearings, updatedHearings } = useHearingStore();
  const [openPopover, setOpenPopover] = useState(null);
  const [openCalendar, setOpenCalendar] = useState(null);

  const currentYear = new Date().getFullYear();
  const [hearingInfo, setHearingInfo] = useState([]);
  const hasScrolled = useRef(false);

  // Track occupied time slots per date
  const [occupiedSlots, setOccupiedSlots] = useState({});

  // Fetch occupied slots for a given date
  const fetchOccupiedSlots = async (date) => {
    if (!date) return;
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      if (occupiedSlots[dateStr]) return; // Already fetched
      const response = await axios.get(`${API_URL}/optimal-slot/`, {
        params: { date: dateStr }
      });
      if (response.data?.all_slots) {
        const occupied = new Set(
          response.data.all_slots
            .filter(s => s.occupied)
            .map(s => s.time)
        );
        setOccupiedSlots(prev => ({ ...prev, [dateStr]: occupied }));
      }
    } catch (error) {
      console.error("Error fetching occupied slots:", error);
    }
  };

  useEffect(() => {
    if (updatedHearings && updatedHearings.length > 0 && hearingInfo.length === 0) {
      setHearingInfo(updatedHearings);

    }
  }, [updatedHearings, hearingInfo.length, setUpdatedHearings]);

  // Fetch occupied slots for all hearing dates when hearingInfo loads
  useEffect(() => {
    hearingInfo.forEach(h => {
      if (h.hearing_date) {
        fetchOccupiedSlots(h.hearing_date);
      }
    });
  }, [hearingInfo]);

  console.log("Rendering EditHearingInfo with hearingInfo:", hearingInfo);

  useEffect(() => {
    if (hearingInfo.length > 0) {

      setUpdatedHearings(hearingInfo);
    }
  }, [hearingInfo, setUpdatedHearings]);


  useEffect(() => {
    if (hasScrolled.current) return;
    if (hearingInfo.length > 0 && hearing_number) {
      const element = document.getElementById(`hearing-card-${hearing_number}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        hasScrolled.current = true;
      }
    }
  }, [hearing_number, hearingInfo]);

  const handleDateSelect = (index, date) => {
    const newHearingInfo = [...hearingInfo];
    newHearingInfo[index].hearing_date = date;
    setHearingInfo(newHearingInfo);
    setOpenCalendar(null);
    fetchOccupiedSlots(date);
    console.log("Selected date:", date);
  };

  const handleTimeChange = (index, value) => {
    const newHearingInfo = [...hearingInfo];
    newHearingInfo[index].time = value;
    setHearingInfo(newHearingInfo);
  };

  const handleLuponChange = (index, luponId) => {
    const newHearingInfo = [...hearingInfo];
    newHearingInfo[index].lupon_member = luponId;
    setHearingInfo(newHearingInfo);
    setOpenPopover(null);
  };

  const handleStatusChange = (index, value) => {
    const newHearingInfo = [...hearingInfo];
    newHearingInfo[index].hearing_status = value;
    setHearingInfo(newHearingInfo);
  };

  if (!hearingInfo || hearingInfo.length === 0) return <div>Loading hearings...</div>;

  return (
    <div className="flex flex-col gap-4 col-span-2 w-[700px] pb-10">
      {hearingInfo.map((h, i) => {
        const isTarget = h.hearing_number === hearing_number;

        return (
          <div
            key={i}
            id={`hearing-card-${h.hearing_number}`}
            className={cn(
              "flex items-start gap-3 p-4 border rounded-lg transition-all duration-500",
              isTarget
                ? "border-redBase bg-red-50/50 shadow-md ring-1 ring-redBase"
                : "border-gray-300 bg-white"
            )}
          >
            <p className={cn("w-9 p-1 text-center rounded-full font-bold", isTarget ? "text-white bg-redBase" : "text-redBase bg-redBase/10")}>
              {h.hearing_number}
            </p>

            <div className="grid grid-cols-2 w-full gap-3">
              {/* Date */}
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor={`hearingDate-${i}`}>Date</Label>
                <Popover
                  open={openCalendar === i}
                  onOpenChange={(o) => setOpenCalendar(o ? i : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id={`hearingDate-${i}`}
                      className={cn("justify-between font-normal", !h.hearing_date && "text-muted-foreground")}
                    >
                      {hearingInfo[i]?.hearing_date
                        ? dateFormatter(hearingInfo[i].hearing_date)
                        : "Select date"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="overflow-hidden p-0 w-72" align="start">
                    <Calendar
                      mode="single"
                      selected={hearingInfo[i]?.hearing_date ? new Date(hearingInfo[i].hearing_date) : null}
                      disabled={(date) => date.getDay() === 0}
                      captionLayout="dropdown"
                      fromYear={currentYear}
                      toYear={currentYear + 10}
                      onSelect={(date) => handleDateSelect(i, date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor={`time-${i}`}>Time</Label>
                {(() => {
                  const dateStr = hearingInfo[i]?.hearing_date
                    ? new Date(hearingInfo[i].hearing_date).toISOString().split('T')[0]
                    : null;
                  const occupied = dateStr ? (occupiedSlots[dateStr] || new Set()) : new Set();

                  return (
                    <Select
                      value={hearingInfo[i]?.time?.substring(0, 5) || ""}
                      onValueChange={(val) => handleTimeChange(i, val)}
                    >
                      <SelectTrigger id={`time-${i}`} className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Slots</SelectLabel>
                          {TIME_SLOTS.map((time) => {
                            const isBusy = occupied.has(time);
                            return (
                              <SelectItem
                                key={time}
                                value={time}
                                disabled={isBusy}
                                className={isBusy ? "text-zinc-400 opacity-50" : ""}
                              >
                                {time} {isBusy ? "(Occupied)" : ""}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  );
                })()}
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor={`status-${i}`}>Hearing Status</Label>
                <Select
                  value={hearingInfo[i]?.hearing_status || ""}
                  onValueChange={(val) => handleStatusChange(i, val)}
                >
                  <SelectTrigger id={`status-${i}`} className="w-full">
                    <SelectValue placeholder="Select a hearing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Hearing Status</SelectLabel>
                      <SelectItem value="pending_schedule">Pending Schedule</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending_decision">Pending Decision</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Lupon Selector */}
              <div className="grid grid-cols-1 gap-2 ">
                <Label htmlFor={`lupon-${i}`}>Assigned Lupon Member</Label>
                <Popover
                  open={openPopover === i}
                  onOpenChange={(o) => setOpenPopover(o ? i : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      role="combobox"
                      aria-expanded={openPopover === i}
                      variant="outline"
                      className="max-w-max min-w-full justify-between"
                    >
                      {hearingInfo[i]?.lupon_member
                        ? (() => {
                          // ✅ FIX 3: Robust Finding Logic (String vs Number safe)
                          const found = luponMembers.find(
                            (lupon) => String(lupon.id) === String(hearingInfo[i].lupon_member)
                          );
                          return found ? `${found.first_name} ${found.last_name}` : "Unknown Member";
                        })()
                        : "Select lupon member..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search lupon members..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No lupon members found.</CommandEmpty>
                        <CommandGroup>
                          {luponMembers.map((lupon) => (
                            <CommandItem
                              key={lupon.id}

                              value={`${lupon.first_name} ${lupon.last_name}`}
                              onSelect={() => handleLuponChange(i, lupon.id)}
                            >
                              {lupon.first_name} {lupon.last_name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  // ✅ FIX 5: Safe Type Comparison
                                  String(hearingInfo[i]?.lupon_member) === String(lupon.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}