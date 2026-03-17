import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Container } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditorialHeader from "../../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../../components/layout/layoutHome/EditorialFooter";

const PropertyDetailNotFoundSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="home-v2 min-h-screen bg-[var(--home-bg)]">
      <EditorialHeader />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <div className="mx-auto max-w-xl rounded-3xl border border-[#ECDCC8] bg-white p-10 text-center shadow-[0_16px_40px_rgba(17,24,39,0.08)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("propertyDetail.notFoundTitle")}
          </h2>
          <p className="mt-2 text-gray-600">
            {t("propertyDetail.notFoundDesc")}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-black"
          >
            {t("propertyDetail.back")}
          </button>
        </div>
      </Container>
      <EditorialFooter description="Không tìm thấy bất động sản, bạn có thể quay lại danh sách khám phá." />
    </div>
  );
};

export default PropertyDetailNotFoundSection;
