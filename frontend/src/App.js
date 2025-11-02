// // App.js
// import React, { useState } from 'react';
// import { Container, Alert, Button, Fade } from 'react-bootstrap';
// import './App.css';
// import axios from 'axios';
// import UploadForm from './components/UploadForm';
// import ResultCards from './components/ResultCard';
// import { motion } from 'framer-motion'; // Optional: npm install framer-motion

// function App() {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);

//   const handleUpload = async (file) => {
//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const res = await axios.post('http://localhost:5000/parse', formData, {
//         timeout: 60000,
//       });
//       setResult(res.data);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to parse PDF. Try another file.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setResult(null);
//     setError(null);
//   };

//   return (
//     <div className="app-wrapper min-vh-100">
//       {/* Hero */}
//       <header className="hero-section text-center text-light py-5">
//         <motion.h1
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           className="display-7 fw-bold"
//         >
//           Credit Card Statement Parser
//         </motion.h1>
//         <p className="lead">Extract key details in seconds</p>
//       </header>

//       <Container className="py-4">
//         <UploadForm onUpload={handleUpload} disabled={loading} />

//         <Fade in={loading || !!error || !!result}>
//           <div className="mt-4">
//             {loading && (
//               <div className="text-center py-5">
//                 <div className="spinner-border text-primary" role="status">
//                   <span className="visually-hidden">Parsing...</span>
//                 </div>
//                 <p className="mt-3 text-muted">Extracting data from PDF...</p>
//               </div>
//             )}

//             {error && (
//               <Alert variant="danger" dismissible onClose={() => setError(null)}>
//                 <strong>Error:</strong> {error}
//               </Alert>
//             )}

//             {result && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h4 className="text-primary fw-semibold mb-0">Parsed Summary</h4>
//                   <Button variant="outline-secondary" size="sm" onClick={reset}>
//                     Upload Another
//                   </Button>
//                 </div>
//                 <ResultCards data={result} />

//                 {result.ai_insights && (
//                   <Alert variant="light" className="mt-4 border-start border-primary border-4">
//                     <h5 className="text-primary">AI Insights</h5>
//                     <p className="mb-0">{result.ai_insights}</p>
//                   </Alert>
//                 )}
//               </motion.div>
//             )}
//           </div>
//         </Fade>
//       </Container>


//     </div>
//   );
// }

// export default App;
import React, { useState } from 'react';
import { Container, Alert, Button, Fade } from 'react-bootstrap';
import './App.css';
import axios from 'axios';
import UploadForm from './components/UploadForm';
import ResultCards from './components/ResultCard';
import PasswordModal from './components/PasswordModal';
import { motion } from 'framer-motion';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileId, setFileId] = useState(null);

  const uploadAndParse = async (file, password = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (password) {
      formData.append('password', password);
    }
    
    if (fileId) {
      formData.append('fileId', fileId);
    }

    try {
      const res = await axios.post('http://localhost:5000/parse', formData, {
        timeout: 60000,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(res.data);
      setShowPasswordModal(false);
      setCurrentFile(null);
      setFileId(null);
      setPasswordError(null);
      
    } catch (err) {
      if (err.response?.data?.error === 'PASSWORD_REQUIRED') {
        // Show password modal
        setFileId(err.response.data.fileId);
        setShowPasswordModal(true);
        setPasswordError(null);
      } else if (err.response?.data?.error === 'INCORRECT_PASSWORD') {
        // Show error in password modal
        setPasswordError(err.response.data.message);
      } else {
        // Other errors
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to parse PDF. Try another file.');
        setShowPasswordModal(false);
        setCurrentFile(null);
        setFileId(null);
      }
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentFile(file);
    setPasswordError(null);

    await uploadAndParse(file);
    setLoading(false);
  };

  const handlePasswordSubmit = async (password) => {
    setLoading(true);
    setPasswordError(null);
    
    await uploadAndParse(currentFile, password);
    setLoading(false);
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordError(null);
    setCurrentFile(null);
    setFileId(null);
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCurrentFile(null);
    setFileId(null);
    setPasswordError(null);
  };

  return (
    <div className="app-wrapper min-vh-100">
      {/* Hero */}
      <header className="hero-section text-center text-light py-5">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="display-7 fw-bold"
        >
          Credit Card Statement Parser
        </motion.h1>
        <p className="lead">Extract key details in seconds</p>
      </header>

      <Container className="py-4">
        <UploadForm onUpload={handleUpload} disabled={loading} />

        <Fade in={loading || !!error || !!result}>
          <div className="mt-4">
            {loading && !showPasswordModal && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Parsing...</span>
                </div>
                <p className="mt-3 text-muted">Extracting data from PDF...</p>
              </div>
            )}

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                <strong>Error:</strong> {error}
              </Alert>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="text-primary fw-semibold mb-0">Parsed Summary</h4>
                  <Button variant="outline-secondary" size="sm" onClick={reset}>
                    Upload Another
                  </Button>
                </div>
                <ResultCards data={result} />

                {result.ai_insights && (
                  <Alert variant="light" className="mt-4 border-start border-primary border-4">
                    <h5 className="text-primary">AI Insights</h5>
                    <p className="mb-0">{result.ai_insights}</p>
                  </Alert>
                )}
              </motion.div>
            )}
          </div>
        </Fade>
      </Container>

      {/* Password Modal */}
      <PasswordModal
        show={showPasswordModal}
        onHide={handlePasswordModalClose}
        onSubmit={handlePasswordSubmit}
        loading={loading}
        error={passwordError}
      />
    </div>
  );
}

export default App;