-- Family Finance: first schema.
-- Money is stored as whole paise (BIGINT) so no sum or split is ever done in
-- floating point. Interest rates are DECIMAL(7,4) percent per year.
-- Every financial row carries family_id, user_id, visibility, timestamps and
-- deleted_at: rows are soft-deleted, never removed.

CREATE TABLE families (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  name VARCHAR(60) NOT NULL,
  username VARCHAR(40) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','member') NOT NULL DEFAULT 'member',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  last_login_at DATETIME NULL,
  UNIQUE KEY uq_users_username (username),
  CONSTRAINT fk_users_family FOREIGN KEY (family_id) REFERENCES families(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  data MEDIUMBLOB NOT NULL,
  last_activity INT UNSIGNED NOT NULL,
  KEY ix_sessions_activity (last_activity),
  KEY ix_sessions_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE login_attempts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(40) NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  success TINYINT(1) NOT NULL,
  attempted_at DATETIME NOT NULL,
  KEY ix_attempts_user (username, attempted_at),
  KEY ix_attempts_ip (ip_hash, attempted_at)
) ENGINE=InnoDB;

CREATE TABLE income (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  visibility ENUM('private','family') NOT NULL,
  income_type VARCHAR(20) NOT NULL,
  stability ENUM('fixed','variable') NOT NULL,
  amount_paise BIGINT UNSIGNED NOT NULL,
  received_on DATE NOT NULL,
  is_recurring TINYINT(1) NOT NULL DEFAULT 0,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_income_family_date (family_id, received_on),
  CONSTRAINT fk_income_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_income_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- What each person puts into the family pool, separate from what they earn.
CREATE TABLE contributions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  amount_paise BIGINT UNSIGNED NOT NULL,
  effective_from DATE NOT NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_contrib_user (user_id, effective_from),
  CONSTRAINT fk_contrib_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_contrib_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  visibility ENUM('private','family') NOT NULL,
  category VARCHAR(30) NOT NULL,
  amount_paise BIGINT UNSIGNED NOT NULL,
  spent_on DATE NOT NULL,
  is_recurring TINYINT(1) NOT NULL DEFAULT 0,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_expenses_family_date (family_id, spent_on),
  CONSTRAINT fk_expenses_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- repayment_type decides how a payment is read:
--   emi           amortising; principal and interest both paid monthly
--   interest_only only interest is paid; principal moves only on an explicit principal payment
--   card          revolving; minimum due is not full repayment
-- remaining_months is a reading taken on as_of_date; the app counts down from it.
CREATE TABLE loans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  visibility ENUM('private','family') NOT NULL,
  name VARCHAR(80) NOT NULL,
  loan_type VARCHAR(20) NOT NULL,
  repayment_type ENUM('emi','interest_only','card') NOT NULL,
  original_principal_paise BIGINT UNSIGNED NULL,
  outstanding_paise BIGINT UNSIGNED NOT NULL,
  interest_rate DECIMAL(7,4) NULL,
  monthly_payment_paise BIGINT UNSIGNED NULL,
  min_due_paise BIGINT UNSIGNED NULL,
  due_day TINYINT UNSIGNED NULL,
  start_date DATE NULL,
  tenure_months SMALLINT UNSIGNED NULL,
  remaining_months SMALLINT UNSIGNED NULL,
  as_of_date DATE NOT NULL,
  status ENUM('active','closed') NOT NULL DEFAULT 'active',
  closed_on DATE NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_loans_family (family_id, status),
  CONSTRAINT fk_loans_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_loans_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A payment always records principal, interest and fees apart. Only the
-- principal part reduces the loan's outstanding.
CREATE TABLE loan_payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  loan_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  paid_on DATE NOT NULL,
  principal_paise BIGINT UNSIGNED NOT NULL DEFAULT 0,
  interest_paise BIGINT UNSIGNED NOT NULL DEFAULT 0,
  fee_paise BIGINT UNSIGNED NOT NULL DEFAULT 0,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_payments_loan (loan_id, paid_on),
  KEY ix_payments_family (family_id, paid_on),
  CONSTRAINT fk_payments_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_payments_loan FOREIGN KEY (loan_id) REFERENCES loans(id),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  action VARCHAR(20) NOT NULL,
  entity VARCHAR(30) NOT NULL,
  entity_id INT UNSIGNED NULL,
  changes TEXT NULL,
  at DATETIME NOT NULL,
  KEY ix_audit_family (family_id, at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
