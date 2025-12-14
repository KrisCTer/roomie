import React from "react";
import { Upload, Trash2 } from "lucide-react";

const ImageUploader = ({
  uploadedImages,
  uploadingImages,
  onImageUpload,
  onImageRemove,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Upload Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
            disabled={uploadingImages}
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer ${
              uploadingImages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">
              {uploadingImages
                ? "Uploading images..."
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, JPEG, WEBP up to 10MB each
            </p>
          </label>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">
            Uploaded Images ({uploadedImages.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E";
                  }}
                />
                <button
                  type="button"
                  onClick={() => onImageRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
