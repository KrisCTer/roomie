import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Sidebar from "../../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../../components/layout/layoutUser/Header.jsx";
import Footer from "../../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../../components/common/PageTitle.jsx";
import useAddPropertyFormState from "./hooks/useAddPropertyFormState";
import AddPropertyLoadingSkeleton from "./sections/AddPropertyLoadingSkeleton";
import AddPropertyProgressSection from "./sections/AddPropertyProgressSection";
import AddPropertyFormSection from "./sections/AddPropertyFormSection";
import "../../../styles/home-redesign.css";

const AddPropertyPage = () => {
  const {
    activeMenu,
    setActiveMenu,
    sidebarOpen,
    setSidebarOpen,
    currentStep,
    loading,
    error,
    setError,
    success,
    isEditMode,
    propertyData,
    provinces,
    districts,
    wards,
    mapsLoaded,
    uploadedImages,
    uploadingImages,
    reviewImagePage,
    totalReviewImagePages,
    handleInputChange,
    handleLocationChange,
    handleAmenityToggle,
    handleImageUpload,
    removeImage,
    handleNext,
    handlePrevious,
    handleSubmit,
    goToNextReviewImagePage,
    goToPreviousReviewImagePage,
  } = useAddPropertyFormState();

  const isInitialEditLoading = loading && isEditMode && !propertyData.title;

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <PageTitle
          title={
            isEditMode ? "Chinh sua bat dong san" : "Them bat dong san moi"
          }
          subtitle={
            isEditMode
              ? "Cap nhat thong tin bat dong san cua ban"
              : "Tao danh sach bat dong san moi"
          }
        />

        <main className="w-full px-4 pb-8 pt-6 md:px-8">
          {isInitialEditLoading ? (
            <AddPropertyLoadingSkeleton />
          ) : (
            <>
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 transition-colors hover:text-red-600"
                  >
                    x
                  </button>
                </div>
              )}

              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Success!</h3>
                    <p className="text-sm text-green-700">
                      Property {isEditMode ? "updated" : "created"}{" "}
                      successfully. Redirecting...
                    </p>
                  </div>
                </div>
              )}

              <AddPropertyProgressSection currentStep={currentStep} />

              <AddPropertyFormSection
                currentStep={currentStep}
                propertyData={propertyData}
                uploadedImages={uploadedImages}
                uploadingImages={uploadingImages}
                isEditMode={isEditMode}
                loading={loading}
                provinces={provinces}
                districts={districts}
                wards={wards}
                mapsLoaded={mapsLoaded}
                error={error}
                setError={setError}
                reviewImagePage={reviewImagePage}
                totalReviewImagePages={totalReviewImagePages}
                onInputChange={handleInputChange}
                onLocationChange={handleLocationChange}
                onAmenityToggle={handleAmenityToggle}
                onImageUpload={handleImageUpload}
                onImageRemove={removeImage}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
                onPreviousReviewImagePage={goToPreviousReviewImagePage}
                onNextReviewImagePage={goToNextReviewImagePage}
              />
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AddPropertyPage;
