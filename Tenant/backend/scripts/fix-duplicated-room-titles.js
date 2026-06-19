const pool = require('../config/database');

const APPLY = process.argv.includes('--apply');

const normalizeSegment = (value) => (value || '').trim().toLowerCase();

const dedupeTrailingHyphenSegments = (value) => {
  if (!value || typeof value !== 'string') return value;

  const segments = value
    .split(' - ')
    .map((segment) => segment.trim())
    .filter(Boolean);

  while (
    segments.length >= 2 &&
    normalizeSegment(segments[segments.length - 1]) === normalizeSegment(segments[segments.length - 2])
  ) {
    segments.pop();
  }

  return segments.join(' - ');
};

async function collectRoomTitleFixes(connection) {
  const [rooms] = await connection.query(`
    SELECT RoomID, RoomCode, Title
    FROM ROOM
    WHERE Title IS NOT NULL AND TRIM(Title) <> ''
  `);

  return rooms
    .map((room) => {
      const fixedTitle = dedupeTrailingHyphenSegments(room.Title);
      return fixedTitle !== room.Title
        ? { id: room.RoomID, code: room.RoomCode, before: room.Title, after: fixedTitle }
        : null;
    })
    .filter(Boolean);
}

async function collectListingTitleFixes(connection) {
  const [listings] = await connection.query(`
    SELECT ListingID, RoomID, Title
    FROM LISTING
    WHERE Title IS NOT NULL AND TRIM(Title) <> ''
  `);

  return listings
    .map((listing) => {
      const fixedTitle = dedupeTrailingHyphenSegments(listing.Title);
      return fixedTitle !== listing.Title
        ? { id: listing.ListingID, roomId: listing.RoomID, before: listing.Title, after: fixedTitle }
        : null;
    })
    .filter(Boolean);
}

async function applyRoomTitleFixes(connection, fixes) {
  for (const fix of fixes) {
    await connection.query(
      'UPDATE ROOM SET Title = ?, UpdatedAt = NOW() WHERE RoomID = ?',
      [fix.after, fix.id]
    );
  }
}

async function applyListingTitleFixes(connection, fixes) {
  for (const fix of fixes) {
    await connection.query(
      'UPDATE LISTING SET Title = ?, UpdatedAt = NOW() WHERE ListingID = ?',
      [fix.after, fix.id]
    );
  }
}

async function main() {
  const connection = await pool.getConnection();

  try {
    const roomFixes = await collectRoomTitleFixes(connection);
    const listingFixes = await collectListingTitleFixes(connection);

    console.log(`ROOM titles cần sửa: ${roomFixes.length}`);
    roomFixes.slice(0, 20).forEach((fix) => {
      console.log(`- [ROOM] ${fix.code || fix.id}`);
      console.log(`  before: ${fix.before}`);
      console.log(`  after : ${fix.after}`);
    });

    console.log(`LISTING titles cần sửa: ${listingFixes.length}`);
    listingFixes.slice(0, 20).forEach((fix) => {
      console.log(`- [LISTING] ${fix.id} / room ${fix.roomId}`);
      console.log(`  before: ${fix.before}`);
      console.log(`  after : ${fix.after}`);
    });

    if (!APPLY) {
      console.log('\nChưa cập nhật DB. Chạy lại với --apply để áp dụng thay đổi.');
      process.exit(0);
    }

    await connection.beginTransaction();
    await applyRoomTitleFixes(connection, roomFixes);
    await applyListingTitleFixes(connection, listingFixes);
    await connection.commit();

    console.log('\nĐã cập nhật dữ liệu thành công.');
    console.log(`- ROOM updated: ${roomFixes.length}`);
    console.log(`- LISTING updated: ${listingFixes.length}`);
    process.exit(0);
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      // Ignore rollback failure and report original error.
    }
    console.error('Lỗi khi sửa title bị lặp:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

main();
