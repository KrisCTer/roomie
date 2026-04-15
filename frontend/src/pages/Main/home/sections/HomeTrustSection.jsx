import React from "react";
import { Building2, Heart, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const HomeTrustSection = () => {
  const { t } = useTranslation();

  return (
    <section className="border-b border-[var(--home-border)] bg-[var(--home-surface)] py-6">
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <p className="home-trust-pill reveal-item">
          <ShieldCheck size={16} />
          {t("home.trustVerified")}
        </p>
        <p className="home-trust-pill reveal-item">
          <Building2 size={16} />
          {t("home.trustGrouped")}
        </p>
        <p className="home-trust-pill reveal-item">
          <Heart size={16} />
          {t("home.trustSaveShare")}
        </p>
      </div>
    </section>
  );
};

export default HomeTrustSection;
