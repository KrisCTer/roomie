// Sample data for MongoDB (profile-service, property-service, etc.)
// This script runs automatically when the MongoDB container starts for the first time.
// If you need to re-run it, you must delete the mongodb_data volume first: 
// docker-compose down -v

// Connect to the roomie database
db = db.getSiblingDB('roomie');

// Example: Insert default user profile
// db.profiles.insertMany([
//   {
//     _id: "user-1", // Should match identity-service
//     firstName: "Admin",
//     lastName: "Roomie",
//     avatarUrl: "https://example.com/avatar.jpg",
//     bio: "System Administrator",
//     createdAt: new Date(),
//     updatedAt: new Date()
//   }
// ]);

// Example: Insert sample property
// db.properties.insertMany([
//   {
//     _id: "prop-1",
//     title: "Cozy Studio in City Center",
//     description: "A beautiful studio apartment perfect for students.",
//     ownerId: "user-1",
//     price: 500,
//     currency: "USD",
//     status: "AVAILABLE",
//     createdAt: new Date(),
//     updatedAt: new Date()
//   }
// ]);
