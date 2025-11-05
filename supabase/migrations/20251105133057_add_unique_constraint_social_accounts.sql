/*
  # Add Unique Constraint to social_accounts

  1. Changes
    - Add unique constraint on (user_id, platform) to prevent duplicate accounts
    - This allows upsert operations to work correctly when reconnecting accounts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'social_accounts_user_id_platform_key'
  ) THEN
    ALTER TABLE social_accounts 
    ADD CONSTRAINT social_accounts_user_id_platform_key 
    UNIQUE (user_id, platform);
  END IF;
END $$;
