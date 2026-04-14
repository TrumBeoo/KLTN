const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 50;
};

const validatePhone = (phone) => {
  if (!phone) return true;
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

const validateName = (name) => {
  return name && name.length >= 2 && name.length <= 100;
};

const generateID = (prefix) => {
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${random}`;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhone,
  validateName,
  generateID
};
