-- Optional 4–6 digit MPIN that unlocks an already signed-in session.
ALTER TABLE users ADD COLUMN pin_hash VARCHAR(255) NULL AFTER password_hash;
