DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
 
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
 
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  -- CHECK constraint: a post's created_at can never be in the future.
  CONSTRAINT created_at_not_future CHECK (created_at <= NOW())
);
 
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES posts(id),
  author_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
