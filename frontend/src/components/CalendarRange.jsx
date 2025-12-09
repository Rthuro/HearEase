"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

export function CalendarRange({ onChange, defaultValue  }) {
  const [open, setOpen] = React.useState(false)
  const maxDate = new Date();
  const today = new Date()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(today.getMonth() - 1)

  const initialRange = defaultValue;

  const [dateRange, setDateRange] = useState(initialRange)

  const handleSelect = (range) => {
    setDateRange(range)
    if (onChange) onChange(range)
  }

  const displayText =
    dateRange.from && dateRange.to
      ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
      : "Select date range"

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-range"
            className="w-64 justify-between font-normal"
          >
            {displayText}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              handleSelect(range)
              setOpen(false)
            }}
            numberOfMonths={2}
            className="rounded-lg border shadow-sm"
            captionLayout="dropdown"
            disabled={(date) => date > maxDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
