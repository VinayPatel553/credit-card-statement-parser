// components/UploadForm.js
import React, { useRef, useState } from 'react';
import { Form, Button, Alert, Stack } from 'react-bootstrap';
import { CloudUpload, FileEarmarkPdf } from 'react-bootstrap-icons';

export default function UploadForm({ onUpload, disabled }) {
  const fileRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      alert('Please upload a PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.');
      return;
    }

    setSelectedFile(file);
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div
      className={`upload-zone p-4 border-2 border-dashed rounded-3 text-center ${
        dragActive ? 'border-primary bg-light' : 'border-secondary'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <Form onSubmit={(e) => e.preventDefault()}>
        <Stack gap={3}>
          <CloudUpload size={48} className="text-primary mx-auto" />
          <div>
            <Form.Control
              type="file"
              accept="application/pdf"
              ref={fileRef}
              onChange={handleChange}
              className="d-none"
              disabled={disabled}
            />
            <Button
              variant="outline-primary"
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
            >
              Choose PDF File
            </Button>
            <span className="text-muted mx-2">or drag & drop</span>
          </div>

          {selectedFile && (
            <Alert variant="info" className="py-2 d-flex align-items-center gap-2">
              <FileEarmarkPdf />
              <span className="small">
                <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </Alert>
          )}

          <small className="text-muted">
            Supported: HDFC, SBI, ICICI, Axis, BOB statements (max 5MB)
          </small>
        </Stack>
      </Form>
    </div>
  );
}