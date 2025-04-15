export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Mood {
  id: string
  user_id: string
  mood_category_id: string
  mood_score: number
  note: string | null
  created_at: string
}

export interface MoodCategory {
  id: string
  name: string
  description: string
  color: string
}

export interface Todo {
  id: string
  user_id: string
  task: string
  is_complete: boolean
  created_at: string
}
