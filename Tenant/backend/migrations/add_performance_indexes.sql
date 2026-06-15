-- Migration: Add indexes for performance optimization
-- Run this SQL script to improve query performance

-- Index for ROOM table
CREATE INDEX idx_room_status ON ROOM(Status);
CREATE INDEX idx_room_landlord ON ROOM(LandlordID);
CREATE INDEX idx_room_location ON ROOM(LocationID);
CREATE INDEX idx_room_building ON ROOM(BuildingID);
CREATE INDEX idx_room_updated ON ROOM(UpdatedAt);
CREATE INDEX idx_room_created ON ROOM(CreatedAt);

-- Index for LOCATION table
CREATE INDEX idx_location_district ON LOCATION(District);
CREATE INDEX idx_location_coords ON LOCATION(Latitude, Longitude);

-- Index for ROOM_IMAGE table
CREATE INDEX idx_room_image_room ON ROOM_IMAGE(RoomID, DisplayOrder);

-- Index for VIEWING_SCHEDULE table
CREATE INDEX idx_viewing_schedule_room ON VIEWING_SCHEDULE(RoomID, Status);
CREATE INDEX idx_viewing_schedule_tenant ON VIEWING_SCHEDULE(TenantID, Status);
CREATE INDEX idx_viewing_schedule_created ON VIEWING_SCHEDULE(CreatedAt);

-- Index for TENANT table
CREATE INDEX idx_tenant_account ON TENANT(AccountID);

-- Index for ROOM_POI table
CREATE INDEX idx_room_poi_room ON ROOM_POI(RoomID);
CREATE INDEX idx_room_poi_poi ON ROOM_POI(POIID);

-- Index for ROOM_AMENITY table
CREATE INDEX idx_room_amenity_room ON ROOM_AMENITY(RoomID);

-- Index for LISTING table
CREATE INDEX idx_listing_room ON LISTING(RoomID);
CREATE INDEX idx_listing_visible ON LISTING(IsVisible);

-- Index for FAVORITE table
CREATE INDEX idx_favorite_tenant ON FAVORITE(TenantID);
CREATE INDEX idx_favorite_room ON FAVORITE(RoomID);
CREATE INDEX idx_favorite_tenant_room ON FAVORITE(TenantID, RoomID);

-- Optimize tables
OPTIMIZE TABLE ROOM;
OPTIMIZE TABLE LOCATION;
OPTIMIZE TABLE ROOM_IMAGE;
OPTIMIZE TABLE VIEWING_SCHEDULE;
OPTIMIZE TABLE TENANT;
OPTIMIZE TABLE ROOM_POI;
OPTIMIZE TABLE ROOM_AMENITY;
OPTIMIZE TABLE LISTING;
OPTIMIZE TABLE FAVORITE;
