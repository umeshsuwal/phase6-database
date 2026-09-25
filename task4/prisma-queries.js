require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Q1 — All posts by a specific user, newest first

  const anyUser = await prisma.user.findFirst();
  const q1 = await prisma.post.findMany({
    where: { authorId: anyUser.id },
    orderBy: { createdAt: 'desc' },
  });
  console.log('\n--- Q1: posts by', anyUser.name, '---');
  console.log(q1);

  // Q2 — A single post with all its comments and each comment's author name

  const anyPost = await prisma.post.findFirst();
  const q2 = await prisma.post.findUnique({
    where: { id: anyPost.id },
    include: {
      comments: {
        include: { author: { select: { name: true } } },
      },
    },
  });
  console.log('\n--- Q2: post with comments + authors ---');
  console.log(JSON.stringify(q2, null, 2));

  // Q3 — Comment count per post, for ALL posts (including 0-comment posts — a LEFT JOIN equivalent, not an INNER JOIN)

  const allPosts = await prisma.post.findMany({
    include: { _count: { select: { comments: true } } },
  });
  const q3 = allPosts.map((p) => ({ title: p.title, commentCount: p._count.comments }));
  console.log('\n--- Q3: comment count per post (all posts) ---');
  console.log(q3);

  // Q4 — All users who have never posted anything. The trick: `posts: { none: {} }` — the relation filter that means "this user has zero related rows in posts."

  const q4 = await prisma.user.findMany({
    where: { posts: { none: {} } },
  });
  console.log('\n--- Q4: users who have never posted ---');
  console.log(q4);

  // Q5 — The 3 most recently active posts, by most recent comment activity. Prisma can't directly ORDER BY a related aggregate like "max comment date," so this pulls posts with their comments and computes the most recent comment date in JS, then sorts. Posts with zero comments are excluded, since they have no "comment activity" to rank by.

  const postsWithComments = await prisma.post.findMany({
    include: { comments: { select: { createdAt: true } } },
  });
  const q5 = postsWithComments
    .filter((p) => p.comments.length > 0)
    .map((p) => ({
      title: p.title,
      mostRecentCommentAt: p.comments.reduce(
        (latest, c) => (c.createdAt > latest ? c.createdAt : latest),
        p.comments[0].createdAt
      ),
    }))
    .sort((a, b) => b.mostRecentCommentAt - a.mostRecentCommentAt)
    .slice(0, 3);
  console.log('\n--- Q5: 3 most recently active posts (by comment activity) ---');
  console.log(q5);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});