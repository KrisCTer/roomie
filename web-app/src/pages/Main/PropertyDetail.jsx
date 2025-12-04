import React, { useState } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Calendar,
  Share2,
  Heart,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/layout/layoutHome/Header.jsx";
import Footer from "../../components/layout/layoutHome/Footer.jsx";

// Mock data based on PropertyResponse structure
const mockProperty = {
  propertyId: "prop-001",
  title: "Casa Lomas de Machali Machias",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  monthlyRent: 250.0,
  priceLabel: "month",
  rentalDeposit: 500.0,
  propertyType: "HOUSE",
  propertyStatus: "AVAILABLE",
  propertyLabel: "FEATURED",
  size: 1200,
  landArea: 1500,
  rooms: 5,
  bedrooms: 3,
  bathrooms: 2,
  garages: 2,
  yearBuilt: 2020,
  address: {
    fullAddress: "123 Main Street, Ho Chi Minh City",
    province: "Ho Chi Minh City",
    district: "District 1",
    ward: "Ward 5",
    street: "Main Street",
    houseNumber: "123",
    location: "10.762622, 106.660172",
  },
  amenities: {
    homeSafety: ["Smoke Detector", "Fire Extinguisher", "Security System"],
    bedroom: ["Air Conditioning", "Wardrobe", "King Size Bed"],
    kitchen: ["Refrigerator", "Microwave", "Gas Stove"],
    others: ["WiFi", "Parking", "Garden"],
  },
  mediaList: [
    {
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      type: "IMAGE",
    },
    {
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      type: "IMAGE",
    },
    {
      url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
      type: "IMAGE",
    },
  ],
  virtualTour: {
    type: "360",
    value: "https://virtualtour.example.com",
  },
  floors: [
    {
      name: "First Floor",
      price: 150.0,
      pricePostfix: "/month",
      size: 600,
      sizePostfix: "sq ft",
      bedrooms: 2,
      bathrooms: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400",
      description: "Spacious first floor with modern amenities",
    },
  ],
  owner: {
    ownerId: "owner-001",
    name: "John Doe",
    phone: "+84 123 456 789",
    email: "john.doe@example.com",
  },
  status: "APPROVED",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
};

const PropertyDetail = () => {
  const [activeMenu, setActiveMenu] = useState("Property Detail");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === mockProperty.mediaList.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? mockProperty.mediaList.length - 1 : prev - 1
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {/* Property Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mockProperty.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{mockProperty.address.fullAddress}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ${mockProperty.monthlyRent}
                  </div>
                  <div className="text-gray-600">
                    /{mockProperty.priceLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-gray-200 h-96">
                <img
                  src={mockProperty.mediaList[currentImageIndex]?.url}
                  alt="Property"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {mockProperty.mediaList.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="hidden lg:grid grid-rows-2 gap-4">
                <div className="rounded-xl overflow-hidden bg-gray-200">
                  <img
                    src={mockProperty.mediaList[1]?.url}
                    alt="Property"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden bg-gray-200">
                  <img
                    src={mockProperty.mediaList[2]?.url}
                    alt="Property"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Description</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {mockProperty.description}
                  </p>
                </div>

                {/* Property Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <Bed className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Bedrooms</div>
                        <div className="font-semibold">
                          {mockProperty.bedrooms}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bath className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Bathrooms</div>
                        <div className="font-semibold">
                          {mockProperty.bathrooms}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Garages</div>
                        <div className="font-semibold">
                          {mockProperty.garages}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Maximize className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Size</div>
                        <div className="font-semibold">
                          {mockProperty.size} m²
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Year Built</div>
                      <div className="font-semibold">
                        {mockProperty.yearBuilt}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Land Area</div>
                      <div className="font-semibold">
                        {mockProperty.landArea} m²
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">
                    Amenities And Features
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Home Safety</h3>
                      <div className="flex flex-wrap gap-2">
                        {mockProperty.amenities.homeSafety.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Bedroom</h3>
                      <div className="flex flex-wrap gap-2">
                        {mockProperty.amenities.bedroom.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Kitchen</h3>
                      <div className="flex flex-wrap gap-2">
                        {mockProperty.amenities.kitchen.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Location */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Map Location</h2>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <div>Map View</div>
                      <div className="text-sm">
                        {mockProperty.address.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Contact */}
              <div className="space-y-6">
                {/* Contact Owner */}
                <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {mockProperty.owner.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {mockProperty.owner.name}
                      </h3>
                      <p className="text-sm text-gray-500">Property Owner</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">
                        {mockProperty.owner.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">
                        {mockProperty.owner.email}
                      </span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3">
                    Contact Owner
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`flex-1 py-3 rounded-lg font-semibold border transition ${
                        isFavorite
                          ? "bg-red-50 border-red-300 text-red-600"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 mx-auto ${
                          isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button className="flex-1 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Share2 className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4">Additional Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID</span>
                      <span className="font-semibold">
                        {mockProperty.propertyId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type</span>
                      <span className="font-semibold">
                        {mockProperty.propertyType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="font-semibold text-green-600">
                        {mockProperty.propertyStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit</span>
                      <span className="font-semibold">
                        ${mockProperty.rentalDeposit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default PropertyDetail;
