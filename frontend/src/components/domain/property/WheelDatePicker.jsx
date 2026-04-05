import React, { useState, useEffect, useRef, useMemo } from "react";

const WheelDatePicker = ({ value, onchange, minDate, label }) => {
  // Initialize with today's date or parse from value prop
  const getInitialDate = () => {
    if (value) {
      const [y, m, d] = value.split("-");
      return { day: d, month: m, year: y };
    }
    const today = new Date();
    return {
      day: String(today.getDate()).padStart(2, "0"),
      month: String(today.getMonth() + 1).padStart(2, "0"),
      year: today.getFullYear().toString(),
    };
  };

  const initialDate = useMemo(() => getInitialDate(), [value]);
  const [day, setDay] = useState(initialDate.day);
  const [month, setMonth] = useState(initialDate.month);
  const [year, setYear] = useState(initialDate.year);
  const [draggingWheel, setDraggingWheel] = useState(null);
  const [dragStart, setDragStart] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const dayWheelRef = useRef(null);
  const monthWheelRef = useRef(null);
  const yearWheelRef = useRef(null);

  const toDateString = (d, m, y) => `${y}-${m}-${d}`;

  const getDaysInMonth = (monthValue, yearValue) => {
    const monthNum = parseInt(monthValue, 10);
    const yearNum = parseInt(yearValue, 10);
    return new Date(yearNum, monthNum, 0).getDate();
  };

  const normalizeDateParts = (parts) => {
    const maxDays = getDaysInMonth(parts.month, parts.year);
    const dayNum = Math.min(parseInt(parts.day, 10), maxDays);
    return {
      day: String(dayNum).padStart(2, "0"),
      month: parts.month,
      year: parts.year,
    };
  };

  const toComparableDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const applyDate = (next) => {
    setYear(next.year);
    setMonth(next.month);
    setDay(next.day);
  };

  const getDateFromParts = (d, m, y) => {
    const maxDays = getDaysInMonth(m, y);
    const dayNum = Math.min(parseInt(d, 10), maxDays);
    const monthNum = parseInt(m, 10) - 1;
    const yearNum = parseInt(y, 10);
    return new Date(yearNum, monthNum, dayNum);
  };

  const canUseDate = (next) => {
    const min = toComparableDate(minDate);
    if (!min) return true;
    const nextDate = getDateFromParts(next.day, next.month, next.year);
    return nextDate >= min;
  };

  const requestDateChange = (next) => {
    const normalizedNext = normalizeDateParts(next);

    if (canUseDate(normalizedNext)) {
      setWarningMessage("");
      applyDate(normalizedNext);
      return;
    }

    setWarningMessage("Không thể chọn ngày trước mốc tối thiểu.");
  };

  // Keep local state in sync when value changes from parent.
  useEffect(() => {
    if (!value) return;
    const [nextYear, nextMonth, nextDay] = value.split("-");
    if (!nextYear || !nextMonth || !nextDay) return;

    if (nextYear !== year || nextMonth !== month || nextDay !== day) {
      applyDate({ year: nextYear, month: nextMonth, day: nextDay });
    }
  }, [value]);

  // Notify parent of date change only
  useEffect(() => {
    const dateStr = toDateString(day, month, year);
    onchange?.(dateStr);
  }, [day, month, year]);

  const incrementValue = (value, max) => {
    const num = parseInt(value);
    return String((num % max) + 1).padStart(2, "0");
  };

  const decrementValue = (value, max) => {
    const num = parseInt(value);
    return String(num === 1 ? max : num - 1).padStart(2, "0");
  };

  // Drag handlers
  const handleMouseDown = (wheel, e) => {
    setDraggingWheel(wheel);
    setDragStart(e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingWheel) return;

      const deltaY = e.clientY - dragStart;
      const threshold = 30; // pixels needed to trigger rotation

      if (Math.abs(deltaY) > threshold) {
        const current = { day, month, year };
        const next = { ...current };

        if (draggingWheel === "day") {
          const maxDays = getDaysInMonth(current.month, current.year);
          if (deltaY < 0) {
            next.day = incrementValue(current.day, maxDays);
          } else {
            next.day = decrementValue(current.day, maxDays);
          }
        } else if (draggingWheel === "month") {
          if (deltaY < 0) {
            next.month = incrementValue(current.month, 12);
          } else {
            next.month = decrementValue(current.month, 12);
          }

          const maxDays = getDaysInMonth(next.month, next.year);
          if (parseInt(next.day, 10) > maxDays) {
            next.day = String(maxDays).padStart(2, "0");
          }
        } else if (draggingWheel === "year") {
          if (deltaY < 0) {
            next.year = (parseInt(current.year, 10) + 1).toString();
          } else {
            next.year = (parseInt(current.year, 10) - 1).toString();
          }

          const maxDays = getDaysInMonth(next.month, next.year);
          if (parseInt(next.day, 10) > maxDays) {
            next.day = String(maxDays).padStart(2, "0");
          }
        }

        requestDateChange(next);

        // Reset for next rotation
        setDragStart(e.clientY);
      }
    };

    const handleMouseUp = () => {
      setDraggingWheel(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingWheel, dragStart]);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-4">
        {label}
      </label>

      <div className="flex items-center justify-center gap-4 bg-gradient-to-b from-[#FFFBF6] to-white rounded-2xl p-6 border border-[#E5D5C2]">
        {/* Day Wheel */}
        <div className="flex-1 flex items-center justify-center">
          <div
            ref={dayWheelRef}
            onMouseDown={(e) => handleMouseDown("day", e)}
            className="w-full h-24 flex items-center justify-center rounded-xl bg-white border-2 border-[#CC6F4A] shadow-md cursor-grab active:cursor-grabbing select-none hover:shadow-lg transition-shadow"
          >
            <div className="text-5xl font-bold text-[#CC6F4A]">{day}</div>
          </div>
        </div>

        {/* Month Wheel */}
        <div className="flex-1 flex items-center justify-center">
          <div
            ref={monthWheelRef}
            onMouseDown={(e) => handleMouseDown("month", e)}
            className="w-full h-24 flex items-center justify-center rounded-xl bg-white border-2 border-[#CC6F4A] shadow-md cursor-grab active:cursor-grabbing select-none hover:shadow-lg transition-shadow"
          >
            <div className="text-5xl font-bold text-[#CC6F4A]">{month}</div>
          </div>
        </div>

        {/* Year Wheel */}
        <div className="flex-1 flex items-center justify-center">
          <div
            ref={yearWheelRef}
            onMouseDown={(e) => handleMouseDown("year", e)}
            className="w-full h-24 flex items-center justify-center rounded-xl bg-white border-2 border-[#CC6F4A] shadow-md cursor-grab active:cursor-grabbing select-none hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl font-bold text-[#CC6F4A]">{year}</div>
          </div>
        </div>
      </div>

      {warningMessage && (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
          <p className="text-sm text-amber-900">{warningMessage}</p>
        </div>
      )}
    </div>
  );
};

export default WheelDatePicker;
