CREATE TABLE IF NOT EXISTS pack_open_limits (
  subject VARCHAR(64) NOT NULL PRIMARY KEY,
  minute_bucket INT NOT NULL,
  minute_count INT NOT NULL,
  hour_bucket INT NOT NULL,
  hour_count INT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX pack_open_limits_updated_at_idx (updated_at)
);
