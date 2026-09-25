require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

dns.setServers(['1.1.1.1', '8.8.8.8']);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Atlas');

  // Q1 — All posts by a specific user, newest first

  const anyUser = await User.findOne();
  const q1 = await Post.find({ authorId: anyUser._id }).sort({ createdAt: -1 });
  console.log('\n--- Q1: posts by', anyUser.name, '---');
  console.log(q1);

  // Q2 — A single post with all its comments and each comment's author name. Since comments are REFERENCED (Task 2 decision), this needs a separate query + populate, not a single document read the way it would be if comments were embedded.

  const anyPost = await Post.findOne();
  const q2Comments = await Comment.find({ postId: anyPost._id }).populate('authorId', 'name');
  console.log('\n--- Q2: post with comments + authors ---');
  console.log({ post: anyPost, comments: q2Comments });

  // Q3 — Comment count per post, for ALL posts (including posts with zero comments — this needs $lookup FROM posts, not from comments, otherwise a post with no comments never appears at all, same issue as an INNER JOIN on the SQL side)

  const q3 = await Post.aggregate([
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      },
    },
    {
      $project: {
        title: 1,
        commentCount: { $size: '$comments' },
      },
    },
  ]);
  console.log('\n--- Q3: comment count per post (all posts) ---');
  console.log(q3);

  // Q4 — All users who have never posted anything. MongoDB has no built-in "has no matching documents" filter, so this needs a $lookup followed by a $match on an empty array.
  const q4 = await User.aggregate([
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'authorId',
        as: 'posts',
      },
    },
    { $match: { posts: { $size: 0 } } },
    { $project: { posts: 0 } },
  ]);
  console.log('\n--- Q4: users who have never posted ---');
  console.log(q4);

  // Q5 — The 3 most recently active posts, by most recent comment activity.
  const q5 = await Comment.aggregate([
    {
      $group: {
        _id: '$postId',
        mostRecentCommentAt: { $max: '$createdAt' },
      },
    },
    { $sort: { mostRecentCommentAt: -1 } },
    { $limit: 3 },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: '_id',
        as: 'post',
      },
    },
    { $unwind: '$post' },
    { $project: { title: '$post.title', mostRecentCommentAt: 1 } },
  ]);
  console.log('\n--- Q5: 3 most recently active posts (by comment activity) ---');
  console.log(q5);

  await mongoose.disconnect();
}

main().catch(console.error);