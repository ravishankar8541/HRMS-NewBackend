const pdf = require('html-pdf'); // keep (not used but you said don't remove)
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer'); // ✅ added

const generatePDF = async (data) => {
  const templatePath = path.join(__dirname, '../templates/offerLetter.ejs');
  
  // 1. Load Logo and convert to Base64
  let logoBase64 = "";
  try {
    const logoPath = path.join(__dirname, '../assets/blackLogo.png');
    const bitmap = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
  } catch (err) {
    console.error("LOGO ERROR: Ensure logo is at backend/assets/blackLogo.png");
  }

  const html = await ejs.renderFile(templatePath, {
    logo: logoBase64,
    offerId: data.offerId,
    employeeName: data.employeeName,
    fathersName: data.fathersName, 
    address: data.address,
    phoneNumber: data.phoneNumber, 
    emailId: data.emailId,         
    position: data.position,
    salary: data.salary,
    hrName: data.hrName,
    formattedSalary: Number(data.salary).toLocaleString('en-IN'),
    formattedJoiningDate: new Date(data.joiningDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }),
    currentDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
  });

  const options = { 
    format: 'A4', 
    border: { top: '0px', right: '20mm', bottom: '20mm', left: '20mm' },
    type: "pdf",
    quality: "100"
  };

  // ✅ REPLACED ENGINE (html-pdf → puppeteer)
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // required for Render
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf({
      format: options.format,
      printBackground: true,
      margin: options.border
    });

    await browser.close();

    return buffer;

  } catch (err) {
    console.error("PDF ERROR:", err);
    throw err;
  }
};

module.exports = generatePDF;