"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  unavailableDates: string[];
  onSelect: (start: string | null, end: string | null) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function DateRangePicker({ startDate, endDate, unavailableDates, onSelect }: DateRangePickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const unavailableSet = new Set(unavailableDates);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (dateStr: string) => {
    if (unavailableSet.has(dateStr)) return;
    if (dateStr < formatYMD(today)) return;

    if (!startDate || (startDate && endDate)) {
      onSelect(dateStr, null);
    } else if (dateStr < startDate) {
      onSelect(dateStr, null);
    } else if (dateStr === startDate) {
      onSelect(null, null);
    } else {
      // Check if any unavailable dates are in range
      let cursor = new Date(startDate);
      const end = new Date(dateStr);
      let hasConflict = false;
      while (cursor <= end) {
        if (unavailableSet.has(formatYMD(cursor))) { hasConflict = true; break; }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (hasConflict) {
        onSelect(dateStr, null);
      } else {
        onSelect(startDate, dateStr);
      }
    }
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  const cells: (string | null)[] = [...Array(offset).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    cells.push(formatYMD(date));
  }

  const isInRange = (dateStr: string) => {
    if (!startDate || !endDate) return false;
    return dateStr > startDate && dateStr < endDate;
  };

  return (
    <div className="bg-white rounded-2xl border border-cream-dark p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 hover:bg-cream-dark rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-stone" />
        </button>
        <span className="font-semibold text-dark text-sm">
          {MONTHS_TR[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-cream-dark rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-stone" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-stone font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={i} />;

          const isToday = dateStr === formatYMD(today);
          const isPast = dateStr < formatYMD(today);
          const isUnavailable = unavailableSet.has(dateStr);
          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          const inRange = isInRange(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              disabled={isPast || isUnavailable}
              className={`
                relative text-xs py-1.5 rounded-lg font-medium transition-all
                ${isPast || isUnavailable ? "text-stone/30 cursor-not-allowed line-through" : "cursor-pointer hover:bg-cream-dark"}
                ${isStart || isEnd ? "bg-forest text-cream hover:bg-forest-light" : ""}
                ${inRange ? "bg-forest/10 text-forest rounded-none" : ""}
                ${isToday && !isStart && !isEnd ? "ring-1 ring-orange" : ""}
              `}
            >
              {new Date(dateStr + "T00:00:00").getDate()}
            </button>
          );
        })}
      </div>

      {/* Selection summary */}
      {(startDate || endDate) && (
        <div className="mt-4 pt-4 border-t border-cream-dark">
          <div className="flex items-center justify-between">
            <div className="text-xs text-stone">
              {startDate && (
                <span>
                  <span className="font-medium text-dark">
                    {new Date(startDate + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </span>
                  {endDate && (
                    <>
                      {" → "}
                      <span className="font-medium text-dark">
                        {new Date(endDate + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                      </span>
                    </>
                  )}
                </span>
              )}
            </div>
            <button onClick={() => onSelect(null, null)} className="text-stone hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
