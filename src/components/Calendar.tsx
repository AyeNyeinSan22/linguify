"use client";

import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["S","M","T","W","T","F","S"];

export default function Calendar() {
  const [currentDate] = useState(new Date(2025, 0, 1));
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const getFirstDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const days = Array(getFirstDay(currentDate)).fill(null).concat(Array.from({length: getDaysInMonth(currentDate)}, (_,i)=>i+1));
  const highlighted = [17]; const completed = [1,2,3,5,8,10,15,16];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS.map((d,i)=><div key={i} className="text-center text-xs font-semibold text-text-muted">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day,i)=>(
          <div key={i} className="aspect-square">
            {day ? (
              <button className={`w-full h-full rounded-lg font-medium text-xs transition-all ${
                highlighted.includes(day) ? "bg-accent-500 text-white font-bold shadow-lg shadow-accent-500/20 scale-105"
                : completed.includes(day) ? "bg-blue-50 text-text-primary"
                : "text-text-secondary hover:bg-gray-50"
              }`}>{day}</button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
