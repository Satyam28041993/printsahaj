-- AI questions and answers. Private to the person who asked.
-- The answer is stored as the structured JSON shown in the app.

CREATE TABLE ai_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  question VARCHAR(1000) NOT NULL,
  answer_json MEDIUMTEXT NOT NULL,
  model VARCHAR(60) NOT NULL,
  tools_used VARCHAR(200) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY ix_ai_user (user_id, created_at),
  CONSTRAINT fk_ai_family FOREIGN KEY (family_id) REFERENCES families(id),
  CONSTRAINT fk_ai_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
