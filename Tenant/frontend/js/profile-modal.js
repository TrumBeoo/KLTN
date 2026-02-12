document.addEventListener('DOMContentLoaded', () => {
  const profileModal = document.getElementById('profileModal');
  const profileModalClose = document.getElementById('profileModalClose');
  const profileModalContent = document.getElementById('profileModalContent');
  
  function closeProfileModal() {
    profileModal.classList.remove('active');
  }
  
  async function loadPersonalProfile() {
    try {
      const response = await fetch('../html/tenant-profile.html');
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const profileHeader = doc.querySelector('.profile-header');
      const personalContent = doc.querySelector('#personal');
      
      let modalHTML = '';
      if (profileHeader) modalHTML += profileHeader.outerHTML;
      if (personalContent) modalHTML += personalContent.outerHTML;
      
      profileModalContent.innerHTML = `<div class="tenant">${modalHTML}</div>`;
      profileModal.classList.add('active');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }
  
  async function loadTabOnly(tabId) {
    try {
      const response = await fetch('../html/tenant-profile.html');
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const tabContent = doc.querySelector(`#${tabId}`);
      
      if (!tabContent) {
        console.error(`Tab ${tabId} not found`);
        return;
      }
      
      tabContent.classList.add('active');
      profileModalContent.innerHTML = `<div class="tenant">${tabContent.outerHTML}</div>`;
      profileModal.classList.add('active');
    } catch (error) {
      console.error('Error loading tab:', error);
    }
  }
  
  profileModalClose.addEventListener('click', closeProfileModal);
  
  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfileModal();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileModal.classList.contains('active')) {
      closeProfileModal();
    }
  });
  
  const profileLink = document.querySelector('a[href="tenant-profile.html"]');
  if (profileLink) {
    profileLink.addEventListener('click', (e) => {
      e.preventDefault();
      loadPersonalProfile();
    });
  }
  
  window.openPreferencesModal = (e) => {
    e.preventDefault();
    loadTabOnly('preferences');
  };
  
  window.openHistoryModal = (e) => {
    e.preventDefault();
    loadTabOnly('history');
  };
  
  window.openPasswordModal = (e) => {
    e.preventDefault();
    loadTabOnly('password');
  };
});