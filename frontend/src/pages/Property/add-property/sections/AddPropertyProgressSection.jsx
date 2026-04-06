import React from "react";

const stepLabels = [
  "Thông tin",
  "Vị trí",
  "Tiện ích",
  "Ảnh & Media",
  "Xem lại",
];

const AddPropertyProgressSection = ({ currentStep }) => {
  return (
    <section className="home-glass-card mb-6 rounded-3xl p-6">
      <div className="relative mb-4">
        <div className="relative z-10 grid grid-cols-5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex justify-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  currentStep >= step
                    ? "home-btn-accent text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute left-[10%] right-[10%] top-5 h-1 rounded-full bg-slate-200" />

        <div
          className="absolute left-[10%] top-5 h-1 rounded-full transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / 4) * 80}%`,
            backgroundColor: "var(--home-accent-strong)",
          }}
        />
      </div>

      <div className="grid grid-cols-5 gap-y-2 text-center text-xs font-medium text-slate-600 md:text-sm">
        {stepLabels.map((label, index) => (
          <span
            key={label}
            className={currentStep >= index + 1 ? "home-text-accent" : ""}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default AddPropertyProgressSection;
