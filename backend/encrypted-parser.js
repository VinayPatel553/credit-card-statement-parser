const fs = require('fs');
const pdf = require('pdf-parse');

const parseEncryptedCreditCardPDF = async (filePath, password) => {
  try {
    console.log('Attempting to parse encrypted PDF with password...');
    
    const dataBuffer = fs.readFileSync(filePath);
    
    // Try with the provided password
    const pdfData = await pdf(dataBuffer, { 
      password: password,
      pagerender: renderPage,
      max: 0 // No page limit
    });
    
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    const text = pdfData.text.replace(/\s+/g, " ");
    console.log('Successfully decrypted PDF, text length:', text.length);

    // Extract data using your regex patterns
    const issuerMatch = text.match(/Issuer:\s*([A-Za-z\s]+?)(?:\s|$|\.)/i) || 
                       text.match(/Bank:\s*([A-Za-z\s]+?)(?:\s|$|\.)/i);
    
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
      card_last4: cardLast4Match ? cardLast4Match[1] : "—",
      billing_period: billingPeriodMatch ? billingPeriodMatch[1].trim() : "—",
      payment_due_date: dueDateMatch ? dueDateMatch[1].trim() : "—",
      total_due: totalDueMatch ? totalDueMatch[1].trim() : "—",
    };

    return result;

  } catch (error) {
    console.error('PDF parsing error:', error.message);
    
    // Check for password-related errors
    if (error.message.includes('password') || 
        error.message.includes('encrypted') ||
        error.message.includes('Password') ||
        error.message.includes('needs password') ||
        error.message.includes('XRef') && error.message.includes('password')) {
      throw new Error('Invalid password. Please try again.');
    }
    
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

// Helper function for page rendering
function renderPage(pageData) {
  return pageData.getTextContent().then(function(textContent) {
    let lastY, text = '';
    for (let item of textContent.items) {
      if (lastY == item.transform[5] || !lastY){
        text += item.str;
      }  
      else{
        text += '\n' + item.str;
      }    
      lastY = item.transform[5];
    }
    return text;
  });
}

module.exports = { parseEncryptedCreditCardPDF };