// const fs = require('fs');
// const pdf = require('pdf-parse');

// const parseCreditCardPDF = async (filePath) => {
//   try {
//     console.log('Starting PDF parsing for file:', filePath);
    
//     // Check if file exists and is readable
//     if (!fs.existsSync(filePath)) {
//       throw new Error('File not found');
//     }

//     const stats = fs.statSync(filePath);
//     console.log('File size:', stats.size, 'bytes');
    
//     if (stats.size === 0) {
//       throw new Error('File is empty');
//     }

//     const dataBuffer = fs.readFileSync(filePath);
    
//     // Additional PDF validation
//     if (dataBuffer.length < 10) {
//       throw new Error('File too small to be a valid PDF');
//     }

//     // Check PDF header (first 4 bytes should be "%PDF")
//     const header = dataBuffer.toString('utf8', 0, 4);
//     if (header !== '%PDF') {
//       console.log('File header:', header);
//       throw new Error('Not a valid PDF file');
//     }

//     console.log('Valid PDF header detected, proceeding with parsing...');

//     const pdfData = await pdf(dataBuffer);
    
//     console.log('PDF parsed successfully, text length:', pdfData.text.length);
    
//     if (!pdfData.text || pdfData.text.trim().length === 0) {
//       throw new Error('No text content found in PDF - may be scanned or image-based');
//     }

//     const text = pdfData.text.replace(/\s+/g, " "); // normalize whitespace
//     console.log('Normalized text sample:', text.substring(0, 200));

//     // Enhanced regex patterns with more flexibility
//     const issuerMatch = text.match(/Issuer:\s*([A-Za-z\s]+?)(?:\s|$|\.)/i) || 
//                        text.match(/Bank:\s*([A-Za-z\s]+?)(?:\s|$|\.)/i);
    
//     const cardLast4Match = text.match(/XXXX-XXXX-XXXX-(\d{4})/) ||
//                           text.match(/\*{4}-\*{4}-\*{4}-(\d{4})/) ||
//                           text.match(/Card\s*[Nn]o\.?\s*[Xx*]{12}(\d{4})/i);
    
//     const billingPeriodMatch = text.match(/Billing\s*Period:\s*([\dA-Za-z\s\-]+?)(?=\s*Payment\s*Due\s*Date)/i) ||
//                               text.match(/Statement\s*Period:\s*([\dA-Za-z\s\-]+?)(?=\s*Due\s*Date)/i);
    
//     const dueDateMatch = text.match(/Payment\s*Due\s*Date:\s*([\dA-Za-z\s]+?)(?=\s*Total\s*Amount\s*Due)/i) ||
//                         text.match(/Due\s*Date:\s*([\dA-Za-z\s]+?)(?=\s*Total\s*Due)/i);
    
//     const totalDueMatch = text.match(/Total\s*Amount\s*Due:\s*([Rs.\d,.,\s]+?)(?=\s|$)/i) ||
//                          text.match(/Total\s*Due:\s*([Rs.\d,.,\s]+?)(?=\s|$)/i) ||
//                          text.match(/Amount\s*Due:\s*([Rs.\d,.,\s]+?)(?=\s|$)/i);

//     const result = {
//       issuer: issuerMatch ? issuerMatch[1].trim() : "—",
//       card_last4: cardLast4Match ? cardLast4Match[1] : "—",
//       billing_period: billingPeriodMatch ? billingPeriodMatch[1].trim() : "—",
//       payment_due_date: dueDateMatch ? dueDateMatch[1].trim() : "—",
//       total_due: totalDueMatch ? totalDueMatch[1].trim() : "—",
//     };

//     console.log('Parsing result:', result);
//     return result;

//   } catch (error) {
//     console.error('PDF parsing error details:');
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
    
//     // Check if it's a specific PDF parsing error
//     if (error.message.includes('XRef') || error.message.includes('bad')) {
//       throw new Error('PDF file is corrupted or incompatible. Please try a different PDF file.');
//     }
    
//     throw new Error(`Failed to parse PDF: ${error.message}`);
//   }
// };

// module.exports = { parseCreditCardPDF };

// parser.js
const fs = require('fs');
const pdf = require('pdf-parse');
const { execSync } = require('child_process');
const path = require('path');

const isPasswordProtected = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Check for encryption dictionary in PDF
    const pdfContent = dataBuffer.toString('latin1');
    const hasEncrypt = pdfContent.includes('/Encrypt');
    
    if (hasEncrypt) {
      return true;
    }

    // Try to parse without password
    try {
      await pdf(dataBuffer);
      return false;
    } catch (error) {
      if (error.message.includes('password') || 
          error.message.includes('encrypted') ||
          error.message.includes('Encrypted')) {
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error checking password protection:', error);
    return false;
  }
};

const unlockPDF = (filePath, password, outputPath) => {
  try {
    // Using qpdf to decrypt PDF
    const command = `qpdf --password="${password}" --decrypt "${filePath}" "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('Failed to unlock PDF:', error.message);
    return false;
  }
};

const parseCreditCardPDF = async (filePath, password = null) => {
  try {
    console.log('Starting PDF parsing for file:', filePath);
    
    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const stats = fs.statSync(filePath);
    console.log('File size:', stats.size, 'bytes');
    
    if (stats.size === 0) {
      throw new Error('File is empty');
    }

    let dataBuffer = fs.readFileSync(filePath);
    
    // Additional PDF validation
    if (dataBuffer.length < 10) {
      throw new Error('File too small to be a valid PDF');
    }

    // Check PDF header (first 4 bytes should be "%PDF")
    const header = dataBuffer.toString('utf8', 0, 4);
    if (header !== '%PDF') {
      console.log('File header:', header);
      throw new Error('Not a valid PDF file');
    }

    console.log('Valid PDF header detected, proceeding with parsing...');

    // Check if password protected
    const isProtected = await isPasswordProtected(filePath);
    
    if (isProtected && !password) {
      const error = new Error('PDF is password protected');
      error.code = 'PASSWORD_REQUIRED';
      throw error;
    }

    // If password provided, try to unlock
    if (isProtected && password) {
      const unlockedPath = filePath + '_unlocked.pdf';
      const unlocked = unlockPDF(filePath, password, unlockedPath);
      
      if (!unlocked) {
        const error = new Error('Incorrect password');
        error.code = 'INCORRECT_PASSWORD';
        throw error;
      }
      
      // Read unlocked PDF
      dataBuffer = fs.readFileSync(unlockedPath);
      
      // Clean up unlocked file
      fs.unlinkSync(unlockedPath);
      console.log('PDF unlocked successfully');
    }

    const pdfData = await pdf(dataBuffer);
    
    console.log('PDF parsed successfully, text length:', pdfData.text.length);
    
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('No text content found in PDF - may be scanned or image-based');
    }

    const text = pdfData.text.replace(/\s+/g, " "); // normalize whitespace
    console.log('Normalized text sample:', text.substring(0, 200));

    // Enhanced regex patterns with more flexibility
    // Replace the regex patterns section with:
    const issuerMatch = text.match(/Issuer:\s*([A-Za-z\s]+?)(?:\s|$|\.)/i) || 
                      text.match(/Bank:\s*([A-Za-z\s]+?)(?:\s|$|\.)/i);

    const cardTypeMatch = text.match(/Card:\s*[A-Za-z\s]*\s*(Platinum|Gold|Silver|Titanium|Signature|Classic|Premium|Rewards|Cashback|Business|Corporate)(?:\s|$|\.|\()/i) ||
                        text.match(/\b(Platinum|Gold|Silver|Titanium|Signature|Classic|Premium|Rewards|Cashback|Business|Corporate)\s*Card/i) ||
                        text.match(/Card\s*Type:\s*([A-Za-z\s]+?)(?:\s|$|\.)/i);

    const cardLast4Match = text.match(/XXXX-XXXX-XXXX-(\d{4})/) ||
                          text.match(/\*{4}-\*{4}-\*{4}-(\d{4})/) ||
                          text.match(/Card\s*[Nn]o\.?\s*[Xx*]{12}(\d{4})/i);

    const billingPeriodMatch = text.match(/Billing\s*Period:\s*([\dA-Za-z\s\-]+?)(?=\s*Payment\s*Due\s*Date)/i) ||
                              text.match(/Statement\s*Period:\s*([\dA-Za-z\s\-]+?)(?=\s*Due\s*Date)/i);

    const dueDateMatch = text.match(/Payment\s*Due\s*Date:\s*([\dA-Za-z\s]+?)(?=\s*Total\s*Amount\s*Due)/i) ||
                        text.match(/Due\s*Date:\s*([\dA-Za-z\s]+?)(?=\s*Total\s*Due)/i);

    const totalDueMatch = text.match(/Total\s*Amount\s*Due:\s*([Rs.\d,.,\s]+?)(?=\s|$)/i) ||
                        text.match(/Total\s*Due:\s*([Rs.\d,.,\s]+?)(?=\s|$)/i) ||
                        text.match(/Amount\s*Due:\s*([Rs.\d,.,\s]+?)(?=\s|$)/i);

    const result = {
      issuer: issuerMatch ? issuerMatch[1].trim() : "—",
      card_type: cardTypeMatch ? cardTypeMatch[1].trim() : "—",
      card_last4: cardLast4Match ? cardLast4Match[1] : "—",
      billing_period: billingPeriodMatch ? billingPeriodMatch[1].trim() : "—",
      payment_due_date: dueDateMatch ? dueDateMatch[1].trim() : "—",
      total_due: totalDueMatch ? totalDueMatch[1].trim() : "—",
    };

    console.log('Parsing result:', result);
    return result;

  } catch (error) {
    console.error('PDF parsing error details:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Re-throw with code intact
    if (error.code === 'PASSWORD_REQUIRED' || error.code === 'INCORRECT_PASSWORD') {
      throw error;
    }
    
    // Check if it's a specific PDF parsing error
    if (error.message.includes('XRef') || error.message.includes('bad')) {
      throw new Error('PDF file is corrupted or incompatible. Please try a different PDF file.');
    }
    
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

module.exports = { parseCreditCardPDF, isPasswordProtected };