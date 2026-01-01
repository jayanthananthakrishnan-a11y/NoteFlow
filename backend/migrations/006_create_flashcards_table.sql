-- Migration: Create Flashcards Table
-- Description: Stores flashcards and quiz questions associated with notes

-- Create ENUM types for question type and difficulty
CREATE TYPE question_type AS ENUM ('flashcard', 'mcq', 'true_false');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create Flashcards table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB,
    answer TEXT NOT NULL,
    question_type question_type NOT NULL,
    difficulty difficulty_level,
    explanation TEXT,
    date_created TIMESTAMP NOT NULL DEFAULT NOW(),
    order_index INTEGER
);

-- Create indexes
CREATE INDEX idx_flashcards_note ON flashcards(note_id);
CREATE INDEX idx_flashcards_type ON flashcards(question_type);
CREATE INDEX idx_flashcards_difficulty ON flashcards(difficulty);
CREATE INDEX idx_flashcards_order ON flashcards(note_id, order_index);

-- Add comments
COMMENT ON TABLE flashcards IS 'Stores flashcards and quiz questions associated with notes';
COMMENT ON COLUMN flashcards.options IS 'Array of answer options for MCQ questions in JSON format';
COMMENT ON COLUMN flashcards.explanation IS 'Optional explanation for the correct answer';
COMMENT ON COLUMN flashcards.order_index IS 'Display order within the note';
