const axios = require('axios');

/**
 * Sends an OTP SMS using Fast2SMS API
 * @param {Object} user - The user object containing mobileNumber
 * @param {string} otp - The 6-digit OTP code
 */
const sendOTPSMS = async (user, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  
  if (!apiKey) {
    console.warn('[SMS Service] FAST2SMS_API_KEY not found in .env. Skipping SMS.');
    return;
  }

  if (!user.mobileNumber) {
    console.warn(`[SMS Service] No mobile number found for user ${user.email}. Skipping SMS.`);
    return;
  }

  try {
    // Fast2SMS Bulk V2 API (OTP Route)
    // Note: Numbers should be comma separated if multiple
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      variables_values: otp,
      route: 'otp',
      numbers: user.mobileNumber
    }, {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.return) {
      console.log(`[SMS Service] OTP sent successfully to ${user.mobileNumber}`);
    } else {
      console.error(`[SMS Service] Failed to send SMS: ${response.data.message}`);
    }
  } catch (error) {
    console.error(`[SMS Service] Error calling Fast2SMS API: ${error.message}`);
    if (error.response) {
      console.error('[SMS Service] Response data:', error.response.data);
    }
  }
};

module.exports = { sendOTPSMS };
