import React, { useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import ListingCard from "../../components/layout/layoutUser/ListingCard.jsx";
import { Edit, Trash2, DollarSign, X } from "lucide-react";

const MyProperties = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [postStatus, setPostStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("MyPropertys");

  // Sample data based on PropertyResponse
  const properties = [
    {
      propertyId: "1",
      title: "Casa Lomas de Machali Machas",
      description:
        "Beautiful modern apartment with stunning city views. Fully furnished with high-end appliances and amenities.",
      monthlyRent: 4498,
      postingDate: "March 22, 2024",
      propertyStatus: "PENDING",
      mediaList: [
        {
          url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
          type: "IMAGE",
        },
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
          type: "IMAGE",
        },
      ],
      address: {
        fullAddress: "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
        province: "Ho Chi Minh City",
        district: "District 1",
        ward: "Ben Nghe Ward",
      },
      size: 85.5,
      bedrooms: 2,
      bathrooms: 2,
      yearBuilt: 2020,
      amenities: {
        homeSafety: ["Smoke Detector", "Fire Extinguisher", "Security Camera"],
        bedroom: ["King Bed", "Wardrobe", "Air Conditioning"],
        kitchen: ["Refrigerator", "Microwave", "Gas Stove"],
        others: ["WiFi", "Swimming Pool", "Gym"],
      },
      owner: {
        name: "John Doe",
        phone: "+84 123 456 789",
        email: "john.doe@example.com",
      },
    },
    {
      propertyId: "2",
      title: "Casa Lomas de Machali Machas",
      description: "Spacious villa with private garden and pool.",
      monthlyRent: 5007,
      postingDate: "March 22, 2024",
      propertyStatus: "APPROVED",
      mediaList: [
        {
          url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
          type: "IMAGE",
        },
      ],
      address: {
        fullAddress: "45 Tran Hung Dao Street, District 2, Ho Chi Minh City",
        province: "Ho Chi Minh City",
        district: "District 2",
      },
      size: 250,
      bedrooms: 4,
      bathrooms: 3,
      yearBuilt: 2019,
      amenities: {
        homeSafety: ["Security System", "CCTV"],
        bedroom: ["King Bed", "Wardrobe"],
        kitchen: ["Refrigerator", "Oven"],
        others: ["WiFi", "Private Pool"],
      },
      owner: {
        name: "Jane Smith",
        phone: "+84 987 654 321",
        email: "jane.smith@example.com",
      },
    },
    {
      propertyId: "3",
      title: "Casa Lomas de Machali Machas",
      description: "Modern house with pool and beautiful interior design.",
      monthlyRent: 5329,
      postingDate: "March 22, 2024",
      propertyStatus: "SOLD",
      mediaList: [
        {
          url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
          type: "IMAGE",
        },
      ],
      address: {
        fullAddress: "789 Le Loi Boulevard, District 3, Ho Chi Minh City",
        province: "Ho Chi Minh City",
        district: "District 3",
      },
      size: 180,
      bedrooms: 3,
      bathrooms: 3,
      yearBuilt: 2023,
      amenities: {
        homeSafety: ["Smart Lock", "Fire System"],
        bedroom: ["King Beds", "Walk-in Closet"],
        kitchen: ["Smart Fridge", "Wine Cooler"],
        others: ["WiFi", "Rooftop Pool"],
      },
      owner: {
        name: "Mike Johnson",
        phone: "+84 912 345 678",
        email: "mike@example.com",
      },
    },
    {
      propertyId: "4",
      title: "Casa Lomas de Machali Machas",
      description: "Cozy evening house with warm lighting.",
      monthlyRent: 3882,
      postingDate: "March 22, 2024",
      propertyStatus: "PENDING",
      mediaList: [
        {
          url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400",
          type: "IMAGE",
        },
      ],
      address: {
        fullAddress: "321 Vo Van Tan Street, District 5, Ho Chi Minh City",
        province: "Ho Chi Minh City",
        district: "District 5",
      },
      size: 120,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2021,
      amenities: {
        homeSafety: ["Security Camera"],
        bedroom: ["Queen Bed", "AC"],
        kitchen: ["Basic Appliances"],
        others: ["WiFi", "Garden"],
      },
      owner: {
        name: "Sarah Lee",
        phone: "+84 901 234 567",
        email: "sarah@example.com",
      },
    },
    {
      propertyId: "5",
      title: "Casa Lomas de Machali Machas",
      description: "Luxury bedroom with modern design.",
      monthlyRent: 2895,
      postingDate: "March 22, 2024",
      propertyStatus: "SOLD",
      mediaList: [
        {
          url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400",
          type: "IMAGE",
        },
      ],
      address: {
        fullAddress: "555 Hai Ba Trung Street, District 7, Ho Chi Minh City",
        province: "Ho Chi Minh City",
        district: "District 7",
      },
      size: 95,
      bedrooms: 2,
      bathrooms: 2,
      yearBuilt: 2022,
      amenities: {
        homeSafety: ["Smoke Detector"],
        bedroom: ["King Bed", "Smart TV"],
        kitchen: ["Full Kitchen"],
        others: ["WiFi", "Gym Access"],
      },
      owner: {
        name: "Tom Wilson",
        phone: "+84 908 765 432",
        email: "tom@example.com",
      },
    },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { bg: "bg-orange-500", text: "Pending" },
      APPROVED: { bg: "bg-green-500", text: "Approved" },
      SOLD: { bg: "bg-purple-500", text: "Sold" },
    };
    return configs[status] || configs.PENDING;
  };

  const PropertyDetailModal = ({ property, onClose }) => {
    if (!property) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {property.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Images Gallery */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {property.mediaList.map((media, index) => (
                <img
                  key={index}
                  src={media.url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>

            {/* Price and Status */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  ${property.monthlyRent.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">
                  Posted: {property.postingDate}
                </div>
              </div>
              <div>
                {(() => {
                  const statusConfig = getStatusConfig(property.propertyStatus);
                  return (
                    <span
                      className={`px-4 py-2 rounded-full text-white text-sm font-medium ${statusConfig.bg}`}
                    >
                      {statusConfig.text}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Property Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{property.size} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-medium">{property.yearBuilt}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium mt-1">
                      {property.address.fullAddress}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Province:</span>
                    <span className="font-medium">
                      {property.address.province}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">District:</span>
                    <span className="font-medium">
                      {property.address.district}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.homeSafety.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Home Safety
                    </h4>
                    <ul className="space-y-1">
                      {property.amenities.homeSafety.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {property.amenities.bedroom.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Bedroom
                    </h4>
                    <ul className="space-y-1">
                      {property.amenities.bedroom.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {property.amenities.kitchen.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Kitchen
                    </h4>
                    <ul className="space-y-1">
                      {property.amenities.kitchen.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {property.amenities.others.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Others
                    </h4>
                    <ul className="space-y-1">
                      {property.amenities.others.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Owner Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium mt-1">{property.owner.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium mt-1">{property.owner.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium mt-1">{property.owner.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-8 w-full">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Filter Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={postStatus}
                  onChange={(e) => setPostStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Search by title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Properties Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 p-6 border-b">
                My Properties
              </h2>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800 text-white font-medium text-sm">
                <div className="col-span-6">Listing</div>
                <div className="col-span-3 text-center">Status</div>
                <div className="col-span-3 text-center">Action</div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {properties.map((property) => {
                  const statusConfig = getStatusConfig(property.propertyStatus);
                  return (
                    <div
                      key={property.propertyId}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                    >
                      {/* Listing Column */}
                      <div className="col-span-6 flex items-center gap-4">
                        <img
                          src={property.mediaList[0]?.url}
                          alt={property.title}
                          className="w-28 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                          onClick={() => setSelectedProperty(property)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                            onClick={() => setSelectedProperty(property)}
                          >
                            {property.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Posting date: {property.postingDate}
                          </p>
                          <p className="text-lg font-semibold text-blue-600">
                            ${property.monthlyRent.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Column */}
                      <div className="col-span-3 flex justify-center">
                        <span
                          className={`px-6 py-1.5 rounded-full text-white text-sm font-medium ${statusConfig.bg}`}
                        >
                          {statusConfig.text}
                        </span>
                      </div>

                      {/* Action Column */}
                      <div className="col-span-3 flex flex-col items-center gap-1 text-sm">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                          <DollarSign className="w-4 h-4" />
                          Sold
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 px-6 py-6 border-t">
                <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  ‹
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  2
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  3
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  4
                </button>
                <span className="px-3 py-2 text-gray-600">...</span>
                <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  ›
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};

export default MyProperties;
