import React, { useEffect, useState } from "react";
import { ChevronRight, Sparkles, Home } from "lucide-react";
import "./bubble-animation.css";

const PageTitle = ({ title, subtitle }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className="relative overflow-hidden px-8 py-6 border-b shadow-lg"
      style={{
        backgroundColor: "#E1F5FE",
        backgroundImage:
          "linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 50%, #81D4FA 100%)",
      }}
    >
      {/* Animated Background Gradient Wave */}
      <div className="absolute inset-0 opacity-30">
        <div className="wave-animation"></div>
      </div>

      {/* Floating Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              transform: `scale(${0.5 + Math.random() * 1.5})`,
            }}
          ></div>
        ))}
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="sparkle-particle"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-3 h-3 text-blue-300" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 flex flex-col transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Breadcrumb with Animation */}
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="text-xs uppercase text-gray-600 tracking-widest font-medium slide-in-left">
            ROOMIE
          </span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-xs uppercase text-blue-700 tracking-widest font-semibold slide-in-right">
            {title.toUpperCase()}
          </span>
        </div>

        {/* Title with Gradient Text */}
        <div className="flex items-center gap-3">
          <div className="title-icon-wrapper">
            <ChevronRight className="w-5 h-5 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 bg-clip-text text-transparent animate-gradient">
            {subtitle}
          </h1>
        </div>

        {/* Decorative underline */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full underline-animation"></div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-200 rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
    </div>
  );
};

export default PageTitle;
