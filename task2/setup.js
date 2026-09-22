require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Missing MONGODB_URI in your .env file');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);
  console.log('Connected to Atlas');

  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  // ---- Insert users ----
  const users = await User.insertMany([
    { name: 'Umesh', email: 'umesh@gmail.com' },
    { name: 'Nishal', email: 'nishal@gmail.com' },
    { name: 'Anuu', email: 'anuu@gmail.com' },
  ]);
  console.log('Inserted users:', users.map((u) => u._id));

  // ---- Insert posts ----
  const posts = await Post.insertMany([
    { title: 'Getting Started with SQL', authorId: users[0]._id },
    { title: 'Why I Switched to Postgres', authorId: users[0]._id },
    { title: 'CSS Tricks I Wish I Knew Sooner', authorId: users[1]._id },
  ]);
  console.log('Inserted posts:', posts.map((p) => p._id));

  // ---- Insert comments (referenced, per the schema decision) ----
  const comments = await Comment.insertMany([
    { postId: posts[0]._id, authorId: users[1]._id, text: 'Nice, this really helped' },
    { postId: posts[0]._id, authorId: users[2]._id, text: 'Really clear explanation' },
  ]);
  console.log('Inserted comments:', comments.map((c) => c._id));

  const indexName = await Comment.collection.createIndex({ postId: 1 });
  console.log('Created index:', indexName);

  // ---- explain() on small dataset ----
  const explainSmall = await Comment.collection
    .find({ postId: posts[0]._id })
    .explain('executionStats');
  console.log(
    '\n--- explain() on small dataset ---\nwinningPlan stage:',
    explainSmall.queryPlanner.winningPlan.inputStage?.stage ||
      explainSmall.queryPlanner.winningPlan.stage
  );

  // ---- Bulk insert to prove it at scale ----
  const bulkComments = [];
  for (let i = 0; i < 5000; i++) {
    bulkComments.push({
      postId: posts[0]._id,
      authorId: users[2]._id,
      text: 'Bulk comment ' + i,
    });
  }
  await Comment.insertMany(bulkComments);
  console.log('\nInserted 5000 bulk comments for scale test');

  // ---- explain() on larger dataset ----
  const explainLarge = await Comment.collection
    .find({ postId: posts[0]._id })
    .explain('executionStats');
  console.log(
    '\n--- explain() on larger dataset (5002 matching comments) ---\nwinningPlan stage:',
    explainLarge.queryPlanner.winningPlan.inputStage?.stage ||
      explainLarge.queryPlanner.winningPlan.stage
  );
  console.log('totalDocsExamined:', explainLarge.executionStats.totalDocsExamined);
  console.log('nReturned:', explainLarge.executionStats.nReturned);

  // ---- Clean up bulk test data ----
  await Comment.deleteMany({ text: /^Bulk comment/ });
  console.log('\nCleaned up bulk test comments');

  await mongoose.disconnect();
}

main().catch(console.error);