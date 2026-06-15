# KLTN - ERD tách theo module

Copy từng block `.eraser` vào Eraser.io để vẽ từng sơ đồ riêng.

## 01_core_rental.eraser

```text
// ERD 01 - Core Rental / Account / Contract
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Account {
  AccountID string pk
  Username string
  Password string
  GoogleID string
  Role string
  Status string
  AvatarURL string
  AvatarPublicID string
  CreatedAt datetime
  UpdatedAt datetime
}

Landlord {
  LandlordID string pk
  AccountID string fk
  Name string
  Username string
  Phone string
  Email string
  Address string
  City string
  District string
  Ward string
  AvatarURL string
  AvatarPublicID string
  CreatedAt datetime
  UpdatedAt datetime
}

Tenant {
  TenantID string pk
  AccountID string fk
  Name string
  Username string
  Gender string
  Birthday datetime
  AvatarURL string
  AvatarPublicID string
  Bio string
  University string
  Job string
  Phone string
  Email string
  BudgetMin decimal
  BudgetMax decimal
  PreferredDistrict string
  Latitude float
  Longitude float
  IsVerified boolean
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

Location {
  LocationID string pk
  City string
  District string
  Ward string
  Street string
  Address string
  Latitude decimal
  Longitude decimal
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

Building {
  BuildingID string pk
  LandlordID string fk
  LocationID string fk
  BuildingName string
  Address string
  District string
  Ward string
  Floors int
  NumberRooms int
  CreatedAt datetime
  UpdatedAt datetime
}

Room {
  RoomID string pk
  LandlordID string fk
  BuildingID string fk
  LocationID string fk
  RoomCode string
  RoomType string
  Area decimal
  MaxPeople int
  Amenities string
  Status string
  DraftStatus string
  Price int
  Title string
  Description string
  Tags string
  Furniture string
  Service string
  Rules string
  FloorType string
  CreatedAt datetime
  UpdatedAt datetime
}

Contract {
  ContractID string pk
  TenantID string fk
  RoomID string fk
  StartDate datetime
  EndDate datetime
  Status string
  TotalPrice decimal
  Deposit decimal
  CreatedAt datetime
  UpdatedAt datetime
}

Payment {
  PaymentID string pk
  ContractID string fk
  PaymentDate datetime
  Amount decimal
  Method string
  Status string
}

// Relationships
Account.AccountID < Landlord.AccountID
Account.AccountID < Tenant.AccountID
Landlord.LandlordID < Building.LandlordID
Location.LocationID < Building.LocationID
Landlord.LandlordID < Room.LandlordID
Building.BuildingID < Room.BuildingID
Location.LocationID < Room.LocationID
Tenant.TenantID < Contract.TenantID
Room.RoomID < Contract.RoomID
Contract.ContractID < Payment.ContractID
```

## 02_listing_booking.eraser

```text
// ERD 02 - Listing / Booking / Favorite / Review
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Tenant {
  TenantID string pk
  AccountID string fk
  Name string
  Username string
  Gender string
  Birthday datetime
  AvatarURL string
  AvatarPublicID string
  Bio string
  University string
  Job string
  Phone string
  Email string
  BudgetMin decimal
  BudgetMax decimal
  PreferredDistrict string
  Latitude float
  Longitude float
  IsVerified boolean
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

Landlord {
  LandlordID string pk
  AccountID string fk
  Name string
  Username string
  Phone string
  Email string
  Address string
  City string
  District string
  Ward string
  AvatarURL string
  AvatarPublicID string
  CreatedAt datetime
  UpdatedAt datetime
}

Room {
  RoomID string pk
  LandlordID string fk
  BuildingID string fk
  LocationID string fk
  RoomCode string
  RoomType string
  Area decimal
  MaxPeople int
  Amenities string
  Status string
  DraftStatus string
  Price int
  Title string
  Description string
  Tags string
  Furniture string
  Service string
  Rules string
  FloorType string
  CreatedAt datetime
  UpdatedAt datetime
}

Listing {
  ListingID string pk
  RoomID string fk
  LandlordID string fk
  Title string
  Description string
  IsVisible boolean
  CreatedAt datetime
  UpdatedAt datetime
}

ListingImage {
  ImageID int pk
  ListingID string fk
  ImageURL string
  ImageOrder int
  CreatedAt datetime
}

ViewingSchedule {
  ScheduleID string pk
  TenantID string fk
  RoomID string fk
  DateTime datetime
  Status string
  CreatedAt datetime
  UpdatedAt datetime
}

Favorite {
  FavoriteID string pk
  TenantID string fk
  RoomID string fk
  ListingID string fk
  Rating decimal
  Note string
  CreatedAt datetime
  UpdatedAt datetime
}

Review {
  ReviewID string pk
  RoomID string fk
  TenantID string fk
  Rating int
  Content string
  ReviewDate datetime
}

Document {
  DocumentID string pk
  RoomID string fk
  TenantID string fk
  Type string
  Title string
  FileURL string
  PublicID string
  FileType string
  ResourceType string
  FileSize int
  UploadedBy string fk
  IsPrivate boolean
  IsAllRooms boolean
  CreatedAt datetime
  UpdatedAt datetime
}

Notification {
  NotificationID string pk
  TargetID string
  Content string
  Type string
  Link string
  CreatedAt datetime
  Status string
}

// Relationships
Room.RoomID < Listing.RoomID
Landlord.LandlordID < Listing.LandlordID
Listing.ListingID < ListingImage.ListingID
Tenant.TenantID < ViewingSchedule.TenantID
Room.RoomID < ViewingSchedule.RoomID
Tenant.TenantID < Favorite.TenantID
Room.RoomID < Favorite.RoomID
Listing.ListingID < Favorite.ListingID
Tenant.TenantID < Review.TenantID
Room.RoomID < Review.RoomID
Room.RoomID < Document.RoomID
Tenant.TenantID < Document.TenantID
```

## 03_room_features.eraser

```text
// ERD 03 - Room Detail / Features / Images
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Room {
  RoomID string pk
  LandlordID string fk
  BuildingID string fk
  LocationID string fk
  RoomCode string
  RoomType string
  Area decimal
  MaxPeople int
  Amenities string
  Status string
  DraftStatus string
  Price int
  Title string
  Description string
  Tags string
  Furniture string
  Service string
  Rules string
  FloorType string
  CreatedAt datetime
  UpdatedAt datetime
}

Amenity {
  AmenityID string pk
  Name string
  Description string
  Icon string
  CreatedAt datetime
}

RoomAmenity {
  RoomID string fk
  AmenityID string fk
}

Service {
  ServiceID string pk
  Name string
  Description string
  Icon string
  CreatedAt datetime
}

RoomService {
  RoomID string fk
  ServiceID string fk
}

Furniture {
  FurnitureID string pk
  Name string
  Description string
  Icon string
  CreatedAt datetime
}

RoomFurniture {
  RoomID string fk
  FurnitureID string fk
}

Rule {
  RuleID string pk
  Name string
  Description string
  Icon string
  CreatedAt datetime
}

RoomRule {
  RoomID string fk
  RuleID string fk
}

RoomImage {
  ImageID int pk
  RoomID string fk
  ImageURL string
  PublicID string
  DisplayOrder int
  IsPrimary boolean
  CreatedAt datetime
}

// Relationships
Room.RoomID < RoomAmenity.RoomID
Amenity.AmenityID < RoomAmenity.AmenityID
Room.RoomID < RoomService.RoomID
Service.ServiceID < RoomService.ServiceID
Room.RoomID < RoomFurniture.RoomID
Furniture.FurnitureID < RoomFurniture.FurnitureID
Room.RoomID < RoomRule.RoomID
Rule.RuleID < RoomRule.RuleID
Room.RoomID < RoomImage.RoomID
```

## 04_poi_section.eraser

```text
// ERD 04 - POI / Location-based Filtering / Section
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Room {
  RoomID string pk
  LandlordID string fk
  BuildingID string fk
  LocationID string fk
  RoomCode string
  RoomType string
  Area decimal
  MaxPeople int
  Amenities string
  Status string
  DraftStatus string
  Price int
  Title string
  Description string
  Tags string
  Furniture string
  Service string
  Rules string
  FloorType string
  CreatedAt datetime
  UpdatedAt datetime
}

PoiType {
  TypeCode string pk
  Name string
  Description string
  Icon string
  CreatedAt datetime
}

Poi {
  POIID string pk
  Name string
  TypeCode string fk
  Latitude float
  Longitude float
  District string
  Address string
  IsActive boolean
  CreatedAt datetime
}

RoomPoi {
  RoomID string fk
  POIID string fk
  Distance float
  CreatedAt datetime
}

Section {
  SectionID string pk
  Name string
  Slug string
  Type string
  MaxDistance float
}

// Relationships
PoiType.TypeCode < Poi.TypeCode
Room.RoomID < RoomPoi.RoomID
Poi.POIID < RoomPoi.POIID
```

## 05_matching_profile.eraser

```text
// ERD 05 - Tenant Profile / Lifestyle / Matching
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Tenant {
  TenantID string pk
  AccountID string fk
  Name string
  Username string
  Gender string
  Birthday datetime
  AvatarURL string
  AvatarPublicID string
  Bio string
  University string
  Job string
  Phone string
  Email string
  BudgetMin decimal
  BudgetMax decimal
  PreferredDistrict string
  Latitude float
  Longitude float
  IsVerified boolean
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

Room {
  RoomID string pk
  LandlordID string fk
  BuildingID string fk
  LocationID string fk
  RoomCode string
  RoomType string
  Area decimal
  MaxPeople int
  Amenities string
  Status string
  DraftStatus string
  Price int
  Title string
  Description string
  Tags string
  Furniture string
  Service string
  Rules string
  FloorType string
  CreatedAt datetime
  UpdatedAt datetime
}

TenantPreference {
  TenantID string pk fk
  BudgetMin int
  BudgetMax int
  PreferredDistrict string
  PreferredAmenities string
  PreferredRoomType string
  MoveInDate datetime
  PreferredGender string
}

LifestyleMaster {
  LifestyleID string pk
  Name string
  Category string
  Icon string
  CreatedAt datetime
}

TenantLifestyle {
  TenantID string fk
  LifestyleID string fk
  ValueLevel int
}

InterestMaster {
  InterestID string pk
  Name string
  Icon string
  CreatedAt datetime
}

TenantInterest {
  TenantID string fk
  InterestID string fk
}

MatchScore {
  TenantID1 string fk
  TenantID2 string fk
  Score float
  CompatibilityLevel string
  Reason string
  UpdatedAt datetime
}

MatchAction {
  ActionID string pk
  FromTenantID string fk
  ToTenantID string fk
  ActionType string
  CreatedAt datetime
}

MatchRoom {
  MatchRoomID string pk
  TenantID string fk
  RoomID string fk
  MatchScore float
  CreatedAt datetime
}

MatchChatRoom {
  ChatRoomID string pk
  TenantID1 string fk
  TenantID2 string fk
  CreatedAt datetime
}

AiMatching {
  MatchingID string pk
  TenantID string fk
  RoomID string fk
  Score decimal
  Reason string
  CreatedAt datetime
}

// Relationships
Tenant.TenantID < TenantPreference.TenantID
Tenant.TenantID < TenantLifestyle.TenantID
LifestyleMaster.LifestyleID < TenantLifestyle.LifestyleID
Tenant.TenantID < TenantInterest.TenantID
InterestMaster.InterestID < TenantInterest.InterestID
Tenant.TenantID < MatchScore.TenantID1
Tenant.TenantID < MatchScore.TenantID2
Tenant.TenantID < MatchAction.FromTenantID
Tenant.TenantID < MatchAction.ToTenantID
Tenant.TenantID < MatchRoom.TenantID
Room.RoomID < MatchRoom.RoomID
Tenant.TenantID < MatchChatRoom.TenantID1
Tenant.TenantID < MatchChatRoom.TenantID2
Tenant.TenantID < AiMatching.TenantID
Room.RoomID < AiMatching.RoomID
```

## 06_moving_service.eraser

```text
// ERD 06 - Moving Service Marketplace
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Account {
  AccountID string pk
  Username string
  Password string
  GoogleID string
  Role string
  Status string
  AvatarURL string
  AvatarPublicID string
  CreatedAt datetime
  UpdatedAt datetime
}

Tenant {
  TenantID string pk
  AccountID string fk
  Name string
  Username string
  Gender string
  Birthday datetime
  AvatarURL string
  AvatarPublicID string
  Bio string
  University string
  Job string
  Phone string
  Email string
  BudgetMin decimal
  BudgetMax decimal
  PreferredDistrict string
  Latitude float
  Longitude float
  IsVerified boolean
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

MovingProvider {
  ProviderID string pk
  AccountID string fk
  Name string
  Phone string
  Email string
  Address string
  Rating decimal
  TotalReviews int
  VerifiedStatus string
  VerifiedAt datetime
  VerifiedBy string
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

ServiceCategory {
  CategoryID string pk
  Name string
  Description string
  Icon string
  Thumbnail string
  SortOrder int
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

MovingService {
  ServiceID string pk
  ProviderID string fk
  CategoryID string fk
  Name string
  Description string
  Thumbnail string
  BasePrice decimal
  PricePerKm decimal
  FreeDistanceKm float
  MaxDistanceKm float
  ExtraFloorPrice decimal
  OvertimePrice decimal
  VehicleType string
  EstimatedDuration int
  MaxItems int
  Features string
  IsPopular boolean
  IsActive boolean
  SortOrder int
  CreatedAt datetime
  UpdatedAt datetime
}

MovingBooking {
  BookingID string pk
  TenantID string fk
  ServiceID string fk
  PickupAddress string
  DestinationAddress string
  PickupLatitude float
  PickupLongitude float
  DestinationLatitude float
  DestinationLongitude float
  DistanceKm float
  MovingDate datetime
  MovingTime datetime
  FloorFrom int
  FloorTo int
  HasElevator boolean
  Note string
  BasePriceSnapshot decimal
  DistancePriceSnapshot decimal
  ExtraFeeSnapshot decimal
  FinalPrice decimal
  Status string
  ActualStartTime datetime
  ActualEndTime datetime
  StaffNote string
  CreatedAt datetime
  UpdatedAt datetime
}

MovingReview {
  ReviewID string pk
  BookingID string fk
  TenantID string fk
  Rating int
  Comment string
  CreatedAt datetime
}

// Relationships
Account.AccountID < MovingProvider.AccountID
MovingProvider.ProviderID < MovingService.ProviderID
ServiceCategory.CategoryID < MovingService.CategoryID
Tenant.TenantID < MovingBooking.TenantID
MovingService.ServiceID < MovingBooking.ServiceID
MovingBooking.BookingID < MovingReview.BookingID
Tenant.TenantID < MovingReview.TenantID
```

## 07_ai_chat.eraser

```text
// ERD 07 - AI Chat Assistant / Room Interaction
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Tenant {
  TenantID string pk
  AccountID string fk
  Name string
  Username string
  Gender string
  Birthday datetime
  AvatarURL string
  AvatarPublicID string
  Bio string
  University string
  Job string
  Phone string
  Email string
  BudgetMin decimal
  BudgetMax decimal
  PreferredDistrict string
  Latitude float
  Longitude float
  IsVerified boolean
  IsActive boolean
  CreatedAt datetime
  UpdatedAt datetime
}

Room {
  RoomID string pk
  LandlordID string fk
  BuildingID string fk
  LocationID string fk
  RoomCode string
  RoomType string
  Area decimal
  MaxPeople int
  Amenities string
  Status string
  DraftStatus string
  Price int
  Title string
  Description string
  Tags string
  Furniture string
  Service string
  Rules string
  FloorType string
  CreatedAt datetime
  UpdatedAt datetime
}

AiChatSession {
  SessionID string pk
  TenantID string fk
  StartedAt datetime
  LastMessageAt datetime
  Status string
  MessageCount int
  SessionContext string
}

AiChatMessage {
  MessageID string pk
  SessionID string fk
  Sender string
  Message string
  Intent string
  Entities json
  SuggestedRooms json
  CreatedAt datetime
}

AiChatFeedback {
  FeedbackID string pk
  SessionID string fk
  TenantID string fk
  Rating int
  Comment string
  CreatedAt datetime
}

AiChatRoomInteraction {
  InteractionID string pk
  SessionID string fk
  TenantID string fk
  RoomID string fk
  ActionType string
  Context string
  CreatedAt datetime
}

// Relationships
Tenant.TenantID < AiChatSession.TenantID
AiChatSession.SessionID < AiChatMessage.SessionID
AiChatSession.SessionID < AiChatFeedback.SessionID
Tenant.TenantID < AiChatFeedback.TenantID
AiChatSession.SessionID < AiChatRoomInteraction.SessionID
Tenant.TenantID < AiChatRoomInteraction.TenantID
Room.RoomID < AiChatRoomInteraction.RoomID
```

## 08_upload_excel.eraser

```text
// ERD 08 - Bulk Upload / Excel Import
// Paste this into Eraser.io as a Database Diagram / Diagram-as-code file.

Landlord {
  LandlordID string pk
  AccountID string fk
  Name string
  Username string
  Phone string
  Email string
  Address string
  City string
  District string
  Ward string
  AvatarURL string
  AvatarPublicID string
  CreatedAt datetime
  UpdatedAt datetime
}

Building {
  BuildingID string pk
  LandlordID string fk
  LocationID string fk
  BuildingName string
  Address string
  District string
  Ward string
  Floors int
  NumberRooms int
  CreatedAt datetime
  UpdatedAt datetime
}

Room {
  RoomID string pk
  LandlordID string fk
  BuildingID string fk
  LocationID string fk
  RoomCode string
  RoomType string
  Area decimal
  MaxPeople int
  Amenities string
  Status string
  DraftStatus string
  Price int
  Title string
  Description string
  Tags string
  Furniture string
  Service string
  Rules string
  FloorType string
  CreatedAt datetime
  UpdatedAt datetime
}

Listing {
  ListingID string pk
  RoomID string fk
  LandlordID string fk
  Title string
  Description string
  IsVisible boolean
  CreatedAt datetime
  UpdatedAt datetime
}

UploadJob {
  UploadJobID string pk
  LandlordID string fk
  Mode string
  BuildingID string fk
  FileName string
  TotalRows int
  SuccessRows int
  FailedRows int
  Status string
  CreatedAt datetime
  CompletedAt datetime
}

UploadDetail {
  UploadDetailID string pk
  UploadJobID string fk
  RowNumber int
  BuildingName string
  BuildingID string fk
  RoomCode string
  Title string
  Price decimal
  Area float
  MaxPeople int
  Address string
  RoomType string
  Description string
  Furniture string
  Amenities string
  Service string
  Rules string
  FloorType string
  Status string
  ErrorMessage string
  RoomID string fk
  ListingID string fk
  CreatedAt datetime
  UpdatedAt datetime
}

// Relationships
Landlord.LandlordID < UploadJob.LandlordID
Building.BuildingID < UploadJob.BuildingID
UploadJob.UploadJobID < UploadDetail.UploadJobID
Building.BuildingID < UploadDetail.BuildingID
Room.RoomID < UploadDetail.RoomID
Listing.ListingID < UploadDetail.ListingID
```
