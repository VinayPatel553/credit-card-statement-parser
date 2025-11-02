// In ResultCard.js - Add skeleton loading and better formatting
import React from 'react';
import { Card, Badge, Stack, Placeholder } from 'react-bootstrap';
import { CheckCircleFill, XCircleFill, CreditCard, Bank, Calendar, Clock, CurrencyRupee, Award } from 'react-bootstrap-icons';

const formatCurrency = (value) => {
  if (!value || value === '—') return '—';
  
  // Handle Rs. prefix if present
  const cleanValue = value.replace(/^Rs\.?\s*/, '');
  const num = parseFloat(cleanValue.replace(/,/g, ''));
  
  return isNaN(num) ? value : new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

// Icon mapping for different fields
const fieldIcons = {
  'Issuer': Bank,
  'Card Type': Award,
  'Card Ending With': CreditCard,
  'Billing Period': Calendar,
  'Payment Due Date': Clock,
  'Total Amount Due': CurrencyRupee,
};


export default function ResultCards({ data, loading = false }) {
  const entries = [
    { label: 'Issuer', value: data?.issuer },
    { label: 'Card Type', value: data?.card_type },
    { label: 'Card Ending With', value: data?.card_last4 },
    { label: 'Billing Period', value: data?.billing_period },
    { label: 'Payment Due Date', value: data?.payment_due_date },
    { label: 'Total Amount Due', value: formatCurrency(data?.total_due) },
  ];

  if (loading) {
    return (
      <div className="row g-3">
        {entries.map((e, index) => (
          <div className="col-md-4 col-sm-6" key={index}>
            <Card className="h-100 shadow-sm border-0 result-card">
              <Card.Body className="d-flex flex-column">
                <Placeholder as={Card.Title} animation="wave">
                  <Placeholder xs={6} />
                </Placeholder>
                <Stack direction="horizontal" gap={2} className="align-items-center mt-auto">
                  <Placeholder animation="wave">
                    <Placeholder xs={3} />
                  </Placeholder>
                  <Placeholder animation="wave" className="flex-grow-1">
                    <Placeholder xs={12} style={{ height: '38px' }} />
                  </Placeholder>
                </Stack>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="row g-3">
      {entries.map((e) => {
        const isFound = e.value && e.value !== '—';
        const FieldIcon = fieldIcons[e.label];
        
        return (
          <div className="col-md-4 col-sm-6" key={e.label}>
            <Card className="h-100 shadow-sm border-0 result-card">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-muted small text-uppercase fw-semibold mb-2 d-flex align-items-center gap-1">
                  <FieldIcon size={14} />
                  {e.label}
                </Card.Title>
                <Stack direction="horizontal" gap={2} className="align-items-center mt-auto">
                  {isFound ? (
                    <CheckCircleFill className="text-success flex-shrink-0" size={18} />
                  ) : (
                    <XCircleFill className="text-danger flex-shrink-0" size={18} />
                  )}
                  <Badge
                    bg={isFound ? 'primary' : 'secondary'}
                    className="fs-6 px-3 py-2 flex-grow-1 text-start d-flex align-items-center"
                    style={{ minHeight: '38px' }}
                  >
                    {e.value || 'Not found'}
                  </Badge>
                </Stack>
              </Card.Body>
            </Card>
          </div>
        );
      })}
    </div>
  );
}