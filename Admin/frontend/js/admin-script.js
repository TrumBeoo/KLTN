// ============================================
// ADMIN INTERFACE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // SIDEBAR TOGGLE
  // ============================================
  
  const sidebar = document.querySelector('.admin-sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }
  
  // ============================================
  // USER ACTIONS
  // ============================================
  
  // Block/Unblock User
  document.querySelectorAll('.admin-action-btn[title="Khóa"], .admin-action-btn[title="Mở khóa"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const userName = row.querySelector('td:first-child div div:first-child').textContent;
      const isBlocked = this.title === 'Mở khóa';
      
      const action = isBlocked ? 'mở khóa' : 'khóa';
      const message = `Bạn có chắc chắn muốn ${action} tài khoản "${userName}"?`;
      
      if (confirm(message)) {
        showToast(`Đang ${action} tài khoản...`, 'info');
        
        setTimeout(() => {
          const statusCell = row.querySelector('.admin-status');
          
          if (isBlocked) {
            // Unblock
            statusCell.className = 'admin-status active';
            statusCell.innerHTML = '<span class="admin-status-dot"></span>Active';
            this.title = 'Khóa';
            this.innerHTML = '<i class="bi bi-lock"></i>';
            this.classList.remove('success');
            this.classList.add('danger');
            showToast(`Đã mở khóa tài khoản "${userName}"`, 'success');
          } else {
            // Block
            statusCell.className = 'admin-status blocked';
            statusCell.innerHTML = '<span class="admin-status-dot"></span>Blocked';
            this.title = 'Mở khóa';
            this.innerHTML = '<i class="bi bi-unlock"></i>';
            this.classList.remove('danger');
            this.classList.add('success');
            showToast(`Đã khóa tài khoản "${userName}"`, 'success');
          }
        }, 1000);
      }
    });
  });
  
  // View User Details
  document.querySelectorAll('.admin-action-btn[title="Xem chi tiết"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const userName = row.querySelector('td:first-child div div:first-child').textContent;
      const userId = row.querySelector('td:first-child div div:nth-child(2)').textContent;
      
      showToast(`Đang tải chi tiết ${userName} (${userId})...`, 'info');
      
      // Here you would navigate to user detail page or open modal
      setTimeout(() => {
        console.log('Navigate to user detail:', userId);
      }, 500);
    });
  });
  
  // Edit User
  document.querySelectorAll('.admin-action-btn[title="Chỉnh sửa"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const userName = row.querySelector('td:first-child div div:first-child').textContent;
      
      showToast(`Mở form chỉnh sửa cho ${userName}...`, 'info');
      
      // Here you would open edit modal
    });
  });
  
  // Delete User (if exists)
  document.querySelectorAll('.admin-action-btn[title="Xóa"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const userName = row.querySelector('td:first-child div div:first-child').textContent;
      
      if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${userName}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
        if (confirm('Xác nhận lần cuối: Bạn thực sự muốn xóa?')) {
          showToast('Đang xóa tài khoản...', 'warning');
          
          setTimeout(() => {
            row.remove();
            showToast(`Đã xóa tài khoản "${userName}"`, 'success');
          }, 1500);
        }
      }
    });
  });
  
  // ============================================
  // LISTING MODERATION
  // ============================================
  
  // Approve Listing
  document.querySelectorAll('.admin-action-btn[title="Phê duyệt"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const listingTitle = row.querySelector('td:nth-child(2)').textContent;
      
      if (confirm(`Phê duyệt tin đăng: "${listingTitle}"?`)) {
        showToast('Đang phê duyệt tin đăng...', 'info');
        
        setTimeout(() => {
          row.style.backgroundColor = 'var(--admin-success-subtle)';
          
          const statusCell = row.querySelector('.admin-status');
          if (statusCell) {
            statusCell.className = 'admin-status active';
            statusCell.innerHTML = '<span class="admin-status-dot"></span>Approved';
          }
          
          const actionCell = this.closest('td');
          actionCell.innerHTML = '<span style="color: var(--admin-success); font-weight: 600;"><i class="bi bi-check-circle-fill"></i> Đã duyệt</span>';
          
          showToast('Đã phê duyệt tin đăng thành công!', 'success');
        }, 1000);
      }
    });
  });
  
  // Reject Listing
  document.querySelectorAll('.admin-action-btn[title="Từ chối"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const listingTitle = row.querySelector('td:nth-child(2)').textContent;
      
      const reason = prompt(`Lý do từ chối tin đăng "${listingTitle}":`);
      
      if (reason) {
        showToast('Đang từ chối tin đăng...', 'info');
        
        setTimeout(() => {
          row.style.backgroundColor = 'var(--admin-accent-subtle)';
          
          const statusCell = row.querySelector('.admin-status');
          if (statusCell) {
            statusCell.className = 'admin-status blocked';
            statusCell.innerHTML = '<span class="admin-status-dot"></span>Rejected';
          }
          
          const actionCell = this.closest('td');
          actionCell.innerHTML = '<span style="color: var(--admin-accent); font-weight: 600;"><i class="bi bi-x-circle-fill"></i> Đã từ chối</span>';
          
          showToast('Đã từ chối tin đăng', 'warning');
          console.log('Rejection reason:', reason);
        }, 1000);
      }
    });
  });
  
  // ============================================
  // SEARCH FUNCTIONALITY
  // ============================================
  
  const searchInput = document.querySelector('.admin-search input');
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.toLowerCase();
      
      searchTimeout = setTimeout(() => {
        if (query.length > 0) {
          console.log('Searching for:', query);
          
          // Search in table rows
          const rows = document.querySelectorAll('.admin-table tbody tr');
          let visibleCount = 0;
          
          rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(query)) {
              row.style.display = '';
              visibleCount++;
            } else {
              row.style.display = 'none';
            }
          });
          
          if (visibleCount === 0) {
            showToast('Không tìm thấy kết quả', 'info');
          }
        } else {
          // Reset all rows
          document.querySelectorAll('.admin-table tbody tr').forEach(row => {
            row.style.display = '';
          });
        }
      }, 500);
    });
  }
  
  // ============================================
  // NOTIFICATION
  // ============================================
  
  const notificationBtn = document.querySelector('.admin-notification');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      showToast('Bạn có 8 thông báo chưa đọc', 'info');
      // Here you would show notification dropdown
    });
  }
  
  // ============================================
  // QUICK ACTIONS
  // ============================================
  
  const quickActionBtns = document.querySelectorAll('.btn-admin-primary, .btn-admin-outline');
  quickActionBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (!this.closest('.admin-actions')) { // Exclude action buttons in tables
        const text = this.textContent.trim();
        
        if (text.includes('Thêm người dùng')) {
          showToast('Mở form thêm người dùng...', 'info');
        } else if (text.includes('Kiểm duyệt')) {
          window.location.href = 'listing-moderation.html';
        } else if (text.includes('Xuất báo cáo')) {
          showToast('Đang tạo báo cáo...', 'info');
          setTimeout(() => {
            showToast('Báo cáo đã sẵn sàng để tải xuống', 'success');
          }, 2000);
        } else if (text.includes('Cấu hình')) {
          window.location.href = 'system-settings.html';
        } else if (text.includes('Chế độ an toàn')) {
          const isActive = this.textContent.includes('Tắt');
          
          if (isActive) {
            this.innerHTML = '<i class="bi bi-shield-exclamation"></i> Chế độ an toàn';
            this.classList.remove('btn-admin-danger');
            this.classList.add('btn-admin-primary');
            showToast('Đã TẮT chế độ an toàn', 'warning');
          } else {
            if (confirm('Bật chế độ an toàn? Điều này sẽ hạn chế một số tính năng.')) {
              this.innerHTML = '<i class="bi bi-shield-check"></i> Tắt chế độ an toàn';
              showToast('Đã BẬT chế độ an toàn', 'success');
            }
          }
        }
      }
    });
  });
  
  // ============================================
  // STAT CARD ANIMATIONS
  // ============================================
  
  const statCards = document.querySelectorAll('.admin-stat-card');
  
  // Animate on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  statCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
  });
  
  // ============================================
  // AUTO REFRESH STATS (Demo)
  // ============================================
  
  let autoRefreshEnabled = false;
  
  function refreshStats() {
    if (!autoRefreshEnabled) return;
    
    const statValues = document.querySelectorAll('.admin-stat-value');
    statValues.forEach(value => {
      // Simulate value update
      value.style.transform = 'scale(1.1)';
      value.style.color = 'var(--admin-accent)';
      
      setTimeout(() => {
        value.style.transform = 'scale(1)';
        value.style.color = '';
      }, 300);
    });
    
    console.log('Stats refreshed');
  }
  
  // Refresh every 30 seconds
  setInterval(refreshStats, 30000);
  
  // ============================================
  // TOAST NOTIFICATION SYSTEM
  // ============================================
  
  function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.admin-toast').forEach(t => t.remove());
    
    const colors = {
      success: 'var(--admin-success)',
      error: 'var(--admin-accent)',
      warning: 'var(--admin-warning)',
      info: 'var(--admin-info)'
    };
    
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.style.cssText = `
      position: fixed;
      top: calc(var(--admin-navbar-height) + 1.5rem);
      right: 2rem;
      min-width: 350px;
      max-width: 500px;
      padding: 1.125rem 1.5rem;
      background: linear-gradient(135deg, ${colors[type]} 0%, ${type === 'info' ? 'var(--admin-info-dark)' : colors[type]} 100%);
      color: white;
      border-radius: 0.75rem;
      box-shadow: var(--admin-shadow-xl);
      z-index: var(--admin-z-toast);
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 600;
      font-size: 0.9375rem;
      animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
      <i class="bi ${icons[type]}" style="font-size: 1.75rem; flex-shrink: 0;"></i>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
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
  }
  
  // Add animation styles
  if (!document.getElementById('admin-animations')) {
    const style = document.createElement('style');
    style.id = 'admin-animations';
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
  // KEYBOARD SHORTCUTS
  // ============================================
  
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
    
    // Ctrl/Cmd + Shift + N: Add new user
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      showToast('Mở form thêm người dùng...', 'info');
    }
    
    // Escape: Clear search
    if (e.key === 'Escape' && searchInput === document.activeElement) {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
    }
  });
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  console.log('Admin Interface Loaded');
  console.log('Keyboard shortcuts:');
  console.log('- Ctrl/Cmd + K: Focus search');
  console.log('- Ctrl/Cmd + Shift + N: Add new user');
  console.log('- Escape: Clear search');
  
  // Show welcome toast
  setTimeout(() => {
    showToast('Chào mừng đến với Admin Panel - Rentify', 'success');
  }, 500);
  
});