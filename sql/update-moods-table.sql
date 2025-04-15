-- Update moods table to use mood_categories
ALTER TABLE moods 
ADD COLUMN IF NOT EXISTS mood_category_id UUID REFERENCES mood_categories(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_moods_mood_category_id ON moods(mood_category_id);

-- Enable RLS on moods table
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Create policies for moods table
CREATE POLICY "Users can read their own moods"
  ON moods
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own moods"
  ON moods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moods"
  ON moods
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moods"
  ON moods
  FOR DELETE
  USING (auth.uid() = user_id);
