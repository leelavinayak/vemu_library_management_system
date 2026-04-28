const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateFinePDF = (transaction, user, book) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 0,
        info: {
          Title: 'Library Return Receipt - VEMU IT',
          Author: 'VEMU Institute of Technology'
        }
      });

      const fileName = `receipt_${transaction._id}.pdf`;
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadsDir = isProduction ? '/tmp' : path.join(__dirname, '..', 'uploads');
      const filePath = path.join(uploadsDir, fileName);

      // Ensure uploads directory exists (mostly for local dev)
      if (!isProduction && !fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- BRAND COLORS ---
      const NAVY = '#1e3a8a';
      const SKY = '#3b82f6';
      const SLATE = '#64748b';
      const BORDER = '#e2e8f0';
      const SUCCESS = '#16a34a';
      const ERROR = '#dc2626';
      const BG_SOFT = '#f8fafc';

      // --- BACKGROUND ELEMENTS ---
      // Vertical Sidebar Accent
      doc.rect(0, 0, 15, 841.89).fill(NAVY);

      // --- HEADER ---
      const logoPath = path.join(__dirname, '..', 'assets', 'vemu_logo_1.png');
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 50, 40, { height: 65 });
        } catch (e) { console.error(e); }
      }

      doc.fillColor(NAVY).fontSize(22).font('Helvetica-Bold').text('VEMU INSTITUTE OF TECHNOLOGY', 135, 45);
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('Approved by AICTE, New Delhi & Affiliated to JNTUA, Ananthapuramu', 135, 72);
      doc.fillColor(SKY).fontSize(11).font('Helvetica-Bold').text('CENTRAL LIBRARY | RETURN RECEIPT', 135, 87);

      // Divider
      doc.moveTo(50, 120).lineTo(545, 120).lineWidth(1).strokeColor(BORDER).stroke();

      // --- RECEIPT METADATA ---
      doc.fillColor(SLATE).fontSize(8).font('Helvetica').text(`TRANSACTION ID: ${transaction._id}`, 50, 135);
      doc.text(`ISSUED ON: ${new Date().toLocaleString()}`, 350, 135, { align: 'right', width: 195 });

      // --- MAIN CONTENT (TWO COLUMN STYLE) ---
      let currentY = 170;

      // Section Titles
      doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('BORROWER DETAILS', 50, currentY);
      doc.text('BOOK INFORMATION', 300, currentY);
      doc.moveTo(50, currentY + 15).lineTo(250, currentY + 15).lineWidth(2).strokeColor(SKY).stroke();
      doc.moveTo(300, currentY + 15).lineTo(545, currentY + 15).lineWidth(2).strokeColor(SKY).stroke();

      currentY += 30;

      // Column 1: Borrower
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('NAME', 50, currentY);
      doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text(user.name, 50, currentY + 12);
      
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('EMAIL', 50, currentY + 40);
      doc.fillColor(NAVY).fontSize(10).font('Helvetica').text(user.email, 50, currentY + 52);
      
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('ROLE / DEPARTMENT', 50, currentY + 80);
      doc.fillColor(NAVY).fontSize(10).font('Helvetica-Bold').text(user.role.toUpperCase(), 50, currentY + 92);

      // Column 2: Book
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('BOOK TITLE', 300, currentY);
      doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text(book.title, 300, currentY + 12, { width: 245 });
      
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('AUTHOR', 300, currentY + 55);
      doc.fillColor(NAVY).fontSize(10).font('Helvetica').text(book.author || 'N/A', 300, currentY + 67);
      
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('EXPECTED RETURN', 300, currentY + 95);
      doc.fillColor(ERROR).fontSize(11).font('Helvetica-Bold').text(new Date(transaction.expectedReturnDate).toLocaleDateString(), 300, currentY + 107);

      currentY += 140;

      // --- STATUS CARD ---
      doc.rect(50, currentY, 495, 80).fill(BG_SOFT);
      doc.fillColor(NAVY).fontSize(10).font('Helvetica-Bold').text('RETURN ANALYSIS', 65, currentY + 15);
      
      const isLate = transaction.fineAmount > 0;
      
      // Status Badge
      doc.rect(400, currentY + 25, 130, 30).fill(isLate ? ERROR : SUCCESS);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(isLate ? 'LATE RETURN' : 'ON TIME', 400, currentY + 36, { align: 'center', width: 130 });

      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('Actual Return Date:', 65, currentY + 40);
      doc.fillColor(NAVY).font('Helvetica-Bold').text(new Date(transaction.returnDate).toLocaleDateString(), 160, currentY + 40);
      
      doc.fillColor(SLATE).text('Days Overdue:', 65, currentY + 55);
      const days = isLate ? transaction.fineAmount : 0;
      doc.fillColor(isLate ? ERROR : SUCCESS).font('Helvetica-Bold').text(`${days} Days`, 160, currentY + 55);

      currentY += 100;

      // --- FINANCIAL SUMMARY ---
      doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('FINANCIAL SUMMARY', 50, currentY);
      currentY += 20;

      // Table Header
      doc.rect(50, currentY, 495, 25).fill(NAVY);
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('DESCRIPTION', 65, currentY + 8);
      doc.text('TOTAL (INR)', 430, currentY + 8, { align: 'right', width: 100 });

      // Row: Fine
      doc.fillColor(NAVY).fontSize(10).font('Helvetica').text('Overdue Fine Charges', 65, currentY + 40);
      doc.font('Helvetica-Bold').text(`₹ ${transaction.fineAmount || 0}.00`, 430, currentY + 40, { align: 'right', width: 100 });
      doc.moveTo(50, currentY + 60).lineTo(545, currentY + 60).lineWidth(0.5).strokeColor(BORDER).stroke();

      // Row: Grand Total
      doc.rect(50, currentY + 60, 495, 35).fill('#f1f5f9');
      doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text('FINAL SETTLEMENT STATUS', 65, currentY + 72);
      doc.fillColor(SUCCESS).fontSize(12).text(isLate ? 'FINE PAID' : 'NO DUES', 430, currentY + 72, { align: 'right', width: 100 });

      // --- AUTHORIZATION ---
      currentY = 660;
      doc.moveTo(350, currentY + 40).lineTo(545, currentY + 40).lineWidth(0.5).strokeColor(SLATE).stroke();
      doc.fillColor(SLATE).fontSize(8).font('Helvetica').text('Authorized Librarian Signature', 350, currentY + 45, { align: 'center', width: 195 });
      
      // Stamp
      doc.circle(80, currentY + 30, 35).lineWidth(1).strokeColor(BORDER).stroke();
      doc.fontSize(6).fillColor(BORDER).text('VEMU IT\nLIBRARY DEPT\nOFFICIAL SEAL', 60, currentY + 22, { align: 'center', width: 40 });

      // --- FOOTER ---
      const footerY = 770;
      doc.rect(0, footerY, 595.28, 71.89).fill(BG_SOFT);
      doc.fillColor(NAVY).fontSize(9).font('Helvetica-Bold').text('VEMU INSTITUTE OF TECHNOLOGY', 50, footerY + 15, { align: 'center', width: 495 });
      doc.fillColor(SLATE).fontSize(8).font('Helvetica').text('P.Kothakota, Chittoor, Andhra Pradesh - 517112', 50, footerY + 28, { align: 'center', width: 495 });
      doc.text('library@vemu.org  |  www.vemu.org  |  +91 88866 61150', 50, footerY + 40, { align: 'center', width: 495 });
      
      doc.end();

      stream.on('finish', () => { resolve(filePath); });
      stream.on('error', (err) => { reject(err); });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateFinePDF };
