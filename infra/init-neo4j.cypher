// Sample data for Neo4j (profile-service)
// Run manually with cypher-shell inside neo4j container.

MERGE (admin:user_profile {userId: 'admin-uuid-1'})
SET admin.id = coalesce(admin.id, 'profile-admin-001'),
    admin.avatar = 'https://images.roomie.local/avatars/admin.jpg',
    admin.username = 'admin',
    admin.email = 'admin@roomie.com',
    admin.phoneNumber = '+840900000001',
    admin.firstName = 'System',
    admin.lastName = 'Admin',
    admin.gender = 'PREFER_NOT_TO_SAY',
    admin.dob = date('1995-01-01'),
    admin.idCardNumber = '012345678901',
    admin.permanentAddress = 'District 1, Ho Chi Minh',
    admin.currentAddress = 'District 1, Ho Chi Minh',
    admin.status = 'ACTIVE',
    admin.createdAt = datetime(),
    admin.updatedAt = datetime()
WITH admin

MERGE (tenant:user_profile {userId: 'user-uuid-1'})
SET tenant.id = coalesce(tenant.id, 'profile-user-001'),
    tenant.avatar = 'https://images.roomie.local/avatars/john-doe.jpg',
    tenant.username = 'john_doe',
    tenant.email = 'john.doe@roomie.com',
    tenant.phoneNumber = '+840900000002',
    tenant.firstName = 'John',
    tenant.lastName = 'Doe',
    tenant.gender = 'MALE',
    tenant.dob = date('2001-06-14'),
    tenant.idCardNumber = '012345678902',
    tenant.permanentAddress = 'District 10, Ho Chi Minh',
    tenant.currentAddress = 'District 10, Ho Chi Minh',
    tenant.status = 'ACTIVE',
    tenant.createdAt = datetime(),
    tenant.updatedAt = datetime()
WITH admin, tenant

MERGE (landlord:user_profile {userId: 'landlord-uuid-1'})
SET landlord.id = coalesce(landlord.id, 'profile-landlord-001'),
    landlord.avatar = 'https://images.roomie.local/avatars/landlord-anna.jpg',
    landlord.username = 'landlord_anna',
    landlord.email = 'anna.landlord@roomie.com',
    landlord.phoneNumber = '+840900000003',
    landlord.firstName = 'Anna',
    landlord.lastName = 'Nguyen',
    landlord.gender = 'FEMALE',
    landlord.dob = date('1996-10-20'),
    landlord.idCardNumber = '012345678903',
    landlord.permanentAddress = 'District 3, Ho Chi Minh',
    landlord.currentAddress = 'District 3, Ho Chi Minh',
    landlord.status = 'ACTIVE',
    landlord.createdAt = datetime(),
    landlord.updatedAt = datetime()

RETURN admin.userId AS adminUser, tenant.userId AS tenantUser, landlord.userId AS landlordUser;
