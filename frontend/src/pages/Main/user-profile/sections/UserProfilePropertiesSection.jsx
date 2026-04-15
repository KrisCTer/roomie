import React from "react";
import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import HomePropertyCard from "../../home/sections/HomePropertyCard";
import { transformToCardData } from "../../home/utils/homePresentation";

const UserProfilePropertiesSection = ({ properties, handlePropertyClick }) => {
  const { t } = useTranslation();

  return (
    <div className="apple-glass-panel no-hover rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold home-text-primary">
            {t("userProfile.properties")}
          </h2>
          <p className="text-xs home-text-muted">
            {t("userProfile.propertiesCount", { count: properties.length })}
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="apple-glass-soft rounded-2xl border-dashed text-center py-12">
          <div className="w-16 h-16 apple-glass-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 home-text-muted" />
          </div>
          <p className="home-text-primary text-lg font-medium mb-2">
            {t("userProfile.noProperties")}
          </p>
          <p className="home-text-muted text-sm">
            {t("userProfile.noPropertiesDesc")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          style={{ '--reveal-override': '1' }}
        >
          <style>{`.grid[style*="reveal-override"] .reveal-item { opacity: 1 !important; transform: none !important; }`}</style>
          {properties
            .map((p) => transformToCardData(p, t))
            .map((card) => (
              <HomePropertyCard
                key={card.id}
                property={card}
                onCardClick={handlePropertyClick}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePropertiesSection;
