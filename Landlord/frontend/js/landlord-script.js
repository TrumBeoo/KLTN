// ============================================
// LANDLORD INTERFACE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // MODAL MANAGEMENT
  // ============================================
  
  const roomModal = document.getElementById('roomModal');
  const addRoomBtn = document.getElementById('addRoomBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveRoomBtn = document.getElementById('saveRoomBtn');
  const modalTitle = document.getElementById('modalTitle');
  const editRoomBtns = document.querySelectorAll('.edit-room-btn');
  
  // Open modal for adding room
  if (addRoomBtn) {
    addRoomBtn.addEventListener('click', () => {
      modalTitle.textContent = 'Thêm phòng mới';
      roomModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }
  
  // Open modal for editing room
  editRoomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalTitle.textContent = 'Chỉnh sửa phòng';
      roomModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      // Here you would populate form with room data
      showToast('Đang tải thông tin phòng...', 'info');
    });
  });
  
  // Close modal
  function closeModal() {
    if (roomModal) {
      roomModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
  
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  
  // Close modal on overlay click
  if (roomModal) {
    roomModal.addEventListener('click', (e) => {
      if (e.target === roomModal) {
        closeModal();
      }
    });
  }
  
  // Save room
  if (saveRoomBtn) {
    saveRoomBtn.addEventListener('click', () => {
      const form = document.getElementById('roomForm');
      
      if (form && form.checkValidity()) {
        // Collect form data
        const formData = new FormData(form);
        
        console.log('Saving room data...');
        showToast('Đang lưu thông tin phòng...', 'info');
        
        // Simulate API call
        setTimeout(() => {
          showToast('Lưu phòng thành công!', 'success');
          closeModal();
          form.reset();
        }, 1500);
        
      } else {
        form.reportValidity();
      }
    });
  }
  
  // ============================================
  // FILE UPLOAD
  // ============================================
  
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const previewContainer = document.getElementById('previewContainer');
  
  if (uploadZone && fileInput) {
    // Click to upload
    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('active');
    });
    
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('active');
    });
    
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('active');
      
      const files = e.dataTransfer.files;
      handleFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      handleFiles(files);
    });
  }
  
  function handleFiles(files) {
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    Array.from(files).slice(0, 10).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const preview = document.createElement('div');
          preview.style.cssText = `
            position: relative;
            aspect-ratio: 1;
            border-radius: 0.75rem;
            overflow: hidden;
            border: 2px solid var(--ll-border);
          `;
          
          preview.innerHTML = `
            <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
            <button style="
              position: absolute;
              top: 0.5rem;
              right: 0.5rem;
              width: 2rem;
              height: 2rem;
              background-color: rgba(239, 68, 68, 0.9);
              color: white;
              border: none;
              border-radius: 0.375rem;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            " onclick="this.parentElement.remove()">
              <i class="bi bi-x-lg"></i>
            </button>
          `;
          
          previewContainer.appendChild(preview);
        };
        
        reader.readAsDataURL(file);
      }
    });
    
    showToast(`Đã thêm ${Math.min(files.length, 10)} ảnh`, 'success');
  }
  
  // ============================================
  // ACTION BUTTONS
  // ============================================
  
  // View room details
  document.querySelectorAll('.action-btn[title="Xem chi tiết"]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Đang tải chi tiết phòng...', 'info');
      // Navigate to room detail page
      // window.location.href = 'room-detail-landlord.html?id=123';
    });
  });
  
  // Delete room
  document.querySelectorAll('.action-btn.danger[title="Xóa"]').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.disabled) return;
      
      if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
        showToast('Đang xóa phòng...', 'info');
        
        setTimeout(() => {
          showToast('Xóa phòng thành công!', 'success');
          this.closest('tr').remove();
        }, 1000);
      }
    });
  });
  
  // ============================================
  // VIEWING SCHEDULE ACTIONS
  // ============================================
  
  // Approve viewing
  document.querySelectorAll('.action-btn[title="Xác nhận"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const tenant = row.querySelector('td:first-child div:first-child').textContent;
      
      if (confirm(`Xác nhận lịch xem phòng của ${tenant}?`)) {
        showToast('Đang xác nhận lịch xem...', 'info');
        
        setTimeout(() => {
          showToast('Đã xác nhận lịch xem thành công!', 'success');
          row.style.backgroundColor = 'var(--ll-status-available-bg)';
          
          // Replace action buttons
          const actionCell = row.querySelector('td:last-child');
          actionCell.innerHTML = `
            <span style="color: var(--ll-success); font-weight: 600;">
              <i class="bi bi-check-circle-fill"></i> Đã duyệt
            </span>
          `;
        }, 1000);
      }
    });
  });
  
  // Reject viewing
  document.querySelectorAll('.action-btn.danger[title="Từ chối"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const tenant = row.querySelector('td:first-child div:first-child').textContent;
      
      if (confirm(`Từ chối lịch xem phòng của ${tenant}?`)) {
        showToast('Đang từ chối lịch xem...', 'info');
        
        setTimeout(() => {
          showToast('Đã từ chối lịch xem', 'info');
          row.remove();
        }, 1000);
      }
    });
  });
  
  // ============================================
  // FILTERS & SEARCH
  // ============================================
  
  const filterSelects = document.querySelectorAll('.filter-bar select');
  filterSelects.forEach(select => {
    select.addEventListener('change', () => {
      console.log('Filter changed:', select.value);
      showToast('Đang áp dụng bộ lọc...', 'info');
      
      // Here you would filter the table
      setTimeout(() => {
        showToast('Đã áp dụng bộ lọc', 'success');
      }, 800);
    });
  });
  
  // Reset filters
  const resetBtn = document.querySelector('.filter-bar .btn-ll-outline');
  if (resetBtn && resetBtn.textContent.includes('Reset')) {
    resetBtn.addEventListener('click', () => {
      filterSelects.forEach(select => {
        select.selectedIndex = 0;
      });
      showToast('Đã xóa bộ lọc', 'info');
    });
  }
  
  // Search
  const navbarSearch = document.querySelector('.navbar-search input');
  if (navbarSearch) {
    let searchTimeout;
    navbarSearch.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value;
        if (query.length > 0) {
          console.log('Searching:', query);
          // Implement search logic here
        }
      }, 500);
    });
  }
  
  // ============================================
  // SIDEBAR TOGGLE (Mobile)
  // ============================================
  
  const sidebar = document.querySelector('.landlord-sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('show');
        }
      }
    });
  }
  
  // ============================================
  // NOTIFICATION DROPDOWN
  // ============================================
  
  const notificationBtn = document.querySelector('.navbar-notification');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      showToast('Tính năng thông báo đang phát triển', 'info');
    });
  }
  
  // ============================================
  // EXPORT EXCEL
  // ============================================
  
  const exportBtn = document.querySelector('.btn-ll-outline');
  if (exportBtn && exportBtn.textContent.includes('Xuất Excel')) {
    exportBtn.addEventListener('click', () => {
      showToast('Đang xuất file Excel...', 'info');
      
      setTimeout(() => {
        showToast('Xuất Excel thành công!', 'success');
      }, 1500);
    });
  }
  
  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  
  function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.ll-toast').forEach(t => t.remove());
    
    const colors = {
      success: 'var(--ll-success)',
      error: 'var(--ll-error)',
      warning: 'var(--ll-warning)',
      info: 'var(--ll-info)'
    };
    
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    
    const toast = document.createElement('div');
    toast.className = 'll-toast';
    toast.style.cssText = `
      position: fixed;
      top: calc(var(--ll-navbar-height) + 1rem);
      right: 2rem;
      min-width: 320px;
      max-width: 500px;
      padding: 1rem 1.5rem;
      background-color: ${colors[type]};
      color: white;
      border-radius: 0.75rem;
      box-shadow: var(--ll-shadow-xl);
      z-index: var(--ll-z-toast);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      font-size: 0.9375rem;
      animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
      <i class="bi ${icons[type]}" style="font-size: 1.5rem; flex-shrink: 0;"></i>
      <span style="flex: 1;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
  
  // Add animation styles
  if (!document.getElementById('landlord-animations')) {
    const style = document.createElement('style');
    style.id = 'landlord-animations';
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
      navbarSearch?.focus();
    }
    
    // Escape: Close modal
    if (e.key === 'Escape') {
      closeModal();
    }
    
    // Ctrl/Cmd + N: Add new room (on manage rooms page)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      if (addRoomBtn) {
        e.preventDefault();
        addRoomBtn.click();
      }
    }
  });
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  console.log('Landlord Interface Loaded');
  
  // Auto-update KPI values (demo)
  setInterval(() => {
    const kpiValues = document.querySelectorAll('.kpi-value');
    kpiValues.forEach(value => {
      // Add subtle pulse animation on update
      value.style.transform = 'scale(1.05)';
      setTimeout(() => {
        value.style.transform = 'scale(1)';
      }, 200);
    });
  }, 30000); // Every 30 seconds
  
});