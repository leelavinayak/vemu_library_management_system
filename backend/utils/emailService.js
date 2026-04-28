const nodemailer = require('nodemailer');
const path = require('path');

// Function to get a fresh transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Common Email Header
const emailHeader = `
  <div style="background-color: #f1f5f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: 800;">VEMU LIBRARY SYSTEM</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Excellence in Education</p>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
`;

// Common Email Footer
const emailFooter = `
      </div>
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #1e3a8a; font-size: 14px; font-weight: 700;">VEMU INSTITUTE OF TECHNOLOGY</p>
        <p style="margin: 5px 0 0; color: #64748b; font-size: 12px;">P.Kothakota, Chittoor, Andhra Pradesh - 517112</p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">&copy; ${new Date().getFullYear()} VEMU Library Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
`;

const sendWelcomeEmail = async (user) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not found in environment variables');
    return;
  }

  const transporter = getTransporter();
  const mailOptions = {
    from: `"VEMU Library Admin" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to VEMU Library Management System',
    html: `
      ${emailHeader}
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Welcome aboard, ${user.name}!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.7;">Your digital library account has been successfully created. We are thrilled to provide you with seamless access to our vast collection of academic resources.</p>
        
        <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #bae6fd;">
          <p style="margin: 0 0 15px 0; color: #0369a1; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Account Information</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-size: 14px;">Access Role:</td>
              <td style="padding: 5px 0; color: #0c4a6e; font-weight: 700;">${user.role.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-size: 14px;">Registered Email:</td>
              <td style="padding: 5px 0; color: #0c4a6e; font-weight: 700;">${user.email}</td>
            </tr>
          </table>
        </div>

        <p style="color: #475569; font-size: 16px; line-height: 1.7;">Our portal allows you to search books, check real-time availability, and manage your borrowing history from anywhere.</p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);">Access Your Portal</a>
        </div>
      ${emailFooter}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
  }
};

const sendOrderConfirmationEmail = async (user, book, transaction) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not found in environment variables');
    return;
  }

  const transporter = getTransporter();
  const mailOptions = {
    from: `"VEMU Library Services" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Book Issued: ${book.title} | VEMU Library`,
    html: `
      ${emailHeader}
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Book Issue Confirmation</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.7;">Hello ${user.name}, this is to confirm that you have successfully issued the following book from the VEMU Central Library.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Book Title:</td>
              <td style="padding: 8px 0; color: #1e3a8a; font-weight: 800; font-size: 16px;">${book.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Issue Date:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Expected Return:</td>
              <td style="padding: 8px 0; color: #dc2626; font-weight: 800; font-size: 16px;">${new Date(transaction.expectedReturnDate).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 20px; border-radius: 4px;">
          <p style="margin: 0; color: #9a3412; font-size: 14px; line-height: 1.5;">
            <strong>Reminder:</strong> Please ensure the book is returned on or before the expected date to maintain your library standing and avoid overdue charges.
          </p>
        </div>
      ${emailFooter}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully to:', user.email);
  } catch (error) {
    console.error('Error sending order confirmation email:', error.message);
  }
};

const sendReturnConfirmationEmail = async (user, book, transaction, finePDFPath = null) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not found in environment variables');
    return;
  }

  const transporter = getTransporter();
  const mailOptions = {
    from: `"VEMU Library Services" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Book Returned: ${book.title} | VEMU Library`,
    html: `
      ${emailHeader}
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Book Return Acknowledgment</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.7;">Hello ${user.name}, the library has successfully received and processed your returned book.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Book Title:</td>
              <td style="padding: 8px 0; color: #1e3a8a; font-weight: 800; font-size: 16px;">${book.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Return Date:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${new Date(transaction.returnDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Return Status:</td>
              <td style="padding: 8px 0;">
                ${transaction.fineAmount > 0 
                  ? '<span style="background-color: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px;">LATE RETURN</span>' 
                  : '<span style="background-color: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px;">ON TIME</span>'}
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 20px; border: 2px dashed #e2e8f0; border-radius: 12px;">
          <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">📄 OFFICIAL RECEIPT ATTACHED</p>
          <p style="margin: 5px 0 0; color: #94a3b8; font-size: 12px;">Your detailed return receipt is attached to this email as a PDF.</p>
        </div>

        ${transaction.fineAmount > 0 
          ? `
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; color: #991b1b; font-weight: 700; font-size: 15px;">Fine Payment Recorded</p>
              <p style="margin: 5px 0 0; color: #b91c1c; font-size: 14px;">An overdue fine of <strong>₹${transaction.fineAmount}</strong> has been processed and marked as <strong>PAID</strong> in the attached receipt.</p>
            </div>
            `
          : `
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; color: #166534; font-weight: 700; font-size: 15px;">Excellent Standing</p>
              <p style="margin: 5px 0 0; color: #15803d; font-size: 14px;">Thank you for your promptness. Your library record remains in excellent standing.</p>
            </div>
            `
        }
      ${emailFooter}
    `,
    attachments: finePDFPath ? [{ filename: path.basename(finePDFPath), path: finePDFPath }] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Return confirmation email sent successfully to:', user.email);
  } catch (error) {
    console.error('Error sending return confirmation email:', error.message);
  }
};

const sendOTPEmail = async (user, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not found');
    return;
  }

  const transporter = getTransporter();
  const mailOptions = {
    from: `"VEMU Security" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `${otp} is your VEMU Library verification code`,
    html: `
      ${emailHeader}
        <div style="text-align: center;">
          <div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
            Security Verification
          </div>
          <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 24px; font-weight: 800;">Password Reset Request</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hello ${user.name},<br>
            We received a request to reset your VEMU Library account password. Please use the verification code below to continue.
          </p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px 20px; margin-bottom: 30px; position: relative;">
            <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Your One-Time Password</p>
            <div style="font-size: 48px; font-weight: 800; color: #1e3a8a; letter-spacing: 8px; font-family: 'Inter', Arial, sans-serif;">
              ${otp}
            </div>
          </div>

          <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; border-radius: 8px; text-align: left; margin-bottom: 30px;">
            <p style="margin: 0; color: #9a3412; font-size: 13px; line-height: 1.5;">
              <strong>Security Tip:</strong> This code is valid for 10 minutes only. Never share this code with anyone. Our library staff will never ask for your password or OTP.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            If you didn't request this change, you can safely ignore this email. Your account remains secure.
          </p>
        </div>
      ${emailFooter}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', user.email);
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendReturnConfirmationEmail,
  sendOTPEmail
};
