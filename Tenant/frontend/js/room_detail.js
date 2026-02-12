// ============================================
// ROOM DETAIL PAGE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // IMAGE GALLERY
  // ============================================
  
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const viewAllBtn = document.querySelector('.view-all-btn');
  
  // Thumbnail click to change main image
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      // Update active thumbnail
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      
      // Change main image
      mainImage.src = thumb.src.replace('w=200&h=150', 'w=800&h=600');
      
      // Add fade animation
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.style.opacity = '1';
      }, 50);
    });
  });
  
  // View all images button
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      console.log('Opening lightbox gallery...');
      // Here you would implement a lightbox/modal gallery
      showToast('Tính năng lightbox đang phát triển', 'info');
    });
  }
  
  // ============================================
  // FAVORITE & SHARE BUTTONS
  // ============================================
  
  const favoriteBtnLarge = document.querySelector('.favorite-btn-large');
  const shareBtn = document.querySelector('.share-btn');
  
  if (favoriteBtnLarge) {
    favoriteBtnLarge.addEventListener('click', (e) => {
      e.preventDefault();
      favoriteBtnLarge.classList.toggle('active');
      
      const icon = favoriteBtnLarge.querySelector('i');
      if (favoriteBtnLarge.classList.contains('active')) {
        icon.classList.remove('bi-heart');
        icon.classList.add('bi-heart-fill');
        showToast('Đã thêm vào danh sách yêu thích', 'success');
      } else {
        icon.classList.remove('bi-heart-fill');
        icon.classList.add('bi-heart');
        showToast('Đã xóa khỏi danh sách yêu thích', 'info');
      }
    });
  }
  
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      // Web Share API
      if (navigator.share) {
        navigator.share({
          title: document.querySelector('.room-title').textContent,
          text: 'Xem phòng này trên Rentify',
          url: window.location.href
        }).then(() => {
          showToast('Đã chia sẻ thành công', 'success');
        }).catch(() => {
          copyToClipboard(window.location.href);
        });
      } else {
        copyToClipboard(window.location.href);
      }
    });
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Đã sao chép link vào clipboard', 'success');
    });
  }
  
  // ============================================
  // BOOKING FORM
  // ============================================
  
  const bookingForm = document.querySelector('.booking-form');
  
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(bookingForm);
      const date = bookingForm.querySelector('input[type="date"]').value;
      const time = bookingForm.querySelector('select').value;
      const note = bookingForm.querySelector('textarea').value;
      
      if (!date || !time) {
        showToast('Vui lòng chọn ngày và giờ xem phòng', 'warning');
        return;
      }
      
      console.log('Booking data:', { date, time, note });
      
      // Show success message
      showToast('Đang gửi yêu cầu đặt lịch...', 'info');
      
      // Simulate API call
      setTimeout(() => {
        showToast('Đã gửi yêu cầu xem phòng thành công! Chủ nhà sẽ phản hồi trong 24h.', 'success');
        bookingForm.reset();
      }, 1500);
      
      // Here you would make actual API call:
      /*
      fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: getRoomId(),
          date: date,
          time: time,
          note: note
        })
      })
      .then(response => response.json())
      .then(data => {
        showToast('Đã gửi yêu cầu thành công!', 'success');
      })
      .catch(error => {
        showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
      });
      */
    });
  }
  
  // ============================================
  // CONTACT LANDLORD
  // ============================================
  
  const contactButtons = document.querySelectorAll('.sidebar-card .btn');
  
  contactButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      
      if (text.includes('Gửi tin nhắn')) {
        console.log('Opening chat...');
        showToast('Tính năng chat đang phát triển', 'info');
      } else if (text.includes('Gọi điện')) {
        console.log('Making call...');
        showToast('Tính năng gọi điện đang phát triển', 'info');
      }
    });
  });
  
  // ============================================
  // REVIEWS - HELPFUL BUTTON
  // ============================================
  
  const helpfulBtns = document.querySelectorAll('.review-helpful');
  
  helpfulBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Toggle helpful state
      if (!this.classList.contains('voted')) {
        this.classList.add('voted');
        this.style.backgroundColor = 'var(--primary-subtle)';
        this.style.borderColor = 'var(--primary)';
        this.style.color = 'var(--primary)';
        
        // Increment count
        const countText = this.textContent.match(/\((\d+)\)/);
        if (countText) {
          const newCount = parseInt(countText[1]) + 1;
          this.innerHTML = `<i class="bi bi-hand-thumbs-up-fill"></i> Hữu ích (${newCount})`;
        }
        
        showToast('Cảm ơn bạn đã đánh giá!', 'success');
      }
    });
  });
  
  // ============================================
  // MAP INITIALIZATION
  // ============================================
  
  const mapContainer = document.getElementById('detailMap');
  
  if (mapContainer) {
    // Placeholder - replace with actual Google Maps API
    mapContainer.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #64748b;
      ">
        <i class="bi bi-map" style="font-size: 2.5rem;"></i>
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: 4px;">Bản đồ vị trí</div>
          <div style="font-size: 0.875rem;">Tích hợp Google Maps</div>
        </div>
      </div>
    `;
    
    // Actual implementation would be:
    /*
    const map = new google.maps.Map(mapContainer, {
      center: { lat: 10.762622, lng: 106.660172 },
      zoom: 15
    });
    
    new google.maps.Marker({
      position: { lat: 10.762622, lng: 106.660172 },
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#14B8A6",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF"
      }
    });
    */
  }
  
  // ============================================
  // SMOOTH SCROLL FOR SECTIONS
  // ============================================
  
  const sectionLinks = document.querySelectorAll('a[href^="#"]');
  
  sectionLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 100;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  
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
  
  // Observe sections
  document.querySelectorAll('.amenities-section, .description-section, .reviews-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const colors = {
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#2563EB'
    };
    
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      min-width: 320px;
      max-width: 500px;
      padding: 1rem 1.5rem;
      background-color: ${colors[type]};
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      font-size: 15px;
      animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
      <i class="bi ${icons[type]}" style="font-size: 1.5rem;"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
  
  function getRoomId() {
    // Get room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || '123';
  }
  
  console.log('Room Detail Page Loaded');
  console.log('Room ID:', getRoomId());
  
});