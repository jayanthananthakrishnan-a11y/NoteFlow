-- Seed Data for NoteFlow Database
-- Description: Sample data for testing and development

-- Clear existing data (optional - comment out for production)
-- TRUNCATE TABLE analytics, note_views, likes, flashcards, bookmarks, comments, payments, notes, users CASCADE;

-- =============================================
-- Seed Users
-- =============================================
-- Password for all users: "password123" (hashed with bcrypt, 10 rounds)
-- Hash: $2b$10$rKJ5Z5X5X5X5X5X5X5X5XuGZKZ5X5X5X5X5X5X5X5X5X5X5X5X5X

INSERT INTO users (id, name, email, password, role, profile_picture, bio, email_verified) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Sarah Johnson', 'sarah.johnson@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Creator', 'https://i.pravatar.cc/150?img=1', 'Mathematics professor specializing in calculus and linear algebra', true),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Prof. Michael Chen', 'michael.chen@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Creator', 'https://i.pravatar.cc/150?img=2', 'Physics educator with 15 years of experience', true),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Emma Rodriguez', 'emma.rodriguez@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Creator', 'https://i.pravatar.cc/150?img=3', 'Chemistry enthusiast and online tutor', true),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'John Smith', 'john.smith@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Viewer', NULL, 'Engineering student', true),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Lisa Wang', 'lisa.wang@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Viewer', NULL, 'High school student preparing for exams', true),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'David Brown', 'david.brown@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Viewer', NULL, NULL, false);

-- =============================================
-- Seed Notes
-- =============================================

INSERT INTO notes (id, creator_id, title, subject, topics, description, content_type, content_urls, thumbnail_url, free_topics, paid_topics, price, is_published) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Calculus I: Limits and Continuity',
    'Mathematics',
    '["Limits", "Continuity", "Derivatives", "L''Hopital''s Rule"]',
    'Comprehensive notes covering limits, continuity, and introduction to derivatives',
    'pdf',
    '["https://example.com/notes/calculus-1.pdf"]',
    'https://picsum.photos/seed/calc1/400/300',
    '["Limits", "Continuity"]',
    '["Derivatives", "L''Hopital''s Rule"]',
    9.99,
    true
),
(
    '10000000-0000-0000-0000-000000000002',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Linear Algebra Essentials',
    'Mathematics',
    '["Matrices", "Vectors", "Eigenvalues", "Linear Transformations"]',
    'Complete guide to linear algebra fundamentals',
    'mixed',
    '["https://example.com/notes/linear-algebra-1.pdf", "https://example.com/notes/linear-algebra-diagrams.pdf"]',
    'https://picsum.photos/seed/linalg/400/300',
    '["Matrices", "Vectors"]',
    '["Eigenvalues", "Linear Transformations"]',
    14.99,
    true
),
(
    '10000000-0000-0000-0000-000000000003',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Physics: Mechanics and Motion',
    'Physics',
    '["Newton''s Laws", "Kinematics", "Energy", "Momentum"]',
    'Classical mechanics notes with solved examples',
    'pdf',
    '["https://example.com/notes/mechanics.pdf"]',
    'https://picsum.photos/seed/physics1/400/300',
    '["Newton''s Laws", "Kinematics"]',
    '["Energy", "Momentum"]',
    12.99,
    true
),
(
    '10000000-0000-0000-0000-000000000004',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Electromagnetism Fundamentals',
    'Physics',
    '["Electric Fields", "Magnetic Fields", "Maxwell''s Equations", "EM Waves"]',
    'In-depth coverage of electromagnetic theory',
    'pdf',
    '["https://example.com/notes/electromagnetism.pdf"]',
    'https://picsum.photos/seed/em/400/300',
    '["Electric Fields"]',
    '["Magnetic Fields", "Maxwell''s Equations", "EM Waves"]',
    15.99,
    true
),
(
    '10000000-0000-0000-0000-000000000005',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Organic Chemistry: Basic Reactions',
    'Chemistry',
    '["Alkanes", "Alkenes", "Functional Groups", "Reaction Mechanisms"]',
    'Introduction to organic chemistry reactions',
    'mixed',
    '["https://example.com/notes/organic-chem.pdf", "https://example.com/notes/reaction-diagrams.pdf"]',
    'https://picsum.photos/seed/chem1/400/300',
    '["Alkanes", "Functional Groups"]',
    '["Alkenes", "Reaction Mechanisms"]',
    11.99,
    true
),
(
    '10000000-0000-0000-0000-000000000006',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Free Chemistry Quick Reference',
    'Chemistry',
    '["Periodic Table", "Common Reactions", "Lab Safety"]',
    'Free reference guide for chemistry students',
    'pdf',
    '["https://example.com/notes/chem-reference.pdf"]',
    'https://picsum.photos/seed/chemfree/400/300',
    '["Periodic Table", "Common Reactions", "Lab Safety"]',
    NULL,
    0.00,
    true
);

-- =============================================
-- Seed Payments
-- =============================================

INSERT INTO payments (id, user_id, note_id, amount, currency, status, payment_method, transaction_id) VALUES
('20000000-0000-0000-0000-000000000001', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000001', 9.99, 'USD', 'completed', 'stripe', 'txn_001'),
('20000000-0000-0000-0000-000000000002', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000003', 12.99, 'USD', 'completed', 'stripe', 'txn_002'),
('20000000-0000-0000-0000-000000000003', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000002', 14.99, 'USD', 'completed', 'paypal', 'txn_003'),
('20000000-0000-0000-0000-000000000004', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000005', 11.99, 'USD', 'completed', 'stripe', 'txn_004'),
('20000000-0000-0000-0000-000000000005', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10000000-0000-0000-0000-000000000001', 9.99, 'USD', 'pending', 'stripe', 'txn_005');

-- =============================================
-- Seed Comments
-- =============================================

INSERT INTO comments (id, user_id, note_id, text, rating) VALUES
('30000000-0000-0000-0000-000000000001', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000001', 'Excellent notes! Very clear explanations of limits and continuity.', 5),
('30000000-0000-0000-0000-000000000002', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000003', 'Great examples and problem sets. Helped me ace my physics exam!', 5),
('30000000-0000-0000-0000-000000000003', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000002', 'Good coverage of linear algebra basics. Would like more advanced examples.', 4),
('30000000-0000-0000-0000-000000000004', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000005', 'Very helpful for understanding organic chemistry reactions!', 5),
('30000000-0000-0000-0000-000000000005', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10000000-0000-0000-0000-000000000006', 'Great free resource!', 5);

-- =============================================
-- Seed Bookmarks
-- =============================================

INSERT INTO bookmarks (id, user_id, note_id) VALUES
('40000000-0000-0000-0000-000000000001', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000002', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000002'),
('40000000-0000-0000-0000-000000000003', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000002'),
('40000000-0000-0000-0000-000000000004', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000005'),
('40000000-0000-0000-0000-000000000005', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10000000-0000-0000-0000-000000000006');

-- =============================================
-- Seed Flashcards
-- =============================================

INSERT INTO flashcards (id, note_id, question, options, answer, question_type, difficulty, explanation, order_index) VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'What is the limit of (x^2 - 1)/(x - 1) as x approaches 1?',
    '["0", "1", "2", "Does not exist"]',
    '2',
    'mcq',
    'medium',
    'Factor the numerator: (x-1)(x+1)/(x-1) = x+1. As x→1, the limit is 2.',
    1
),
(
    '50000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'A function is continuous at a point if the limit exists and equals the function value at that point.',
    NULL,
    'true',
    'true_false',
    'easy',
    'This is the definition of continuity at a point.',
    2
),
(
    '50000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'What is a matrix?',
    NULL,
    'A rectangular array of numbers arranged in rows and columns',
    'flashcard',
    'easy',
    NULL,
    1
),
(
    '50000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000003',
    'Newton''s First Law states that an object in motion stays in motion unless acted upon by what?',
    '["Friction", "External force", "Gravity", "Momentum"]',
    'External force',
    'mcq',
    'easy',
    'Newton''s First Law is also known as the law of inertia.',
    1
),
(
    '50000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000005',
    'What is a functional group in organic chemistry?',
    NULL,
    'A specific group of atoms within a molecule that determines its chemical properties',
    'flashcard',
    'medium',
    'Examples include hydroxyl (-OH), carbonyl (C=O), and amino (-NH2) groups.',
    1
);

-- =============================================
-- Seed Likes
-- =============================================

INSERT INTO likes (id, user_id, note_id) VALUES
('60000000-0000-0000-0000-000000000001', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000001'),
('60000000-0000-0000-0000-000000000002', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000003'),
('60000000-0000-0000-0000-000000000003', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000001'),
('60000000-0000-0000-0000-000000000004', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000002'),
('60000000-0000-0000-0000-000000000005', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000005'),
('60000000-0000-0000-0000-000000000006', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10000000-0000-0000-0000-000000000006');

-- =============================================
-- Seed Note Views
-- =============================================

INSERT INTO note_views (id, user_id, note_id, session_id) VALUES
('70000000-0000-0000-0000-000000000001', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000001', 'session_001'),
('70000000-0000-0000-0000-000000000002', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10000000-0000-0000-0000-000000000001', 'session_001'),
('70000000-0000-0000-0000-000000000003', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000001', 'session_002'),
('70000000-0000-0000-0000-000000000004', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10000000-0000-0000-0000-000000000002', 'session_002'),
('70000000-0000-0000-0000-000000000005', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10000000-0000-0000-0000-000000000001', 'session_003'),
('70000000-0000-0000-0000-000000000006', NULL, '10000000-0000-0000-0000-000000000006', 'guest_001'),
('70000000-0000-0000-0000-000000000007', NULL, '10000000-0000-0000-0000-000000000006', 'guest_002'),
('70000000-0000-0000-0000-000000000008', NULL, '10000000-0000-0000-0000-000000000006', 'guest_003');

-- Display summary
SELECT 'Seed data inserted successfully!' as message;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as note_count FROM notes;
SELECT COUNT(*) as payment_count FROM payments;
SELECT COUNT(*) as comment_count FROM comments;
SELECT COUNT(*) as bookmark_count FROM bookmarks;
SELECT COUNT(*) as flashcard_count FROM flashcards;
SELECT COUNT(*) as like_count FROM likes;
SELECT COUNT(*) as view_count FROM note_views;

-- Display analytics (should be auto-populated by triggers)
SELECT 
    n.title,
    a.total_views,
    a.total_likes,
    a.total_bookmarks,
    a.total_purchases,
    a.total_revenue,
    a.average_rating,
    a.total_comments
FROM notes n
LEFT JOIN analytics a ON n.id = a.note_id
ORDER BY n.title;
