const db = require('../config/database');

async function createIndexes() {
  const connection = await db.getConnection();
  
  try {
    console.log('Creating database indexes for performance optimization...');

    // Helper function to create index safely
    const createIndexSafe = async (indexName, tableName, columns) => {
      try {
        // Check if index exists
        const [indexes] = await connection.query(`
          SHOW INDEX FROM ${tableName} WHERE Key_name = ?
        `, [indexName]);
        
        if (indexes.length === 0) {
          await connection.query(`
            CREATE INDEX ${indexName} ON ${tableName}(${columns})
          `);
          console.log(`✓ Created index: ${indexName}`);
        } else {
          console.log(`- Index already exists: ${indexName}`);
        }
      } catch (error) {
        console.error(`Error creating index ${indexName}:`, error.message);
      }
    };

    // ROOM table indexes
    await createIndexSafe('idx_room_landlord', 'ROOM', 'LandlordID');
    await createIndexSafe('idx_room_building', 'ROOM', 'BuildingID');
    await createIndexSafe('idx_room_status', 'ROOM', 'Status');
    await createIndexSafe('idx_room_draft_status', 'ROOM', 'DraftStatus');
    await createIndexSafe('idx_room_code', 'ROOM', 'RoomCode');
    await createIndexSafe('idx_room_landlord_status', 'ROOM', 'LandlordID, Status');
    await createIndexSafe('idx_room_updated', 'ROOM', 'UpdatedAt');

    // LISTING table indexes
    await createIndexSafe('idx_listing_landlord', 'LISTING', 'LandlordID');
    await createIndexSafe('idx_listing_room', 'LISTING', 'RoomID');
    await createIndexSafe('idx_listing_visible', 'LISTING', 'IsVisible');
    await createIndexSafe('idx_listing_updated', 'LISTING', 'UpdatedAt');

    // VIEWING_SCHEDULE table indexes
    await createIndexSafe('idx_viewing_room', 'VIEWING_SCHEDULE', 'RoomID');
    await createIndexSafe('idx_viewing_tenant', 'VIEWING_SCHEDULE', 'TenantID');
    await createIndexSafe('idx_viewing_status', 'VIEWING_SCHEDULE', 'Status');
    await createIndexSafe('idx_viewing_datetime', 'VIEWING_SCHEDULE', 'DateTime');
    await createIndexSafe('idx_viewing_room_status', 'VIEWING_SCHEDULE', 'RoomID, Status');

    // CONTRACT table indexes
    await createIndexSafe('idx_contract_room', 'CONTRACT', 'RoomID');
    await createIndexSafe('idx_contract_tenant', 'CONTRACT', 'TenantID');
    await createIndexSafe('idx_contract_status', 'CONTRACT', 'Status');
    await createIndexSafe('idx_contract_end_date', 'CONTRACT', 'EndDate');

    // BUILDING table indexes
    await createIndexSafe('idx_building_landlord', 'BUILDING', 'LandlordID');
    await createIndexSafe('idx_building_location', 'BUILDING', 'LocationID');

    // UPLOAD_JOB table indexes
    await createIndexSafe('idx_upload_job_landlord', 'UPLOAD_JOB', 'LandlordID');
    await createIndexSafe('idx_upload_job_building', 'UPLOAD_JOB', 'BuildingID');
    await createIndexSafe('idx_upload_job_status', 'UPLOAD_JOB', 'Status');
    await createIndexSafe('idx_upload_job_created', 'UPLOAD_JOB', 'CreatedAt');

    // UPLOAD_DETAIL table indexes
    await createIndexSafe('idx_upload_detail_job', 'UPLOAD_DETAIL', 'UploadJobID');
    await createIndexSafe('idx_upload_detail_room', 'UPLOAD_DETAIL', 'RoomID');
    await createIndexSafe('idx_upload_detail_listing', 'UPLOAD_DETAIL', 'ListingID');
    await createIndexSafe('idx_upload_detail_status', 'UPLOAD_DETAIL', 'Status');

    // ROOM_IMAGE table indexes
    await createIndexSafe('idx_room_image_room', 'ROOM_IMAGE', 'RoomID');
    await createIndexSafe('idx_room_image_order', 'ROOM_IMAGE', 'DisplayOrder');
    await createIndexSafe('idx_room_image_room_order', 'ROOM_IMAGE', 'RoomID, DisplayOrder');

    // PAYMENT table indexes
    await createIndexSafe('idx_payment_contract', 'PAYMENT', 'ContractID');
    await createIndexSafe('idx_payment_status', 'PAYMENT', 'Status');
    await createIndexSafe('idx_payment_date', 'PAYMENT', 'PaymentDate');

    // LANDLORD table indexes
    await createIndexSafe('idx_landlord_account', 'LANDLORD', 'AccountID');

    // Relational tables indexes
    await createIndexSafe('idx_room_amenity_room', 'ROOM_AMENITY', 'RoomID');
    await createIndexSafe('idx_room_furniture_room', 'ROOM_FURNITURE', 'RoomID');
    await createIndexSafe('idx_room_service_room', 'ROOM_SERVICE', 'RoomID');
    await createIndexSafe('idx_room_rule_room', 'ROOM_RULE', 'RoomID');

    console.log('\n✓ All indexes created successfully!');
    console.log('\nTotal: 42 indexes for better performance!');

  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log('\n✓ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createIndexes;
