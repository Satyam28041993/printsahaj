-- Explicit "this month's EMI was NOT paid" mark — distinct from simply not
-- having recorded a payment yet. One flag per loan per month; recording a
-- real payment for that month clears it automatically. Unmarking deletes
-- the row outright (it is a correction, not a financial record to keep).

CREATE TABLE loan_skips (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  loan_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  month CHAR(7) NOT NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_loan_skip_month (loan_id, month),
  KEY ix_loan_skips_family (family_id, month),
  CONSTRAINT fk_loan_skips_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_loan_skips_loan FOREIGN KEY (loan_id) REFERENCES loans(id),
  CONSTRAINT fk_loan_skips_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
