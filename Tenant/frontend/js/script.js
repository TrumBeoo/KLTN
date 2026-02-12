// ============================================
// RENTIFY - TENANT INTERFACE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // HERO FILTER CHIPS
  // ============================================
  
  const filterChips = document.querySelectorAll('.filter-chip');
  
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      
      // Collect active filters
      const activeFilters = Array.from(filterChips)
        .filter(c => c.classList.contains('active'))
        .map(c => c.dataset.filter);
      
      console.log('Active filters:', activeFilters);
      
      // Here you would apply filters and navigate to listings
      if (activeFilters.length > 0) {
        // Build query string
        const queryString = activeFilters.join('&');
        // Navigate to listings page with filters
        // window.location.href = `listings.html?filters=${queryString}`;
        showToast(`Đã chọn ${activeFilters.length} bộ lọc`, 'info');
      }
    });
  });
  
  // ============================================
  // NAVBAR FUNCTIONALITY
  // ============================================
  
  // Sticky navbar on scroll
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Search dropdown
  const searchInput = document.getElementById('searchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  
  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      searchDropdown.classList.add('show');
    });
    
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        searchDropdown.classList.remove('show');
      }, 200);
    });
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      // Here you would implement AJAX search
      if (query.length > 0) {
        searchDropdown.classList.add('show');
        // Simulate search results
        console.log('Searching for:', query);
      } else {
        searchDropdown.classList.remove('show');
      }
    });
  }
  
  // User dropdown
  const userAvatarBtn = document.getElementById('userAvatarBtn');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  
  if (userAvatarBtn && userDropdownMenu) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      userDropdownMenu.classList.remove('show');
    });
  }
  
  // Mobile menu
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileOverlay = document.getElementById('mobileOverlay');
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('show');
      mobileOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }
  
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }
  
  function closeMobileMenu() {
    mobileMenu.classList.remove('show');
    mobileOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  
  // ============================================
  // FILTER PANEL FUNCTIONALITY
  // ============================================
  
  // Filter Modal
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const filterModal = document.getElementById('filterModal');
  const filterModalOverlay = document.getElementById('filterModalOverlay');
  const filterModalClose = document.getElementById('filterModalClose');
  const modalApplyFilters = document.getElementById('modalApplyFilters');
  const modalClearFilters = document.getElementById('modalClearFilters');
  
  function openFilterModal() {
    if (filterModal) {
      filterModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }
  
  function closeFilterModal() {
    if (filterModal) {
      filterModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
  
  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', openFilterModal);
  }
  
  if (filterModalClose) {
    filterModalClose.addEventListener('click', closeFilterModal);
  }
  
  if (filterModalOverlay) {
    filterModalOverlay.addEventListener('click', closeFilterModal);
  }
  
  if (modalApplyFilters) {
    modalApplyFilters.addEventListener('click', () => {
      // Collect filter values from modal
      const filters = {
        city: document.getElementById('modalCitySelect')?.value,
        district: document.getElementById('modalDistrictSelect')?.value,
        ward: document.getElementById('modalWardSelect')?.value,
        priceMin: document.getElementById('modalPriceMin')?.value,
        priceMax: document.getElementById('modalPriceMax')?.value,
        areaMin: document.getElementById('modalAreaMin')?.value,
        areaMax: document.getElementById('modalAreaMax')?.value,
        status: document.querySelector('input[name="modalStatus"]:checked')?.value
      };
      
      console.log('Applying filters:', filters);
      showToast('Đang tìm kiếm phòng phù hợp...', 'info');
      closeFilterModal();
    });
  }
  
  if (modalClearFilters) {
    modalClearFilters.addEventListener('click', () => {
      // Reset modal filters
      document.querySelectorAll('.filter-modal input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      document.querySelectorAll('.filter-modal input[type="radio"][value="all"]').forEach(radio => {
        radio.checked = true;
      });
      document.querySelectorAll('.filter-modal select').forEach(select => {
        select.selectedIndex = 0;
      });
      
      const modalPriceMin = document.getElementById('modalPriceMin');
      const modalPriceMax = document.getElementById('modalPriceMax');
      const modalAreaMin = document.getElementById('modalAreaMin');
      const modalAreaMax = document.getElementById('modalAreaMax');
      
      if (modalPriceMin) modalPriceMin.value = 2;
      if (modalPriceMax) modalPriceMax.value = 10;
      if (modalAreaMin) modalAreaMin.value = 20;
      if (modalAreaMax) modalAreaMax.value = 50;
      
      updateModalRangeValues();
      console.log('Modal filters cleared');
    });
  }
  
  // Modal range sliders
  function updateModalRangeValues() {
    const modalPriceMin = document.getElementById('modalPriceMin');
    const modalPriceMax = document.getElementById('modalPriceMax');
    const modalPriceMinValue = document.getElementById('modalPriceMinValue');
    const modalPriceMaxValue = document.getElementById('modalPriceMaxValue');
    
    if (modalPriceMin && modalPriceMinValue) {
      modalPriceMinValue.textContent = modalPriceMin.value + 'tr';
    }
    if (modalPriceMax && modalPriceMaxValue) {
      modalPriceMaxValue.textContent = modalPriceMax.value + 'tr';
    }
    
    const modalAreaMin = document.getElementById('modalAreaMin');
    const modalAreaMax = document.getElementById('modalAreaMax');
    const modalAreaMinValue = document.getElementById('modalAreaMinValue');
    const modalAreaMaxValue = document.getElementById('modalAreaMaxValue');
    
    if (modalAreaMin && modalAreaMinValue) {
      modalAreaMinValue.textContent = modalAreaMin.value + 'm²';
    }
    if (modalAreaMax && modalAreaMaxValue) {
      modalAreaMaxValue.textContent = modalAreaMax.value + 'm²';
    }
  }
  
  // Add event listeners to modal range inputs
  document.querySelectorAll('.filter-modal .range-input').forEach(input => {
    input.addEventListener('input', updateModalRangeValues);
  });
  
  // Initial update for modal
  updateModalRangeValues();
  
  // Clear filters
  const clearFiltersBtn = document.getElementById('clearFilters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      // Reset all filters
      document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      document.querySelectorAll('.filter-panel input[type="radio"][value="all"]').forEach(radio => {
        radio.checked = true;
      });
      document.querySelectorAll('.filter-panel select').forEach(select => {
        select.selectedIndex = 0;
      });
      
      // Reset range sliders
      const priceMin = document.getElementById('priceMin');
      const priceMax = document.getElementById('priceMax');
      const areaMin = document.getElementById('areaMin');
      const areaMax = document.getElementById('areaMax');
      
      if (priceMin) priceMin.value = 2;
      if (priceMax) priceMax.value = 10;
      if (areaMin) areaMin.value = 20;
      if (areaMax) areaMax.value = 50;
      
      updateRangeValues();
      
      console.log('Filters cleared');
    });
  }
  
  // Range sliders
  function updateRangeValues() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceMinValue = document.getElementById('priceMinValue');
    const priceMaxValue = document.getElementById('priceMaxValue');
    
    if (priceMin && priceMinValue) {
      priceMinValue.textContent = priceMin.value + 'tr';
    }
    if (priceMax && priceMaxValue) {
      priceMaxValue.textContent = priceMax.value + 'tr';
    }
    
    const areaMin = document.getElementById('areaMin');
    const areaMax = document.getElementById('areaMax');
    const areaMinValue = document.getElementById('areaMinValue');
    const areaMaxValue = document.getElementById('areaMaxValue');
    
    if (areaMin && areaMinValue) {
      areaMinValue.textContent = areaMin.value + 'm²';
    }
    if (areaMax && areaMaxValue) {
      areaMaxValue.textContent = areaMax.value + 'm²';
    }
  }
  
  // Add event listeners to range inputs
  document.querySelectorAll('.range-input').forEach(input => {
    input.addEventListener('input', updateRangeValues);
  });
  
  // Initial update
  updateRangeValues();
  
  // Apply filters
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      // Collect filter values
      const filters = {
        city: document.getElementById('citySelect')?.value,
        district: document.getElementById('districtSelect')?.value,
        ward: document.getElementById('wardSelect')?.value,
        priceMin: document.getElementById('priceMin')?.value,
        priceMax: document.getElementById('priceMax')?.value,
        areaMin: document.getElementById('areaMin')?.value,
        areaMax: document.getElementById('areaMax')?.value,
        roomTypes: [],
        amenities: [],
        status: document.querySelector('input[name="status"]:checked')?.value
      };
      
      // Collect checked room types
      document.querySelectorAll('.filter-panel input[type="checkbox"]:checked').forEach(cb => {
        if (cb.closest('.filter-group')?.querySelector('.filter-label i.bi-house-door')) {
          filters.roomTypes.push(cb.value);
        } else if (cb.closest('.filter-group')?.querySelector('.filter-label i.bi-stars')) {
          filters.amenities.push(cb.value);
        }
      });
      
      console.log('Applying filters:', filters);
      
      // Here you would make an AJAX request to filter listings
      // For now, just show a message
      showToast('Đang tìm kiếm phòng phù hợp...', 'info');
      
      // Close mobile filter if open
      closeMobileFilter();
    });
  }
  
  // Mobile filter button
  const mobileFilterBtn = document.getElementById('mobileFilterBtn');
  const filterPanel = document.getElementById('filterPanel');
  
  if (mobileFilterBtn && filterPanel) {
    mobileFilterBtn.addEventListener('click', () => {
      filterPanel.classList.add('show');
      mobileOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }
  
  function closeMobileFilter() {
    if (filterPanel) {
      filterPanel.classList.remove('show');
    }
    if (mobileOverlay) {
      mobileOverlay.classList.remove('show');
    }
    document.body.style.overflow = '';
  }
  
  // Close filter when clicking overlay
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileFilter);
  }
  
  // ============================================
  // VIEW TOGGLE (List/Map)
  // ============================================
  
  const viewTabs = document.querySelectorAll('.results-tab');
  const listingGrid = document.getElementById('listingGrid');
  const mapView = document.getElementById('mapView');
  
  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      
      // Update active tab
      viewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Toggle views
      if (view === 'list') {
        listingGrid.style.display = 'grid';
        mapView.style.display = 'none';
      } else if (view === 'map') {
        listingGrid.style.display = 'none';
        mapView.style.display = 'block';
        
        // Initialize map if not already done
        if (!window.mapInitialized) {
          initMap();
        }
      }
    });
  });
  
  // ============================================
  // FAVORITE FUNCTIONALITY
  // ============================================
  
  const favoriteBtns = document.querySelectorAll('.favorite-btn');
  
  favoriteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      
      if (btn.classList.contains('active')) {
        icon.classList.remove('bi-heart');
        icon.classList.add('bi-heart-fill');
        showToast('Đã thêm vào danh sách yêu thích', 'success');
      } else {
        icon.classList.remove('bi-heart-fill');
        icon.classList.add('bi-heart');
        showToast('Đã xóa khỏi danh sách yêu thích', 'info');
      }
    });
  });
  
  // ============================================
  // LISTING CARD CLICK
  // ============================================
  
  const listingCards = document.querySelectorAll('.listing-card, .recommendation-card');
  
  listingCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking favorite button
      if (e.target.closest('.favorite-btn')) {
        return;
      }
      
      // Navigate to room detail page
      console.log('Navigating to room detail...');
      // window.location.href = 'room-detail.html?id=123';
    });
  });
  
  // ============================================
  // SORT FUNCTIONALITY
  // ============================================
  
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const sortValue = e.target.value;
      console.log('Sorting by:', sortValue);
      
      // Here you would implement sorting logic
      showToast('Đang sắp xếp kết quả...', 'info');
    });
  }
  
  // ============================================
  // PAGINATION
  // ============================================
  
  const paginationBtns = document.querySelectorAll('.pagination-btn:not(.active)');
  
  paginationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      console.log('Loading page...');
      // Here you would load the next page of results
    });
  });
  
  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  
  function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      min-width: 300px;
      padding: 1rem 1.5rem;
      background-color: ${getToastColor(type)};
      color: white;
      border-radius: 0.75rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      animation: slideInRight 0.3s ease;
    `;
    
    const icon = document.createElement('i');
    icon.className = getToastIcon(type);
    icon.style.fontSize = '1.25rem';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  function getToastColor(type) {
    const colors = {
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#2563EB'
    };
    return colors[type] || colors.info;
  }
  
  function getToastIcon(type) {
    const icons = {
      success: 'bi bi-check-circle-fill',
      error: 'bi bi-x-circle-fill',
      warning: 'bi bi-exclamation-triangle-fill',
      info: 'bi bi-info-circle-fill'
    };
    return icons[type] || icons.info;
  }
  
  // Add animation styles
  const style = document.createElement('style');
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
  
  // ============================================
  // MAP INITIALIZATION (Placeholder)
  // ============================================
  
  function initMap() {
    console.log('Initializing map...');
    
    // Here you would initialize Google Maps
    // This is a placeholder
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background-color: #f8fafc;
          color: #64748b;
          font-size: 1.125rem;
          font-weight: 600;
        ">
          <div style="text-align: center;">
            <i class="bi bi-map" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
            Bản đồ sẽ hiển thị ở đây
            <div style="font-size: 0.875rem; margin-top: 0.5rem; color: #94a3b8;">
              Tích hợp Google Maps API
            </div>
          </div>
        </div>
      `;
      window.mapInitialized = true;
    }
  }
  
  // ============================================
  // LOCATION CASCADING DROPDOWNS
  // ============================================
  
  const citySelect = document.getElementById('citySelect');
  const districtSelect = document.getElementById('districtSelect');
  const wardSelect = document.getElementById('wardSelect');
  
  if (citySelect && districtSelect) {
    citySelect.addEventListener('change', () => {
      // Reset district and ward
      districtSelect.selectedIndex = 0;
      wardSelect.selectedIndex = 0;
      
      // Here you would load districts based on selected city
      console.log('City changed:', citySelect.value);
    });
  }
  
  if (districtSelect && wardSelect) {
    districtSelect.addEventListener('change', () => {
      // Reset ward
      wardSelect.selectedIndex = 0;
      
      // Here you would load wards based on selected district
      console.log('District changed:', districtSelect.value);
    });
  }
  
  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // ============================================
  // LAZY LOADING IMAGES
  // ============================================
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // ============================================
  // INITIALIZE ON LOAD
  // ============================================
  
  console.log('Rentify Tenant Interface Loaded');
  
  // ============================================
  // BACK TO TOP BUTTON
  // ============================================
  
  const backToTopBtn = document.getElementById('backToTopBtn');
  
  if (backToTopBtn) {
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
});