INSERT INTO users (name, email) VALUES
  ('Umesh', 'umesh@gmail.com'),
  ('Nishal', 'nishal@gmail.com'),
  ('Anuu', 'anuu@gmail.com');   -- zero posts, tests LEFT JOIN
 
INSERT INTO posts (title, author_id) VALUES
  ('Getting Started with SQL', 1),   -- Umesh
  ('Why I Switched to Postgres', 1), -- Umesh
  ('CSS Tricks I Wish I Knew Sooner', 2); -- Nishal, zero comments, tests LEFT JOIN
 
INSERT INTO comments (text, post_id, author_id) VALUES
  ('Nice, this really helped', 1, 2),   -- Nishal comments on Umesh's post
  ('Really clear explanation', 1, 3),   -- Anuu comments on Umesh's post
  ('Stunning writeup!', 2, 3);          -- Anuu comments on Umesh's other post
