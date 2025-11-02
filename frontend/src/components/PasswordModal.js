import React, { useState } from 'react';
import { Modal, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import { Lock, Eye, EyeSlash } from 'react-bootstrap-icons';

export default function PasswordModal({ show, onHide, onSubmit, loading, error }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Lock className="text-warning" />
          Password Protected PDF
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <p className="text-muted mb-3">
            This PDF file is password protected. Please enter the password to continue.
          </p>
          
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Lock size={16} />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter PDF password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
                required
              />
              <Button 
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </Button>
            </InputGroup>
            <Form.Text className="text-muted">
              The password will not be stored and is only used to decrypt the PDF.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !password.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Unlocking...
              </>
            ) : (
              'Unlock & Parse'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}