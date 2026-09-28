-- Category budgets — a target per expense category, same shape as
-- contributions (effective_from, so a change never rewrites past months).

CREATE TABLE category_budgets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  category VARCHAR(30) NOT NULL,
  amount_paise BIGINT UNSIGNED NOT NULL,
  effective_from DATE NOT NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_budgets_family (family_id, category, effective_from),
  CONSTRAINT fk_budgets_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
