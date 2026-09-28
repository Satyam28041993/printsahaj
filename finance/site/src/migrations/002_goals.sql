-- Goals, including the emergency fund.
-- A savings goal's current amount is the sum of its entries (money put in
-- minus money taken out). A loan-closure goal follows a loan instead: its
-- progress is how far the loan has come down since the goal was made.
-- Loan planning never reads or spends goal money.

CREATE TABLE goals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  visibility ENUM('private','family') NOT NULL,
  name VARCHAR(80) NOT NULL,
  kind VARCHAR(20) NOT NULL,
  target_paise BIGINT UNSIGNED NOT NULL,
  target_min_paise BIGINT UNSIGNED NULL,
  target_date DATE NULL,
  monthly_paise BIGINT UNSIGNED NULL,
  loan_id INT UNSIGNED NULL,
  start_paise BIGINT UNSIGNED NULL,
  status ENUM('active','done') NOT NULL DEFAULT 'active',
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_goals_family (family_id, status),
  CONSTRAINT fk_goals_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_goals_loan FOREIGN KEY (loan_id) REFERENCES loans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE goal_entries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  goal_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  direction ENUM('in','out') NOT NULL,
  amount_paise BIGINT UNSIGNED NOT NULL,
  entry_on DATE NOT NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_goal_entries_goal (goal_id, entry_on),
  KEY ix_goal_entries_family (family_id, entry_on),
  CONSTRAINT fk_goal_entries_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_goal_entries_goal FOREIGN KEY (goal_id) REFERENCES goals(id),
  CONSTRAINT fk_goal_entries_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
