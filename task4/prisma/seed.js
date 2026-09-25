const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.create({
    data: { name: 'Alice', email: 'alice@example.com' },
  });
  const bob = await prisma.user.create({
    data: { name: 'Bob', email: 'bob@example.com' },
  });
  const carol = await prisma.user.create({
    data: { name: 'Carol', email: 'carol@example.com' }, // zero posts
  });
  const dave = await prisma.user.create({
    data: { name: 'Dave', email: 'dave@example.com' },
  });

  const post1 = await prisma.post.create({
    data: { title: 'Getting Started with SQL', authorId: alice.id },
  });
  const post2 = await prisma.post.create({
    data: { title: 'Why I Switched to Postgres', authorId: alice.id },
  });
  const post3 = await prisma.post.create({
    data: { title: 'CSS Tricks I Wish I Knew Sooner', authorId: bob.id },
  });
  const post4 = await prisma.post.create({
    data: { title: 'A Beginner Guide to Indexes', authorId: dave.id }, // zero comments
  });

  await prisma.comment.createMany({
    data: [
      { text: 'Nice, this really helped', postId: post1.id, authorId: bob.id },
      { text: 'Really clear explanation', postId: post1.id, authorId: carol.id },
      { text: 'Stunning writeup!', postId: post2.id, authorId: carol.id },
      { text: 'Agreed, switched too', postId: post2.id, authorId: dave.id },
      { text: 'Saved me hours', postId: post3.id, authorId: alice.id },
      { text: 'Bookmarking this', postId: post3.id, authorId: carol.id },
    ],
  });

  console.log('Seed complete:', {
    users: 4,
    posts: 4,
    comments: 6,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });