const userService = require('../services/userService');

async function testLogin() {
  try {
    console.log('\n=== Test Login with Email ===');
    const emailResult = await userService.loginUser('nva@gmail.com', 'A');
    console.log('Email login result:', emailResult);
    
    console.log('\n=== Test Login with Username ===');
    const usernameResult = await userService.loginUser('A', 'A');
    console.log('Username login result:', usernameResult);
    
    if (emailResult.Name && usernameResult.Name) {
      console.log('\n✅ Both methods return Name field correctly');
      console.log('Email method Name:', emailResult.Name);
      console.log('Username method Name:', usernameResult.Name);
    } else {
      console.log('\n❌ Missing Name field');
      console.log('Email method has Name:', !!emailResult.Name);
      console.log('Username method has Name:', !!usernameResult.Name);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
