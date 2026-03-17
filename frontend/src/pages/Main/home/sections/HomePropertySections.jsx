import React from "react";
import { ArrowRight } from "lucide-react";
import HomePropertyCard from "./HomePropertyCard";
import { transformToCardData } from "../utils/homePresentation";

const HomePropertySections = ({
  loading,
  highlightedSections,
  t,
  onViewAll,
  onCardClick,
}) => {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-80 animate-pulse rounded-3xl border border-[var(--home-border)] bg-white"
            />
          ))}
        </div>
      ) : highlightedSections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--home-border-strong)] bg-white p-10 text-center">
          <p className="text-xl font-semibold text-[var(--home-charcoal)]">
            {t("home.noProperties") || "Chưa có bất động sản nào"}
          </p>
        </div>
      ) : (
        <div className="space-y-10 lg:space-y-12">
          {highlightedSections.map((section, sectionIndex) => {
            const sectionTitle = `${t("home.propertiesIn")} ${
              section.province === "__OTHER__"
                ? t("home.other")
                : section.province
            }`;

            return (
              <section
                key={section.province}
                className="reveal-item"
                aria-label={sectionTitle}
              >
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">
                      {sectionIndex === 0 ? "Editor pick" : "Hot area"}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-[var(--home-charcoal)]">
                      {sectionTitle}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewAll(section.province)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--home-border-strong)] bg-white px-4 text-sm font-semibold transition hover:bg-[var(--home-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-focus)]"
                  >
                    Xem tất cả <ArrowRight size={15} />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items
                    .slice(0, 6)
                    .map((property) => transformToCardData(property, t))
                    .map((card) => (
                      <HomePropertyCard
                        key={card.id}
                        property={card}
                        onCardClick={onCardClick}
                      />
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HomePropertySections;
