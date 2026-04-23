const axios = require('axios');

async function testNotification() {
  try {
    console.log('=== Testing Landlord Notification Creation ===');
    
    // Test tạo notification cho landlord
    const landlordResponse = await axios.post('http://localhost:5555/api/notifications/create', {
      targetId: 'LL00001', // Thay bằng LandlordID thực tế
      content: 'Test notification for landlord',
      type: 'Lịch xem',
      link: '/viewing-schedules'
    });
    
    console.log('Landlord notification response:', landlordResponse.data);
    
    console.log('\n=== Testing Tenant Notification Creation ===');
    
    // Test tạo notification cho tenant
    const tenantResponse = await axios.post('http://localhost:5000/api/notifications/create', {
      targetId: 'TN00001', // Thay bằng TenantID thực tế
      content: 'Test notification for tenant',
      type: 'Lịch xem'
    });
    
    console.log('Tenant notification response:', tenantResponse.data);
    
  } catch (error) {
    console.error('Test failed:');
    console.error('Message:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
  }
}

testNotification();
