const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  return username && username.trim().length > 0;
};

const validatePhone = (phone) => {
  return phone && phone.trim().length > 0;
};

const validateName = (name) => {
  return name && name.trim().length > 0;
};

const generateID = (prefix) => {
  const ts = Date.now().toString(36).slice(-3).toUpperCase();
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${ts}${rand}`;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhone,
  validateName,
  generateID
};
