-- Create photos table for resume photo gallery
-- Each row references one image stored in the configured S3 bucket.
-- s3_key is the path within the bucket; the public URL is derived
-- from s3_key + the runtime AWS_REGION + S3_BUCKET env vars.

CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    s3_key TEXT NOT NULL UNIQUE,
    caption TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    width INT,
    height INT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_photos_user_profile_id ON photos(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_order ON photos(user_profile_id, display_order, created_at);

CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON photos TO authenticated;
