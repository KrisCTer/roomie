import React, { useEffect, useState } from "react";
import { ChevronRight, Home } from "lucide-react";

const PageTitle = ({ title, subtitle }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative overflow-hidden border-b border-[#E8D8C7] bg-[#FFFBF6] px-4 py-5 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,111,74,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(167,139,93,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute right-8 top-3 h-20 w-20 rounded-full bg-[#F6E3CF] blur-3xl opacity-60 animate-pulse" />

      <div
        className={`relative z-10 flex flex-col transition-all duration-500 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#8A5A44]">
          <Home className="h-3.5 w-3.5" />
          <span className="font-semibold">Roomie</span>
          <ChevronRight className="h-3 w-3 text-[#BFA58D]" />
          <span className="font-bold">{title}</span>
        </div>

        <h1 className="text-xl font-bold text-[#1F2937] md:text-2xl">
          {subtitle}
        </h1>

        <div className="mt-3 h-1.5 w-full max-w-56 overflow-hidden rounded-full bg-[#F0E1CF]">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-[#CC6F4A] via-[#D88762] to-[#E7B087] transition-all duration-700 ${
              isVisible ? "w-40 md:w-48" : "w-8"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default PageTitle;
