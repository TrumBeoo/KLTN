// ============================================
// RENTIFY - PROFILE JAVASCRIPT
// For both Landlord & Tenant profiles
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // TAB SWITCHING
  // ============================================
  
  const tabs = document.querySelectorAll('.profile-tab');
  const tabContents = document.querySelectorAll('.profile-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      // Add active to clicked tab
      tab.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
  
  // ============================================
  // AVATAR UPLOAD
  // ============================================
  
  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showToast('Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB', 'error');
          return;
        }
        
        // Validate file type
        if (!file.type.match('image.*')) {
          showToast('Vui lòng chọn file hình ảnh!', 'error');
          return;
        }
        
        // Preview
        const reader = new FileReader();
        reader.onload = function(e) {
          avatarPreview.src = e.target.result;
          showToast('Ảnh đã được chọn. Nhấn "Lưu thay đổi" để cập nhật.', 'info');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // ============================================
  // PERSONAL INFO FORM
  // ============================================
  
  const personalInfoForm = document.getElementById('personalInfoForm');
  
  if (personalInfoForm) {
    personalInfoForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validate
      if (!validateForm(this)) {
        return;
      }
      
      // Disable submit button
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Đang lưu...';
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Success
        showToast('Cập nhật thông tin thành công!', 'success');
        
        // Update header info
        updateHeaderInfo();
        
      } catch (error) {
        showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    });
  }
  
  // ============================================
  // PASSWORD FORM
  // ============================================
  
  const passwordForm = document.getElementById('passwordForm');
  const MOCK_CURRENT_PASSWORD = '123456';
  
  if (passwordForm) {
    passwordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Clear errors
      document.querySelectorAll('.profile-error-message').forEach(err => {
        err.style.display = 'none';
      });
      document.querySelectorAll('.profile-input').forEach(input => {
        input.classList.remove('error');
      });
      
      // Validate current password
      if (currentPassword !== MOCK_CURRENT_PASSWORD) {
        showError('currentPassword', 'currentPasswordError');
        return;
      }
      
      // Validate new password
      if (!validatePassword(newPassword)) {
        showError('newPassword', 'newPasswordError');
        return;
      }
      
      // Validate confirm password
      if (newPassword !== confirmPassword) {
        showError('confirmPassword', 'confirmPasswordError');
        return;
      }
      
      // Check if new password is different
      if (newPassword === currentPassword) {
        showToast('Mật khẩu mới phải khác mật khẩu hiện tại!', 'error');
        return;
      }
      
      // Disable submit button
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Đang cập nhật...';
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Success
        showToast('Đổi mật khẩu thành công!', 'success');
        
        // Reset form
        this.reset();
        
      } catch (error) {
        showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    });
  }
  
  // ============================================
  // FORM VALIDATION
  // ============================================
  
  function validateForm(form) {
    let isValid = true;
    
    // Email validation
    const emailInput = form.querySelector('#emailInput');
    if (emailInput) {
      const email = emailInput.value.trim();
      if (!validateEmail(email)) {
        showError('emailInput', 'emailError');
        isValid = false;
      }
    }
    
    // Phone validation
    const phoneInput = form.querySelector('#phoneInput');
    if (phoneInput) {
      const phone = phoneInput.value.replace(/\s/g, '');
      if (!validatePhone(phone)) {
        showError('phoneInput', 'phoneError');
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone);
  }
  
  function validatePassword(password) {
    // Min 8 characters, at least one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
  }
  
  function showError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if (input) input.classList.add('error');
    if (error) error.style.display = 'flex';
  }
  
  // Clear errors on input
  document.querySelectorAll('.profile-input').forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('error');
      const errorMsg = this.closest('.profile-form-group').querySelector('.profile-error-message');
      if (errorMsg) {
        errorMsg.style.display = 'none';
      }
    });
  });
  
  // ============================================
  // PHONE AUTO-FORMAT
  // ============================================
  
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      if (value.length > 4 && value.length <= 7) {
        value = value.slice(0, 4) + ' ' + value.slice(4);
      } else if (value.length > 7) {
        value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
      }
      this.value = value;
    });
  });
  
  // ============================================
  // UPDATE HEADER INFO
  // ============================================
  
  function updateHeaderInfo() {
    const nameInput = document.querySelector('#personal input[type="text"]');
    const emailInput = document.querySelector('#personal input[type="email"]');
    const phoneInput = document.querySelector('#personal input[type="tel"]');
    
    if (nameInput) {
      const headerName = document.querySelector('.profile-name');
      if (headerName) {
        headerName.textContent = nameInput.value;
      }
    }
    
    if (emailInput) {
      const headerEmail = document.querySelector('.profile-meta-item:has(.bi-envelope) span');
      if (headerEmail) {
        headerEmail.textContent = emailInput.value;
      }
    }
    
    if (phoneInput) {
      const headerPhone = document.querySelector('.profile-meta-item:has(.bi-telephone) span');
      if (headerPhone) {
        headerPhone.textContent = phoneInput.value;
      }
    }
  }
  
  // ============================================
  // PREFERENCES TAGS (Tenant)
  // ============================================
  
  const preferenceTags = document.querySelectorAll('.profile-tag');
  preferenceTags.forEach(tag => {
    tag.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });
  
  // ============================================
  // FAVORITE ACTIONS
  // ============================================
  
  const favoriteRemoveBtns = document.querySelectorAll('.profile-favorite-btn.outline');
  favoriteRemoveBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (confirm('Bạn có chắc muốn bỏ yêu thích phòng này?')) {
        const card = this.closest('.profile-favorite-card');
        card.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(() => {
          card.remove();
          
          // Update count
          const titleCount = document.querySelector('#favorites .profile-card-title');
          if (titleCount) {
            const currentCount = parseInt(titleCount.textContent.match(/\d+/)[0]);
            titleCount.innerHTML = titleCount.innerHTML.replace(/\d+/, currentCount - 1);
          }
          
          showToast('Đã bỏ yêu thích phòng này', 'success');
        }, 300);
      }
    });
  });
  
  // ============================================
  // BUILDING/HISTORY ACTIONS
  // ============================================
  
  const viewDetailBtns = document.querySelectorAll('.profile-building-action, .profile-history-action');
  viewDetailBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      showToast('Đang tải chi tiết...', 'info');
      // Navigate to detail page
      setTimeout(() => {
        console.log('Navigate to detail page');
      }, 500);
    });
  });
  
  // ============================================
  // TOAST NOTIFICATION
  // ============================================
  
  function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.profile-toast').forEach(t => t.remove());
    
    const colors = {
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };
    
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    
    const toast = document.createElement('div');
    toast.className = 'profile-toast';
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      min-width: 320px;
      max-width: 500px;
      padding: 1rem 1.25rem;
      background: ${colors[type]};
      color: white;
      border-radius: 0.75rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      font-weight: 500;
      font-size: 0.9375rem;
      animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
      <i class="bi ${icons[type]}" style="font-size: 1.5rem; flex-shrink: 0;"></i>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 0.375rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
        <i class="bi bi-x-lg"></i>
      </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
  
  // Add animations
  if (!document.getElementById('profile-animations')) {
    const style = document.createElement('style');
    style.id = 'profile-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      @keyframes fadeOut {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.9);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ============================================
  // LOGOUT
  // ============================================
  
  window.logout = function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      showToast('Đang đăng xuất...', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    }
  };
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  console.log('Profile page loaded');
  
  // Show welcome toast
  setTimeout(() => {
    const userName = document.querySelector('.profile-name').textContent;
    showToast(`Chào mừng, ${userName}!`, 'success');
  }, 500);
  
});