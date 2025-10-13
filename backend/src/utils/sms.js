// Minimal SMS utility placeholder. Integrate with AfricasTalking or other providers.
const sendSms = async (to, message) => {
  console.log(`Sending SMS to ${to}: ${message}`);
  // implement provider integration here
  return { success: true };
};

module.exports = { sendSms };
