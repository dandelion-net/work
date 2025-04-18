/*
  # Add messages table for storage

  1. New Tables
    - `messages`
      - `id` (text, primary key)
      - `type` (text)
      - `data` (text, JSON stringified)
      - `sender` (text)
      - `recipient` (text, nullable)
      - `timestamp` (datetime)
      - `signature` (text)
      - `relayPath` (text, JSON stringified array)
      - `validations` (text, JSON stringified array)
      - `createdAt` (datetime)
*/

CREATE TABLE IF NOT EXISTS Message (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  data        TEXT NOT NULL,
  sender      TEXT NOT NULL,
  recipient   TEXT,
  timestamp   DATETIME NOT NULL,
  signature   TEXT NOT NULL,
  relayPath   TEXT,
  validations TEXT NOT NULL,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);