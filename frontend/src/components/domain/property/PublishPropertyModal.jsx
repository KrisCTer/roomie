import React from "react";

const PublishPropertyModal = ({ open, property, onConfirm, onCancel }) => {
  if (!open || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Publish property
        </h2>

        <p className="text-gray-600 mb-4">Are you sure you want to publish:</p>

        <div className="p-3 border rounded bg-gray-50 mb-4">
          <p className="font-medium text-gray-800">{property.title}</p>
          <p className="text-sm text-gray-500">
            {property.monthlyRent?.toLocaleString()} VND / month
          </p>
        </div>

        <p className="text-sm text-orange-600 mb-4">
          This property will be sent to admin for approval.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Confirm Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishPropertyModal;
