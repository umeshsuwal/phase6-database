# PostgreSQL vs MongoDB

## Which queries felt more natural in SQL vs MongoDB

Q1 (posts by a user, newest first) and Q2 (a post with its comments)
felt roughly equivalent in both — `where`/`orderBy` in Prisma and
`find`/`sort` in Mongo are nearly 1:1 translations of each other. The
real divergence showed up on Q4 and Q5. Q4 (users who've never posted)
was trivial in Prisma — `posts: { none: {} }` is a single declarative
filter — but genuinely awkward in MongoDB, requiring a `$lookup` to
join in posts, then a `$match` on an empty array, because Mongo has
no built-in "has zero related documents" concept the way a relational
LEFT JOIN + IS NULL check does. Q5 (most recently active posts by
comment activity) was actually easier to express in MongoDB's
aggregation pipeline (`$group` with `$max`, `$sort`, `$limit`,
`$lookup` chained together) than in Prisma, which has no way to
ORDER BY a related aggregate directly — I had to pull posts with their
comments into JS and compute the max date and sort manually.

## Where the Task 2 embedding/referencing decision changed a query

Q2 is the clearest example. Because comments are REFERENCED, not
embedded (the Task 2 decision — comment count is unbounded), fetching
a post with its comments in MongoDB is genuinely two operations: fetch
the post, then a separate `Comment.find({ postId })` with a `populate`
to resolve each comment's author name. In Prisma/SQL, the equivalent
is one `findUnique` call with a nested `include`, because a JOIN can
assemble everything in a single round-trip regardless of how the data
is normalized. If I'd chosen to embed comments in MongoDB instead,
Q2 would have been a single `findOne` with zero extra queries — but
Q3 (comment count per post) and any query needing to search comments
independently of their post would have gotten worse, since you'd be
pulling potentially huge embedded arrays just to count them.

## Which I'd choose for a blog like this

For a blog specifically, I'd lean toward PostgreSQL/Prisma. The data
here is genuinely relational — comments belong to posts which belong
to users, and queries like Q4 (users who never posted) are exactly the
kind of "find things by the absence of a relationship" query that
SQL was built for and that MongoDB has to work around. MongoDB's
flexibility pays off more when the data doesn't have a stable, well-
defined relational shape up front, or when you're optimizing for
massive horizontal scale on document reads/writes — neither of which
is really the situation a blog is in. The one place I'd reconsider is
if comments needed to be denormalized for very high-read-volume,
low-latency delivery (a hugely popular blog) — but that's a scaling
problem to solve later, not a reason to default away from SQL here.

# Prisma vs Drizzle

Defining the User model in Drizzle felt noticeably closer to raw SQL
than Prisma's schema — `pgTable('users', { id: serial('id')... })`
reads almost like a `CREATE TABLE` statement translated line-by-line
into JS, whereas Prisma's schema (`model User { id Int @id
@default(autoincrement()) ... }`) is its own DSL, one level more
abstracted from the actual SQL that gets generated underneath.
Drizzle felt more explicit and less "magic" — I could predict exactly
what column types and constraints it would produce, whereas Prisma's
`@@map`/relation syntax hides more of the SQL detail (which is
convenient day-to-day, but does mean trusting the tool more).