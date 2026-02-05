import { useState, useEffect } from "react";
import { RefreshCcw, Check, ChevronsUpDown, CalendarIcon, Loader2, Users } from "lucide-react";
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
import { useCaseStore } from "@/store/useCaseStore";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Available time slots for hearings
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00"
];

// Workload level badge colors
const LOAD_COLORS = {
  light: "bg-green-100 text-green-700",
  moderate: "bg-amber-100 text-amber-700",
  heavy: "bg-red-100 text-red-700"
};

export function HearingSched({ predicted, luponMembers }) {
  const predicted_hearings = predicted || 3;
  const { setHearings } = useCaseStore();
  const [openPopover, setOpenPopover] = useState(null);
  const [openCalendar, setOpenCalendar] = useState(null);
  const [mode, setMode] = useState("standard");
  const [expediteInterval, setExpediteInterval] = useState(null);
  const [loadingTimeSlot, setLoadingTimeSlot] = useState(null);

  // Workload state for smart Lupon assignment
  const [luponWorkloads, setLuponWorkloads] = useState({});
  const [suggestedLuponId, setSuggestedLuponId] = useState(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  const currentYear = new Date().getFullYear();

  // Fetch Lupon workload data on mount
  useEffect(() => {
    const fetchLuponWorkload = async () => {
      setLoadingWorkload(true);
      try {
        const response = await axios.get(`${API_URL}/lupon-workload/`);
        const { workloads, suggested_member } = response.data;

        // Create a map of member_id -> workload info
        const workloadMap = {};
        workloads.forEach(w => {
          workloadMap[w.member_id] = w;
        });
        setLuponWorkloads(workloadMap);

        // Set the suggested (least busy) member
        if (suggested_member) {
          setSuggestedLuponId(suggested_member.member_id);
        }
      } catch (error) {
        console.error("Error fetching Lupon workload:", error);
      } finally {
        setLoadingWorkload(false);
      }
    };

    if (luponMembers?.length > 0) {
      fetchLuponWorkload();
    }
  }, [luponMembers]);

  // Helper to generate hearings array
  const generateHearings = (count) => {
    const h_info = [];
    for (let i = 0; i < count; i++) {
      h_info.push({
        hearing_number: i + 1,
        hearing_date: null,
        time: null,
        lupon_member_id: null,
      });
    }
    return h_info;
  };

  const [hearingInfo, setHearingInfo] = useState(() => generateHearings(predicted_hearings));

  // Sync hearing count when predicted changes
  useEffect(() => {
    setHearingInfo((prevInfo) => {
      const newCount = predicted_hearings;
      const currentCount = prevInfo.length;

      if (newCount === currentCount) return prevInfo;

      if (newCount > currentCount) {
        // Add more hearings
        const newHearings = [...prevInfo];
        for (let i = currentCount; i < newCount; i++) {
          newHearings.push({
            hearing_number: i + 1,
            hearing_date: null,
            time: null,
            lupon_member_id: null,
          });
        }
        // Recalculate dates if not in custom mode
        if (mode !== "custom" && newHearings[0]?.hearing_date) {
          const interval = mode === "standard" ? 7 : (expediteInterval || 7);
          return recalculateDates(newHearings[0].hearing_date, interval, newHearings);
        }
        return newHearings;
      } else {
        // Remove extra hearings
        return prevInfo.slice(0, newCount);
      }
    });
  }, [predicted_hearings]);

  const addDaysSkippingSunday = (date, daysToAdd) => {
    let newDate = new Date(date);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      newDate.setDate(newDate.getDate() + 1);
      if (newDate.getDay() !== 0) {
        // Skip Sundays
        addedDays++;
      }
    }
    return newDate;
  };

  // Find the first available date for a specific Lupon (starting from minDate)
  const getFirstAvailableDateForLupon = (luponId, minDate = new Date()) => {
    if (!luponId || !luponMembers?.length) return addDaysSkippingSunday(minDate, 7);

    const lupon = luponMembers.find(m => m.id === luponId);
    if (!lupon) return addDaysSkippingSunday(minDate, 7);

    const schedules = lupon.schedules || lupon.sched || [];
    if (!Array.isArray(schedules) || schedules.length === 0) {
      // No specific schedule = available any day except Sunday
      return addDaysSkippingSunday(minDate, 7);
    }

    // Find which days this Lupon works
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const workDays = schedules.map(s => typeof s === 'string' ? s : s.day);

    // Start from minDate + 7 days (at least 1 week notice)
    let checkDate = new Date(minDate);
    checkDate.setDate(checkDate.getDate() + 7);

    // Find the next day that the Lupon works (max 14 days search)
    for (let i = 0; i < 14; i++) {
      const dayName = dayNames[checkDate.getDay()];
      if (workDays.includes(dayName) && checkDate.getDay() !== 0) {
        return checkDate;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    // Fallback: just use 7 days from today (skip Sunday)
    return addDaysSkippingSunday(minDate, 7);
  };

  // Recalculate dates for all hearings
  // For Standard mode: all hearings exactly 7 days apart (same day of week)
  const recalculateDates = (startFromDate, interval, currentInfo) => {
    const newHearings = [...currentInfo];

    // Set the first hearing date
    let baseDate = startFromDate ? new Date(startFromDate) : new Date();

    // Ensure the base date itself isn't a Sunday
    if (baseDate.getDay() === 0) {
      baseDate.setDate(baseDate.getDate() + 1);
    }

    newHearings[0].hearing_date = baseDate;

    // Loop through the rest and apply interval
    for (let i = 1; i < newHearings.length; i++) {
      const prevDate = newHearings[i - 1].hearing_date;
      if (prevDate) {
        // For Standard mode (7-day interval), use exact 7 days to maintain same day of week
        if (interval === 7) {
          let nextDate = new Date(prevDate);
          nextDate.setDate(nextDate.getDate() + 7); // Exact 7 days = same day of week
          newHearings[i].hearing_date = nextDate;
        } else {
          // For Expedite/Custom: use the skip-Sunday logic
          let nextDate = addDaysSkippingSunday(new Date(prevDate), interval);
          newHearings[i].hearing_date = nextDate;
        }
      }
    }
    return newHearings;
  };

  // Get Lupons available on a specific day based on their schedules
  const getAvailableLuponsForDate = (date) => {
    if (!luponMembers || luponMembers.length === 0 || !date) return [];

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    return luponMembers.filter(member => {
      const schedules = member.schedules || member.sched || [];
      // If no schedules defined, assume always available
      if (!Array.isArray(schedules) || schedules.length === 0) return true;
      return schedules.some(s =>
        (typeof s === 'string' && s === dayName) || s.day === dayName
      );
    });
  };

  // Get least busy Lupon from a list, returns array if there's a tie
  const getLeastBusyLupons = (memberList) => {
    if (!memberList || memberList.length === 0) return [];

    // Sort by workload
    const sorted = [...memberList].sort((a, b) => {
      const wA = luponWorkloads[a.id]?.total_hearings || 0;
      const wB = luponWorkloads[b.id]?.total_hearings || 0;
      return wA - wB;
    });

    // Get all members with the same (lowest) workload
    const minWorkload = luponWorkloads[sorted[0]?.id]?.total_hearings || 0;
    return sorted.filter(m => (luponWorkloads[m.id]?.total_hearings || 0) === minWorkload);
  };

  // Get recommended Lupon(s) for STANDARD mode (global least busy)
  const getStandardModeRecommendation = () => {
    if (!luponMembers || luponMembers.length === 0) return [];
    return getLeastBusyLupons(luponMembers);
  };

  // Get recommended Lupon for a specific date (for EXPEDITE/CUSTOM mode)
  const getLuponForDate = (date) => {
    if (!date) return null;

    // Get Lupons available on this day
    const available = getAvailableLuponsForDate(date);

    if (available.length > 0) {
      // Return the least busy among available
      const leastBusy = getLeastBusyLupons(available);
      return leastBusy[0]?.id || null;
    }

    // Fallback: return globally least busy if none scheduled for this day
    const globalLeastBusy = getLeastBusyLupons(luponMembers);
    return globalLeastBusy[0]?.id || luponMembers[0]?.id || null;
  };

  // Main function to get default Lupon based on current mode
  const getDefaultLupon = (date, isFirstHearing = false) => {
    if (!luponMembers || luponMembers.length === 0) return null;

    if (mode === "standard") {
      // STANDARD MODE: Same Lupon for all hearings
      // Just pick the globally least busy one
      const recommended = getStandardModeRecommendation();
      return recommended[0]?.id || luponMembers[0]?.id || null;
    } else {
      // EXPEDITE / CUSTOM MODE: Per-date assignment based on schedule + workload
      return getLuponForDate(date);
    }
  };

  useEffect(() => {
    if (mode === "custom") return;

    const interval = mode === "standard" ? 7 : expediteInterval;

    if (interval) {
      const today = new Date();

      if (mode === "standard") {
        // STANDARD MODE: First pick Lupon, then find date they work
        // Step 1: Get the least busy Lupon globally
        const recommendedLupon = getStandardModeRecommendation()[0]?.id || null;

        // Step 2: Find the first date that Lupon works (at least 7 days from now)
        const startingDate = recommendedLupon
          ? getFirstAvailableDateForLupon(recommendedLupon, today)
          : addDaysSkippingSunday(today, 7);

        // Step 3: Calculate all hearing dates (exactly 7 days apart = same day of week)
        const newHearingData = recalculateDates(startingDate, 7, hearingInfo);

        // Step 4: Assign the SAME Lupon to ALL hearings
        for (let i = 0; i < newHearingData.length; i++) {
          if (newHearingData[i].hearing_date) {
            if (!newHearingData[i].time) {
              newHearingData[i].time = "09:00";
            }
            // All hearings get the SAME Lupon in standard mode
            if (luponMembers?.length > 0 && recommendedLupon) {
              newHearingData[i].lupon_member_id = recommendedLupon;
            }
          }
        }

        setHearingInfo(newHearingData);
        setHearings(newHearingData);
      } else {
        // EXPEDITE MODE: Each hearing gets Lupon available on THAT day
        const startingDate = addDaysSkippingSunday(today, interval);
        const newHearingData = recalculateDates(startingDate, interval, hearingInfo);

        // ALWAYS reassign when interval changes to reflect correct availability
        for (let i = 0; i < newHearingData.length; i++) {
          if (newHearingData[i].hearing_date) {
            if (!newHearingData[i].time) {
              newHearingData[i].time = "09:00";
            }
            // Each hearing gets the best Lupon for ITS specific date
            if (luponMembers?.length > 0) {
              newHearingData[i].lupon_member_id = getLuponForDate(newHearingData[i].hearing_date);
            }
          }
        }

        setHearingInfo(newHearingData);
        setHearings(newHearingData);
      }
    }
  }, [mode, expediteInterval, luponMembers, Object.keys(luponWorkloads).length]);

  // Fetch optimal time slot for a given date
  const fetchOptimalTime = async (date, index) => {
    if (!date) return "09:00"; // Default to 9 AM

    setLoadingTimeSlot(index);
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      const response = await axios.get(`${API_URL}/optimal-slot/`, {
        params: { date: dateStr }
      });

      // API returns { optimal_time: "09:00", all_slots: [...], load_status: "light" }
      if (response.data?.optimal_time) {
        return response.data.optimal_time;
      }
      // Fallback to 9 AM
      return "09:00";
    } catch (error) {
      console.error("Error fetching optimal time:", error);
      // Fallback: suggest 9 AM if API fails
      return "09:00";
    } finally {
      setLoadingTimeSlot(null);
    }
  };

  // Auto-assign times for all hearings
  const autoAssignTimes = async (hearingsData) => {
    const updatedHearings = [...hearingsData];

    for (let i = 0; i < updatedHearings.length; i++) {
      if (updatedHearings[i].hearing_date && !updatedHearings[i].time) {
        const optimalTime = await fetchOptimalTime(updatedHearings[i].hearing_date, i);
        updatedHearings[i].time = optimalTime;
      }
    }

    return updatedHearings;
  };

  const handleDateSelect = async (index, date) => {
    let newHearingInfo = [...hearingInfo];
    newHearingInfo[index].hearing_date = date;

    // If NOT in custom mode and we changed the first date, cascade changes
    if (mode !== "custom" && index === 0) {
      const interval = mode === "standard" ? 7 : expediteInterval;
      if (interval) {
        newHearingInfo = recalculateDates(date, interval, newHearingInfo);
      }
    }

    // Auto-assign time for the selected date
    const optimalTime = await fetchOptimalTime(date, index);
    newHearingInfo[index].time = optimalTime;

    // If dates were cascaded, assign times for all
    if (mode !== "custom" && index === 0) {
      newHearingInfo = await autoAssignTimes(newHearingInfo);
    }

    // Auto-assign Lupon based on mode
    if (mode === "standard") {
      // STANDARD: Same Lupon for all hearings (only set if not already assigned)
      const recommendedLupon = getDefaultLupon(newHearingInfo[0]?.hearing_date);
      for (let j = 0; j < newHearingInfo.length; j++) {
        if (!newHearingInfo[j].lupon_member_id) {
          newHearingInfo[j].lupon_member_id = recommendedLupon;
        }
      }
    } else {
      // EXPEDITE/CUSTOM: Each hearing gets Lupon available on THAT day
      // ALWAYS recalculate when dates change to reflect the correct availability
      if (mode !== "custom" && index === 0) {
        // Dates were cascaded, reassign ALL Lupons based on new dates
        for (let j = 0; j < newHearingInfo.length; j++) {
          if (newHearingInfo[j].hearing_date) {
            newHearingInfo[j].lupon_member_id = getLuponForDate(newHearingInfo[j].hearing_date);
          }
        }
      } else {
        // Custom mode or individual date change - only update the changed date
        newHearingInfo[index].lupon_member_id = getLuponForDate(date);
      }
    }

    setHearings(newHearingInfo);
    setHearingInfo(newHearingInfo);
    setOpenCalendar(null);
  };

  return (
    <div className="flex flex-col gap-3 col-span-2">
      <div className="flex flex-col gap-4 bg-gray-200 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-700 ">SCHEDULING INTERVAL</p>
          <Button
            variant="outline"
            className="text-xs"
            onClick={(e) => {
              e.preventDefault();
              setMode("standard");
              setExpediteInterval(null);
            }}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Revert Changes to Default
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Standard Mode */}
          <label
            className={`group flex items-center p-2 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-redBase transition w-full sm:w-auto ${mode === "standard" ? "ring-2 ring-red-50" : ""
              }`}
          >
            <input
              type="radio"
              name="mode"
              value="standard"
              checked={mode === "standard"}
              onChange={() => setMode("standard")}
              className="w-5 h-5 text-redBase focus:ring-redBase"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-gray-800">
                Standard
              </span>
              <span className="block text-xs text-gray-500">Every 7 Days</span>
            </div>
          </label>

          {/* Expedite Mode */}
          <label
            className={`group flex items-center p-2 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-redBase transition w-full sm:w-auto ${mode === "expedite" ? "ring-2 ring-red-50" : ""
              }`}
          >
            <input
              type="radio"
              name="mode"
              value="expedite"
              checked={mode === "expedite"}
              onChange={() => setMode("expedite")}
              className="w-5 h-5 text-redBase focus:ring-redBase"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-gray-800">
                Expedite
              </span>
              <span className="block text-xs text-gray-500">
                Less than 7 Days
              </span>
            </div>
          </label>

          {/* Expedite Interval Selector */}
          {mode === "expedite" && (
            <Select
              onValueChange={(val) => setExpediteInterval(Number(val))}
              value={expediteInterval?.toString() || ""}
            >
              <SelectTrigger className="w-[180px] bg-white !h-full">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Interval</SelectLabel>
                  {[2, 3, 4, 5, 6].map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d} Days
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          {/* Custom mode */}
          <label
            className={`group flex items-center p-2 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-redBase transition w-full sm:w-auto ${mode === "custom" ? "ring-2 ring-red-50" : ""
              }`}
          >
            <input
              type="radio"
              name="mode"
              value="custom"
              checked={mode === "custom"}
              onChange={() => setMode("custom")}
              className="w-5 h-5 text-redBase focus:ring-redBase"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-gray-800">
                Custom
              </span>
              <span className="block text-xs text-gray-500">
                Custom Interval
              </span>
            </div>
          </label>
        </div>

      </div>

      {/* Hearing List */}
      {hearingInfo.map((h, i) => {
        const isDateEditable = mode === "custom" || i === 0;

        return (
          <div
            key={i}
            className="flex items-start gap-3 p-4 border border-gray-300 bg-white rounded-lg"
          >
            <p className="w-9 p-1 text-center rounded-full font-bold text-redBase bg-redBase/10">
              {h.hearing_number}
            </p>

            <div className="grid grid-cols-2 w-full gap-3">
              {/* Date */}
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor={`hearingDate-${i}`}>Date</Label>
                <Popover
                  open={openCalendar === i}
                  onOpenChange={(o) => {
                    if (isDateEditable) setOpenCalendar(o ? i : null);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id={`hearingDate-${i}`}
                      disabled={!isDateEditable}
                      className={cn(
                        "justify-between font-normal",
                        !isDateEditable && "opacity-80 bg-gray-50 cursor-not-allowed text-gray-600"
                      )}
                    >
                      {hearingInfo[i]?.hearing_date
                        ? dateFormatter(hearingInfo[i].hearing_date)
                        : "Select date"}
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="overflow-hidden p-0 w-72"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        hearingInfo[i]?.hearing_date
                          ? new Date(hearingInfo[i].hearing_date)
                          : null
                      }
                      //Disable Sundays AND any date <= Today
                      disabled={(date) =>
                        date.getDay() === 0 || date < new Date()
                      }
                      captionLayout="dropdown"
                      fromYear={currentYear}
                      toYear={currentYear + 10}
                      onSelect={(date) => {
                        handleDateSelect(i, date)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor={`time-${i}`}>Time</Label>
                <Input
                  id={`time-${i}`}
                  type="time"
                  value={hearingInfo[i]?.time || ""}
                  onChange={(e) => {
                    const newHearingInfo = [...hearingInfo];
                    newHearingInfo[i].time = e.target.value;
                    setHearingInfo(newHearingInfo);
                    setHearings(newHearingInfo);
                  }}
                />
              </div>

              {/* Lupon Selector */}
              <div className="grid grid-cols-1 gap-2 col-span-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`lupon-${i}`}>Assigned Lupon Member</Label>
                  {loadingWorkload ? (
                    <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                  ) : mode === "standard" ? (
                    <span className="text-xs text-blue-500">(same for all hearings)</span>
                  ) : (
                    <span className="text-xs text-gray-400">(by date availability)</span>
                  )}
                </div>
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
                      {hearingInfo[i]?.lupon_member_id ? (
                        <div className="flex items-center gap-2">
                          <span>
                            {luponMembers.find(l => l.id === hearingInfo[i].lupon_member_id)?.first_name}{' '}
                            {luponMembers.find(l => l.id === hearingInfo[i].lupon_member_id)?.last_name}
                          </span>
                          {luponWorkloads[hearingInfo[i].lupon_member_id] && (
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded-full",
                              LOAD_COLORS[luponWorkloads[hearingInfo[i].lupon_member_id].load_level]
                            )}>
                              {luponWorkloads[hearingInfo[i].lupon_member_id].load_level}
                            </span>
                          )}
                        </div>
                      ) : (
                        "Select lupon member..."
                      )}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search lupon members..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No lupon members found.</CommandEmpty>
                        <CommandGroup>
                          {/* Calculate recommended Lupon for THIS hearing */}
                          {(() => {
                            // Determine which Lupon is recommended for this hearing date
                            const recommendedForThisDate = mode === "standard"
                              ? suggestedLuponId  // Global recommendation for standard
                              : getLuponForDate(hearingInfo[i]?.hearing_date); // Date-specific for expedite/custom

                            return luponMembers
                              .map(lupon => ({
                                ...lupon,
                                workload: luponWorkloads[lupon.id] || null
                              }))
                              .sort((a, b) => {
                                // Sort by workload (least busy first)
                                const wA = a.workload?.total_hearings || 0;
                                const wB = b.workload?.total_hearings || 0;
                                return wA - wB;
                              })
                              .map((lupon) => (
                                <CommandItem
                                  key={lupon.id}
                                  value={lupon.id}
                                  onSelect={() => {
                                    const newHearingInfo = [...hearingInfo];

                                    if (mode === "standard") {
                                      // STANDARD MODE: Apply same Lupon to ALL hearings
                                      // One Lupon oversees the entire case
                                      for (let j = 0; j < newHearingInfo.length; j++) {
                                        newHearingInfo[j].lupon_member_id = lupon.id;
                                      }
                                    } else {
                                      // EXPEDITE/CUSTOM: Only change this specific hearing
                                      newHearingInfo[i].lupon_member_id = lupon.id;
                                    }

                                    setHearingInfo(newHearingInfo);
                                    setHearings(newHearingInfo);
                                    setOpenPopover(null);
                                  }}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <span>{lupon.first_name} {lupon.last_name}</span>
                                    {lupon.workload && (
                                      <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded-full",
                                        LOAD_COLORS[lupon.workload.load_level] || "bg-gray-100 text-gray-600"
                                      )}>
                                        {lupon.workload.total_hearings} cases
                                      </span>
                                    )}
                                    {lupon.id === recommendedForThisDate && (
                                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      hearingInfo[i]?.lupon_member_id === lupon.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ));
                          })()}
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