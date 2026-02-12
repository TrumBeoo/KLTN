// ============================================
// PERMISSION MIDDLEWARE
// ============================================

const ROLES = {
  TENANT: 'Tenant',
  LANDLORD: 'Landlord'
};

const PAGE_PERMISSIONS = {
  'roommate-matching.html': [ROLES.TENANT],
  'my-schedules.html': [ROLES.TENANT],
  'favorites.html': [ROLES.TENANT],
  'post-listing.html': [ROLES.LANDLORD],
  'manage-rooms.html': [ROLES.LANDLORD],
  'manage-bookings.html': [ROLES.LANDLORD]
};

function checkPermission() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return;
  }
  
  // Nếu là Landlord, chuyển hướng về Landlord dashboard
  if (user.role === ROLES.LANDLORD) {
    window.location.href = '../../../Landlord/frontend/html/landlord-dashboard.html';
    return;
  }
  
  const currentPage = window.location.pathname.split('/').pop();
  const allowedRoles = PAGE_PERMISSIONS[currentPage];
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = 'index.html';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkPermission);
} else {
  checkPermission();
}
