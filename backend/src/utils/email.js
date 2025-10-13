// Minimal email utility placeholder. Replace with nodemailer or any provider integration.
const sendEmail = async (to, subject, text) => {
  console.log(`Sending email to ${to}: ${subject} - ${text}`);
  return { success: true };
};

module.exports = { sendEmail };
