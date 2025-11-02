// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const fs = require('fs'); // Add this import
// const { parseCreditCardPDF } = require('./parser');

// const app = express();
// app.use(cors());

// const upload = multer({
//   dest: "uploads/",
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files allowed'));
//     }
//   },
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB
// });

// app.post("/parse", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const result = await parseCreditCardPDF(req.file.path);
//     console.log("Parsed Result:", result);

//     // Clean up the uploaded file after processing
//     fs.unlinkSync(req.file.path);
//     console.log("Cleaned up uploaded file");

//     res.status(200).json(result);
//   } catch (err) {
//     console.error("Error parsing PDF:", err.message);
    
//     // Clean up uploaded file even on error
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//       console.log("Cleaned up uploaded file after error");
//     }
    
//     res.status(500).json({ error: "Failed to parse PDF" });
//   }
// });

// app.listen(5000, () => console.log("Server running on http://localhost:5000"));

// index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { parseCreditCardPDF } = require('./parser');

const app = express();
app.use(cors());
app.use(express.json()); // Add this to parse JSON bodies

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Store uploaded files temporarily with a session ID
const uploadedFiles = new Map();

app.post("/parse", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const password = req.body.password || null;
    const fileId = req.body.fileId || null;

    // If fileId provided, use the existing file path
    let filePath = req.file.path;
    if (fileId && uploadedFiles.has(fileId)) {
      filePath = uploadedFiles.get(fileId);
      // Clean up the duplicate upload
      fs.unlinkSync(req.file.path);
    } else {
      // Store file path with a unique ID for password retry
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      uploadedFiles.set(uniqueId, filePath);
      
      // Send fileId back if password is required
      setTimeout(() => uploadedFiles.delete(uniqueId), 5 * 60 * 1000); // Clean up after 5 minutes
    }

    console.log('Parsing file with password:', password ? 'Yes' : 'No');
    const result = await parseCreditCardPDF(filePath, password);
    console.log("Parsed Result:", result);

    // Clean up the uploaded file after successful processing
    fs.unlinkSync(filePath);
    if (fileId) uploadedFiles.delete(fileId);
    console.log("Cleaned up uploaded file");

    res.status(200).json(result);
    
  } catch (err) {
    console.error("Error parsing PDF:", err.message, err.code);
    
    // Handle password-related errors
    if (err.code === 'PASSWORD_REQUIRED') {
      // Store file temporarily and send fileId
      const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      uploadedFiles.set(fileId, req.file.path);
      
      // Clean up after 5 minutes
      setTimeout(() => {
        if (uploadedFiles.has(fileId)) {
          const path = uploadedFiles.get(fileId);
          if (fs.existsSync(path)) fs.unlinkSync(path);
          uploadedFiles.delete(fileId);
        }
      }, 5 * 60 * 1000);
      
      return res.status(401).json({ 
        error: 'PASSWORD_REQUIRED',
        message: 'This PDF is password protected. Please enter the password.',
        fileId: fileId
      });
    }
    
    if (err.code === 'INCORRECT_PASSWORD') {
      return res.status(401).json({ 
        error: 'INCORRECT_PASSWORD',
        message: 'The password you entered is incorrect. Please try again.'
      });
    }
    
    // Clean up uploaded file on other errors
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log("Cleaned up uploaded file after error");
    }
    
    res.status(500).json({ 
      error: err.message || "Failed to parse PDF"
    });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

