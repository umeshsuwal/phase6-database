-- Q1 (INNER JOIN): all posts with their author's name.
SELECT posts.title, users.name AS author
FROM posts
INNER JOIN users ON posts.author_id = users.id;
 
-- Q2 (INNER JOIN): all comments with the post title and commenter's name.
SELECT comments.text, posts.title AS post_title, users.name AS commenter
FROM comments
INNER JOIN posts ON comments.post_id = posts.id
INNER JOIN users ON comments.author_id = users.id;
 
-- Q3 (LEFT JOIN): all users, including ones with zero posts.
SELECT users.name, COUNT(posts.id) AS post_count
FROM users
LEFT JOIN posts ON posts.author_id = users.id
GROUP BY users.id, users.name
ORDER BY post_count ASC;
 
-- Q4 (LEFT JOIN): all posts, including ones with zero comments.
SELECT posts.title, COUNT(comments.id) AS comment_count
FROM posts
LEFT JOIN comments ON comments.post_id = posts.id
GROUP BY posts.id, posts.title
ORDER BY comment_count DESC;
 
-- Q5 (GROUP BY / aggregation): comment count per post, restricted to
-- posts that actually have at least one comment (INNER JOIN here is
-- intentional — this query only cares about posts WITH comments).
SELECT posts.title, COUNT(comments.id) AS comment_count
FROM posts
JOIN comments ON comments.post_id = posts.id
GROUP BY posts.id, posts.title
HAVING COUNT(comments.id) > 0
ORDER BY comment_count DESC;
 
-- Q6 (GROUP BY / aggregation): post count per user, including users
-- with zero posts, most active author first.
SELECT users.name, COUNT(posts.id) AS post_count
FROM users
LEFT JOIN posts ON posts.author_id = users.id
GROUP BY users.id, users.name
ORDER BY post_count DESC;
 
-- Q7 (joins + WHERE + ORDER BY): all comments made by Anuu, newest first.
SELECT comments.text, posts.title AS post_title, comments.created_at
FROM comments
JOIN users ON comments.author_id = users.id
JOIN posts ON comments.post_id = posts.id
WHERE users.name = 'Anuu'
ORDER BY comments.created_at DESC;
 
-- Q8 (joins + WHERE + LIMIT): the single most-recently created post,
-- along with its author.
SELECT posts.title, users.name AS author, posts.created_at
FROM posts
JOIN users ON posts.author_id = users.id
ORDER BY posts.created_at DESC
LIMIT 1;
 
-- Q9 (joins + WHERE + ORDER BY): all posts by Umesh, oldest first.
SELECT posts.title, posts.created_at
FROM posts
JOIN users ON posts.author_id = users.id
WHERE users.name = 'Umesh'
ORDER BY posts.created_at ASC;
 
-- Q10 (joins + GROUP BY + HAVING): users who have posted MORE than once.
SELECT users.name, COUNT(posts.id) AS post_count
FROM users
JOIN posts ON posts.author_id = users.id
GROUP BY users.id, users.name
HAVING COUNT(posts.id) > 1;
 
