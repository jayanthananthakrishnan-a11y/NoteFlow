-- Migration: Create Payments Table
-- Description: Tracks all payment transactions for note purchases

-- Create ENUM type for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status payment_status NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_note ON payments(note_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(date);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- Add unique constraint to prevent duplicate purchases
-- A user can only have one completed purchase per note
CREATE UNIQUE INDEX unique_user_note_purchase 
ON payments(user_id, note_id) 
WHERE status = 'completed';

-- Add comments
COMMENT ON TABLE payments IS 'Tracks all payment transactions for note purchases';
COMMENT ON COLUMN payments.transaction_id IS 'External payment gateway transaction ID';
COMMENT ON COLUMN payments.metadata IS 'Additional payment information in JSON format';
