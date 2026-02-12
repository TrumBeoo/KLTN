// Permission middleware - Landlord
// Check if user is logged in before accessing landlord pages

function checkLogin() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!isLoggedIn || !user.role) {
    window.location.href = 'login.html';
    return;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkLogin);
} else {
  checkLogin();
}
