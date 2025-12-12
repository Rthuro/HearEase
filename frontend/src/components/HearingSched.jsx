import { useState, useEffect } from "react";
import { RefreshCcw, Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
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

export function HearingSched({ predicted, luponMembers }) {
  const predicted_hearings = predicted || 3;
  const { setHearings } = useCaseStore();
  const [openPopover, setOpenPopover] = useState(null);
  const [openCalendar, setOpenCalendar] = useState(null);
  const [mode, setMode] = useState("standard");
  const [expediteInterval, setExpediteInterval] = useState(null);

  const currentYear = new Date().getFullYear();

  const hearings = () => {
    const h_info = [];
    for (let i = 0; i < predicted_hearings; i++) {
      h_info.push({
        hearing_number: i + 1,
        hearing_date: null,
        time: null,
        lupon_member_id: null,
      });
    }
    return h_info;
  };

  const [hearingInfo, setHearingInfo] = useState(hearings);

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
        let nextDate = addDaysSkippingSunday(new Date(prevDate), interval);
        newHearings[i].hearing_date = nextDate;
      }
    }
    return newHearings;
  };

  useEffect(() => {
    if (mode === "custom") return;

    const interval = mode === "standard" ? 7 : expediteInterval;
    
    if (interval) {
        const today = new Date();
        const startingDate = addDaysSkippingSunday(today, interval);
        const newHearingData = recalculateDates(startingDate, interval, hearingInfo);
        setHearingInfo(newHearingData);
        setHearings(newHearingData);
        
    }
  }, [mode, expediteInterval]);

  const handleDateSelect = (index, date) => {
    let newHearingInfo = [...hearingInfo];
    newHearingInfo[index].hearing_date = date;

    // If NOT in custom mode and we changed the first date, cascade changes
    if (mode !== "custom" && index === 0) {
        const interval = mode === "standard" ? 7 : expediteInterval;
        if (interval) {
            newHearingInfo = recalculateDates(date, interval, newHearingInfo);
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
            className={`group flex items-center p-2 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-redBase transition w-full sm:w-auto ${
              mode === "standard" ? "ring-2 ring-red-50" : ""
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
            className={`group flex items-center p-2 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-redBase transition w-full sm:w-auto ${
              mode === "expedite" ? "ring-2 ring-red-50" : ""
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
            className={`group flex items-center p-2 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-redBase transition w-full sm:w-auto ${
              mode === "custom" ? "ring-2 ring-red-50" : ""
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
                      {hearingInfo[i]?.lupon_member_id
                        ? `${
                            luponMembers.find(
                              (lupon) =>
                                lupon.id === hearingInfo[i].lupon_member_id
                            )?.first_name
                          } ${
                            luponMembers.find(
                              (lupon) =>
                                lupon.id === hearingInfo[i].lupon_member_id
                            )?.last_name
                          }`
                        : "Select lupon member..."}
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
                          {luponMembers.map((lupon) => (
                            <CommandItem
                              key={lupon.id}
                              value={lupon.id}
                              onSelect={() => {
                                const newHearingInfo = [...hearingInfo];
                                newHearingInfo[i].lupon_member_id = lupon.id;
                                setHearingInfo(newHearingInfo);
                                setHearings(newHearingInfo);
                                setOpenPopover(null);
                              }}
                            >
                              {lupon.first_name} {lupon.last_name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  hearingInfo[i]?.lupon_member_id === lupon.id
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