import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Sidebar from "../../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../../components/layout/layoutUser/Header.jsx";
import Footer from "../../../components/layout/layoutUser/Footer.jsx";
import useAddPropertyFormState from "./hooks/useAddPropertyFormState";
import AddPropertyLoadingSkeleton from "./sections/AddPropertyLoadingSkeleton";
import AddPropertyProgressSection from "./sections/AddPropertyProgressSection";
import AddPropertyFormSection from "./sections/AddPropertyFormSection";
import "../../../styles/apple-glass-dashboard.css";
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
    propertyId,
    propertyData,
    provinces,
    districts,
    wards,
    mapsLoaded,
    uploadedImages,
    uploadingImages,
    coverImage,
    reviewImagePage,
    totalReviewImagePages,
    handleInputChange,
    handleLocationChange,
    handleAddressResolved,
    handleAmenityToggle,
    handleImageUpload,
    removeImage,
    handleCoverUpload,
    removeCoverImage,
    handleToggle3dVisibility,
    handleNext,
    handlePrevious,
    handleSubmit,
    goToNextReviewImagePage,
    goToPreviousReviewImagePage,
    refetch,
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
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={
            isEditMode ? "Chỉnh sửa bất động sản" : "Thêm bất động sản mới"
          }
          pageSubtitle={
            isEditMode
              ? "Cập nhật thông tin, tiện ích và hình ảnh cho tin đăng"
              : "Tạo tin đăng mới với thông tin chi tiết và hình ảnh đầy đủ"
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
                coverImage={coverImage}
                isEditMode={isEditMode}
                propertyId={propertyId}
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
                onAddressResolved={handleAddressResolved}
                onAmenityToggle={handleAmenityToggle}
                onImageUpload={handleImageUpload}
                onImageRemove={removeImage}
                onCoverUpload={handleCoverUpload}
                onCoverRemove={removeCoverImage}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
                onPreviousReviewImagePage={goToPreviousReviewImagePage}
                onNextReviewImagePage={goToNextReviewImagePage}
                onToggle3dVisibility={handleToggle3dVisibility}
                onRefreshProperty={refetch}
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
