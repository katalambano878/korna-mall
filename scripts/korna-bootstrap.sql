CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO store_korna;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO store_korna;
ALTER ROLE store_korna SET search_path TO public, extensions;
