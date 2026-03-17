import React from "react";
import { Building2, Heart, ShieldCheck } from "lucide-react";

const HomeTrustSection = () => {
  return (
    <section className="border-b border-[var(--home-border)] bg-[var(--home-surface)] py-6">
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <p className="home-trust-pill reveal-item">
          <ShieldCheck size={16} />
          Tin đăng có kiểm duyệt trạng thái
        </p>
        <p className="home-trust-pill reveal-item">
          <Building2 size={16} />
          Nhóm theo tỉnh/thành để khám phá nhanh
        </p>
        <p className="home-trust-pill reveal-item">
          <Heart size={16} />
          Lưu và chia sẻ ngay trên từng card
        </p>
      </div>
    </section>
  );
};

export default HomeTrustSection;
