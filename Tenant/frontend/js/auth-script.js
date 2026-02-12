// ============================================
// RENTIFY - AUTHENTICATION JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // PASSWORD TOGGLE
  // ============================================
  
  const passwordToggles = {
    'togglePassword': 'passwordInput',
    'toggleConfirmPassword': 'confirmPasswordInput',
    'toggleNewPassword': 'newPasswordInput',
    'toggleCurrentPassword': 'currentPasswordInput'
  };
  
  Object.keys(passwordToggles).forEach(toggleId => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(passwordToggles[toggleId]);
    
    if (toggle && input) {
      toggle.addEventListener('click', function() {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        
        const icon = this.querySelector('i');
        if (type === 'password') {
          icon.className = 'bi bi-eye';
        } else {
          icon.className = 'bi bi-eye-slash';
        }
      });
    }
  });
  
  // ============================================
  // GOOGLE LOGIN (Mock)
  // ============================================
  
  const googleBtns = document.querySelectorAll('.auth-btn-google');
  googleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      showToast('Google login đang được phát triển', 'info');
    });
  });
  
  // ============================================
  // FORM VALIDATION HELPERS
  // ============================================
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    const cleaned = phone.replace(/\s/g, '');
    return re.test(cleaned);
  }
  
  function validatePassword(password) {
    return password.length >= 6;
  }
  
  // ============================================
  // REAL-TIME INPUT VALIDATION
  // ============================================
  
  // Email validation
  const emailInputs = document.querySelectorAll('input[type="email"]');
  emailInputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value && !validateEmail(this.value)) {
        this.classList.add('error');
        showFieldError(this, 'Email không hợp lệ');
      } else {
        this.classList.remove('error');
        hideFieldError(this);
      }
    });
    
    input.addEventListener('input', function() {
      this.classList.remove('error');
      hideFieldError(this);
    });
  });
  
  // Phone validation
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value && !validatePhone(this.value)) {
        this.classList.add('error');
        showFieldError(this, 'Số điện thoại không hợp lệ');
      } else {
        this.classList.remove('error');
        hideFieldError(this);
      }
    });
    
    input.addEventListener('input', function() {
      // Auto-format phone number
      let value = this.value.replace(/\D/g, '');
      if (value.length > 4 && value.length <= 7) {
        value = value.slice(0, 4) + ' ' + value.slice(4);
      } else if (value.length > 7) {
        value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
      }
      this.value = value;
      
      this.classList.remove('error');
      hideFieldError(this);
    });
  });
  
  function showFieldError(input, message) {
    const wrapper = input.closest('.auth-input-wrapper') || input.parentElement;
    let errorDiv = wrapper.nextElementSibling;
    
    if (!errorDiv || !errorDiv.classList.contains('auth-error-message')) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'auth-error-message';
      wrapper.parentNode.insertBefore(errorDiv, wrapper.nextSibling);
    }
    
    errorDiv.innerHTML = `
      <i class="bi bi-exclamation-circle"></i>
      <span>${message}</span>
    `;
    errorDiv.style.display = 'flex';
  }
  
  function hideFieldError(input) {
    const wrapper = input.closest('.auth-input-wrapper') || input.parentElement;
    const errorDiv = wrapper.nextElementSibling;
    
    if (errorDiv && errorDiv.classList.contains('auth-error-message')) {
      errorDiv.style.display = 'none';
    }
  }
  
  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  
  window.showToast = function(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.auth-toast').forEach(t => t.remove());
    
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
    toast.className = 'auth-toast';
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
    }, 5000);
  };
  
  // Add animation styles
  if (!document.getElementById('auth-animations')) {
    const style = document.createElement('style');
    style.id = 'auth-animations';
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
    `;
    document.head.appendChild(style);
  }
  
  // ============================================
  // LOADING STATE HELPER
  // ============================================
  
  window.setButtonLoading = function(button, loading, loadingText = 'Đang xử lý...') {
    if (loading) {
      button.dataset.originalHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<i class="bi bi-hourglass-split" style="animation: spin 1s linear infinite;"></i> ${loadingText}`;
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalHtml;
    }
  };
  
  // Add spin animation
  if (!document.getElementById('spin-animation')) {
    const style = document.createElement('style');
    style.id = 'spin-animation';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ============================================
  // URL PARAMS HELPER
  // ============================================
  
  const urlParams = new URLSearchParams(window.location.search);
  
  // Show success message if redirected from registration
  if (urlParams.get('registered') === 'true') {
    setTimeout(() => {
      showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
    }, 500);
  }
  
  // Show success message if password reset
  if (urlParams.get('reset') === 'true') {
    setTimeout(() => {
      showToast('Mật khẩu đã được đặt lại. Vui lòng đăng nhập.', 'success');
    }, 500);
  }
  
  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  
  document.addEventListener('keydown', function(e) {
    // ESC to clear errors
    if (e.key === 'Escape') {
      document.querySelectorAll('.auth-alert').forEach(alert => {
        alert.style.display = 'none';
      });
    }
  });
  
  // ============================================
  // AUTO-FOCUS FIRST INPUT
  // ============================================
  
  const firstInput = document.querySelector('.auth-form input:not([type="hidden"])');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
  
  // ============================================
  // PREVENT DOUBLE SUBMIT
  // ============================================
  
  const forms = document.querySelectorAll('.auth-form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn && submitBtn.disabled) {
        e.preventDefault();
        return false;
      }
    });
  });
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  console.log('Utility Scripts Loaded');
  
});