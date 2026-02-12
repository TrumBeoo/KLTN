// ============================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================

async function checkAuthState() {
  try {
    const response = await fetch('../../backend/get_session_user.php');
    const data = await response.json();
    
    const authButtons = document.querySelector('.navbar-auth-buttons');
    const userLoggedSection = document.querySelector('.navbar-user-logged');
    const mobileAuthButtons = document.querySelector('.mobile-menu .navbar-auth-buttons');
    const postListingLink = document.getElementById('postListingLink');
    
    if (data.success && data.user) {
      // Lưu thông tin user vào localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Hiển thị phần user đã đăng nhập
      if (authButtons) authButtons.style.display = 'none';
      if (userLoggedSection) {
        userLoggedSection.style.display = 'flex';
        
        // Cập nhật thông tin user
        const userName = userLoggedSection.querySelector('.user-dropdown-name');
        const userEmail = userLoggedSection.querySelector('.user-dropdown-email');
        
        if (userName) userName.textContent = data.user.name;
        if (userEmail) userEmail.textContent = data.user.email;
        
        // Cập nhật link hồ sơ dựa trên role
        const profileLink = userLoggedSection.querySelector('a[href*="profile"]');
        if (profileLink && data.user.role) {
          if (data.user.role === 'landlord') {
            profileLink.href = 'landlord-profile.html';
          } else if (data.user.role === 'tenant') {
            profileLink.href = '#';
            profileLink.style.cursor = 'pointer';
          }
        }
      }
      
      // Ẩn nút đăng nhập trên mobile
      if (mobileAuthButtons) mobileAuthButtons.style.display = 'none';
      
      // Ẩn button "Đăng tin" khi đã login
      if (postListingLink) postListingLink.style.display = 'none';
      
    } else {
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      
      // Hiển thị nút đăng nhập
      if (authButtons) authButtons.style.display = 'block';
      if (userLoggedSection) userLoggedSection.style.display = 'none';
      if (mobileAuthButtons) mobileAuthButtons.style.display = 'block';
      
      // Hiển thị button "Đăng tin" khi chưa login
      if (postListingLink) postListingLink.style.display = 'block';
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
  }
}

// Kiểm tra trạng thái đăng nhập khi tải trang
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAuthState);
} else {
  checkAuthState();
}

// Xử lý đăng xuất
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtns = document.querySelectorAll('.dropdown-item.logout');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      try {
        const response = await fetch('../../backend/logout.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        // Xóa thông tin user khỏi localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
        checkAuthState();
        
        if (typeof showToast === 'function') {
          showToast('Đăng xuất thành công!', 'success');
        }
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
        
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        checkAuthState();
        window.location.href = 'index.html';
      }
    });
  });
});
