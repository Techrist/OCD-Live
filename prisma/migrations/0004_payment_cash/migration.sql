-- Paiement en espèces au studio (PAY-07).
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'CASH';
