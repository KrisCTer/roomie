import React from "react";
import { useNavigate } from "react-router-dom";

const EditorialFooter = ({
  description = "Roomie search & discovery experience with section-based IA, interactive cards, and mobile-first browsing.",
}) => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-[var(--home-border)] bg-[var(--home-charcoal)] py-10 text-[var(--home-surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <p className="home-footer-logo">Roomie</p>
          <p className="mt-3 max-w-xl text-sm text-[var(--home-surface)]/80">
            {description}
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              type="button"
              onClick={() => navigate("/search")}
              className="home-footer-link"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => navigate("/my-favorites")}
              className="home-footer-link"
            >
              Yêu thích
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="home-footer-link"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="home-footer-link"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EditorialFooter;
