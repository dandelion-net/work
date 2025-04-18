/*
  # Create default admin user
  
  1. New Data
    - Creates a default admin user for testing
    
  2. Security
    - Password should be changed in production
*/

INSERT INTO "User" ("id", "email", "name", "role", "onboarded")
VALUES (
  'cltest123000000testadminuser',
  'admin@example.com',
  'Admin User',
  'ADMIN',
  true
)
ON CONFLICT ("id") DO NOTHING;