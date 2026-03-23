// Sample data for MongoDB services.
// This script runs automatically when the MongoDB container starts for the first time.

db = db.getSiblingDB("roomie");

const now = new Date();

function upsert(collectionName, doc) {
	db.getCollection(collectionName).updateOne(
		{ _id: doc._id },
		{ $set: doc },
		{ upsert: true }
	);
}

// property-service: properties
upsert("properties", {
	_id: "property-001",
	propertyId: "property-001",
	title: "Studio gan Dai hoc Bach Khoa",
	description: "Studio day du noi that, cach truong 7 phut di xe.",
	address: {
		fullAddress: "268 Ly Thuong Kiet, Ward 14, District 10, HCMC",
		province: "Ho Chi Minh",
		district: "District 10",
		ward: "Ward 14",
		street: "Ly Thuong Kiet",
		houseNumber: "268",
		location: "10.7733,106.6602"
	},
	monthlyRent: NumberDecimal("8500000"),
	rentalDeposit: NumberDecimal("8500000"),
	propertyType: "STUDIO",
	propertyStatus: "AVAILABLE",
	propertyLabel: "HOT",
	size: 32.5,
	rooms: 1,
	bedrooms: 1,
	bathrooms: 1,
	garages: 1,
	amenities: {
		homeSafety: ["Smoke alarm", "CCTV"],
		bedroom: ["Air conditioner", "Wardrobe", "Work desk"],
		kitchen: ["Refrigerator", "Microwave", "Sink"],
		others: ["WiFi", "Washing machine"]
	},
	mediaList: [
		{
			url: "https://images.roomie.local/property-001/front.jpg",
			type: "image"
		}
	],
	owner: {
		ownerId: "landlord-uuid-1",
		name: "Anna Nguyen",
		phoneNumber: "+840900000003",
		email: "anna.landlord@roomie.com"
	},
	status: "ACTIVE",
	createdAt: now,
	updatedAt: now
});

// property-service: favorites
upsert("favorites", {
	_id: "favorite-001",
	userId: "user-uuid-1",
	propertyId: "property-001",
	createdAt: now
});

// booking-service
upsert("booking_long_term", {
	_id: "booking-001",
	propertyId: "property-001",
	landLordId: "landlord-uuid-1",
	tenantId: "user-uuid-1",
	leaseStart: ISODate("2026-04-01T00:00:00Z"),
	leaseEnd: ISODate("2027-03-31T23:59:59Z"),
	monthlyRent: NumberDecimal("8500000"),
	rentalDeposit: NumberDecimal("8500000"),
	status: "ACTIVE",
	bookingReference: "BK-ROOMIE-2026-0001",
	createdAt: now,
	updatedAt: now
});

// contract-service
upsert("contracts", {
	_id: "contract-001",
	bookingId: "booking-001",
	propertyId: "property-001",
	tenantId: "user-uuid-1",
	landlordId: "landlord-uuid-1",
	startDate: ISODate("2026-04-01T00:00:00Z"),
	endDate: ISODate("2027-03-31T23:59:59Z"),
	monthlyRent: NumberDecimal("8500000"),
	rentalDeposit: NumberDecimal("8500000"),
	status: "ACTIVE",
	tenantSigned: true,
	landlordSigned: true,
	pdfUrl: "https://files.roomie.local/contracts/contract-001.pdf",
	signatureToken: "sig-token-demo-001",
	createdAt: now,
	updatedAt: now,
	version: NumberLong("1")
});

upsert("otp_verifications", {
	_id: "otp-001",
	contractId: "contract-001",
	userId: "user-uuid-1",
	email: "john.doe@roomie.com",
	otpCode: "123456",
	purpose: "TENANT_SIGN",
	verified: true,
	expiresAt: ISODate("2026-12-31T23:59:59Z"),
	createdAt: now
});

// payment-service
upsert("payments", {
	_id: "payment-001",
	userId: "user-uuid-1",
	bookingId: "booking-001",
	contractId: "contract-001",
	billId: "bill-001",
	amount: NumberLong("8700000"),
	method: "VNPAY",
	status: "COMPLETED",
	transactionId: "VNPAY-DEMO-0001",
	description: "Thanh toan tien nha thang 04/2026",
	paymentUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
	paidAt: now,
	createdAt: now,
	updatedAt: now
});

// billing-service
upsert("utilities", {
	_id: "utility-001",
	propertyId: "property-001",
	contractId: "contract-001",
	landlordId: "landlord-uuid-1",
	electricityUnitPrice: 3500.0,
	electricityProvider: "EVN HCMC",
	electricityMeterNumber: "EVN-0001",
	waterUnitPrice: 18000.0,
	waterProvider: "Sawaco",
	waterMeterNumber: "WTR-0001",
	internetPrice: NumberDecimal("250000"),
	internetProvider: "VNPT",
	internetPackage: "Fiber 150Mbps",
	parkingPrice: NumberDecimal("150000"),
	parkingSlots: 1,
	cleaningPrice: NumberDecimal("100000"),
	cleaningFrequency: "MONTHLY",
	maintenancePrice: NumberDecimal("0"),
	maintenanceCoverage: "Basic",
	active: true,
	notes: "Default utility config for sample property",
	createdAt: now,
	updatedAt: now,
	createdBy: "landlord-uuid-1",
	updatedBy: "landlord-uuid-1"
});

upsert("bills", {
	_id: "bill-001",
	contractId: "contract-001",
	paymentId: "payment-001",
	landlordId: "landlord-uuid-1",
	tenantId: "user-uuid-1",
	propertyId: "property-001",
	monthlyRent: NumberDecimal("8500000"),
	rentalDeposit: NumberDecimal("0"),
	electricityOld: 1200.0,
	electricityNew: 1280.0,
	electricityConsumption: 80.0,
	electricityUnitPrice: 3500.0,
	electricityAmount: NumberDecimal("280000"),
	waterOld: 300.0,
	waterNew: 309.0,
	waterConsumption: 9.0,
	waterUnitPrice: 18000.0,
	waterAmount: NumberDecimal("162000"),
	internetPrice: NumberDecimal("250000"),
	parkingPrice: NumberDecimal("150000"),
	cleaningPrice: NumberDecimal("100000"),
	maintenancePrice: NumberDecimal("0"),
	otherDescription: "",
	otherPrice: NumberDecimal("0"),
	totalAmount: NumberDecimal("9442000"),
	billingMonth: ISODate("2026-04-01T00:00:00Z"),
	dueDate: ISODate("2026-04-10T00:00:00Z"),
	status: "PAID",
	notes: "Paid via VNPAY",
	paidAt: now,
	createdAt: now,
	updatedAt: now
});

upsert("meter_readings", {
	_id: "meter-001",
	propertyId: "property-001",
	contractId: "contract-001",
	billId: "bill-001",
	readingMonth: ISODate("2026-04-01T00:00:00Z"),
	readingDate: ISODate("2026-04-01T00:00:00Z"),
	electricityReading: 1280.0,
	electricityPhotoUrl: "https://images.roomie.local/meters/electricity-001.jpg",
	waterReading: 309.0,
	waterPhotoUrl: "https://images.roomie.local/meters/water-001.jpg",
	recordedBy: "landlord-uuid-1",
	notes: "Monthly reading",
	createdAt: now
});

// chat-service
upsert("conversation", {
	_id: "chat-conv-001",
	type: "DIRECT",
	participantsHash: "landlord-uuid-1_user-uuid-1",
	participants: [
		{
			userId: "landlord-uuid-1",
			username: "landlord_anna",
			firstName: "Anna",
			lastName: "Nguyen",
			avatar: "https://images.roomie.local/avatars/landlord-anna.jpg"
		},
		{
			userId: "user-uuid-1",
			username: "john_doe",
			firstName: "John",
			lastName: "Doe",
			avatar: "https://images.roomie.local/avatars/john-doe.jpg"
		}
	],
	createdDate: now,
	modifiedDate: now
});

upsert("chat_message", {
	_id: "chat-msg-001",
	conversationId: "chat-conv-001",
	message: "Chao ban, phong van san sang xem nha vao cuoi tuan.",
	sender: {
		userId: "landlord-uuid-1",
		username: "landlord_anna",
		firstName: "Anna",
		lastName: "Nguyen",
		avatar: "https://images.roomie.local/avatars/landlord-anna.jpg"
	},
	createdDate: now
});

upsert("websocket_session", {
	_id: "ws-001",
	socketSessionId: "session-demo-001",
	userId: "user-uuid-1",
	createdAt: now
});

// notification-service
upsert("notification_templates", {
	_id: "template-contract-active-vi",
	type: "CONTRACT_ACTIVATED",
	language: "vi",
	titleTemplate: "Hop dong da kich hoat",
	messageTemplate: "Hop dong {{contractId}} da co hieu luc tu {{startDate}}.",
	shortMessageTemplate: "Hop dong da kich hoat",
	emailSubjectTemplate: "[Roomie] Hop dong da kich hoat",
	emailBodyTemplate: "Hop dong {{contractId}} da duoc kich hoat thanh cong.",
	actionText: "Xem hop dong",
	actionUrlTemplate: "/contracts/{{contractId}}",
	isActive: true,
	createdAt: now,
	updatedAt: now
});

upsert("notifications", {
	_id: "notif-001",
	userId: "user-uuid-1",
	title: "Hop dong da kich hoat",
	message: "Hop dong contract-001 da co hieu luc. Ban co the vao muc Hop dong de xem chi tiet.",
	shortMessage: "Hop dong contract-001 da kich hoat",
	type: "CONTRACT_ACTIVATED",
	priority: "NORMAL",
	channel: "IN_APP",
	relatedEntityId: "contract-001",
	relatedEntityType: "CONTRACT",
	isRead: false,
	actionUrl: "/contracts/contract-001",
	actionText: "Xem hop dong",
	metadata: {
		contractId: "contract-001",
		propertyId: "property-001"
	},
	data: {
		screen: "contract_detail",
		contractId: "contract-001"
	},
	imageUrl: null,
	iconUrl: null,
	expiresAt: ISODate("2027-01-01T00:00:00Z"),
	createdAt: now,
	readAt: null,
	sentAt: now,
	emailSent: false,
	pushSent: false
});

// file-service
upsert("file_mgmt", {
	_id: "file-001",
	fileId: "property-001-main-image",
	ownerId: "landlord-uuid-1",
	fileName: "property-001-main.jpg",
	fileType: "IMAGE",
	entityType: "PROPERTY",
	entityId: "property-001",
	contentType: "image/jpeg",
	size: NumberLong("284332"),
	md5Checksum: "f1c9645dbc14efddc7d8a322685f26eb",
	path: "properties/property-001/property-001-main.jpg",
	publicUrl: "https://minio.roomie.local/properties/property-001/property-001-main.jpg",
	createdAt: now,
	updatedAt: now,
	deletedAt: null,
	deleted: false
});

// ai-service
upsert("conversations", {
	_id: "ai-conv-001",
	userId: "user-uuid-1",
	title: "Tim phong gan truong Bach Khoa",
	createdAt: now,
	updatedAt: now,
	messageCount: 2,
	totalTokens: 420,
	isActive: true
});

upsert("messages", {
	_id: "ai-msg-001",
	conversationId: "ai-conv-001",
	role: "user",
	content: "Goi y cho toi phong tro duoi 9 trieu gan Bach Khoa",
	createdAt: now,
	tokenCount: 24,
	model: "gpt-4o-mini"
});

upsert("messages", {
	_id: "ai-msg-002",
	conversationId: "ai-conv-001",
	role: "assistant",
	content: "Ban co the tham khao property-001 tai District 10 voi gia 8.5 trieu/thang.",
	createdAt: now,
	tokenCount: 32,
	model: "gpt-4o-mini"
});
