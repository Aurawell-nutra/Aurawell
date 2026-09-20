// Adds sample APPROVED reviews for design/demo purposes.
//   npm run db:seed:reviews          → add sample reviews (skips if already added)
//   npm run db:seed:reviews -- --remove  → delete every sample review
//
// ⚠ These are placeholder reviews, not real customer feedback. Remove them before launch —
// publishing invented reviews on a live store misleads customers and can breach consumer law.
// Every sample review uses an @sample.aurawell.invalid email so they are easy to find and delete.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SAMPLE_DOMAIN = "@sample.aurawell.invalid";

const reviews = {
  "pms-care-gummy": [
    ["Priya Sharma", 5, "Part of my monthly routine", "Tastes lovely and is so easy to remember. I keep a bottle on my desk and never skip it now.", true],
    ["Ananya Iyer", 5, "Love the flavour", "The chaste berry flavour is pleasant, not too sweet. Much nicer than swallowing tablets.", false],
    ["Sneha Patel", 4, "Nice and convenient", "Convenient and good quality. Packaging looks premium too. Would love a bigger bottle.", false],
    ["Kavya Reddy", 5, "Finally a gummy I enjoy", "I've tried a few supplements before and always gave up. These are genuinely enjoyable to take.", false],
    ["Meera Joshi", 4, "Good experience", "Soft texture, nice taste and the label is very clear about ingredients. Happy with my purchase.", false],
    ["Riya Desai", 5, "Gifted one to my sister", "Liked it so much that I ordered another bottle for my sister. Fast delivery as well.", false],
  ],
  "gut-comfort-gummy": [
    ["Rahul Mehta", 5, "Great amla taste", "Love the amla flavour. It has become a simple part of my morning — highly recommended.", true],
    ["Arjun Nair", 4, "Easy to include daily", "No water needed, just one gummy after breakfast. Taste is fresh and slightly tangy.", false],
    ["Pooja Shah", 5, "Whole family likes it", "My parents and I all take it. The gummies are soft and the bottle lasts the month.", false],
    ["Vikram Singh", 4, "Solid product", "Good quality and transparent label. Would be great to have a two-bottle combo offer.", false],
    ["Nisha Kulkarni", 5, "Pleasant surprise", "Didn't expect a gut care gummy to taste this good. Delivery was quick too.", false],
    ["Karan Malhotra", 5, "Convenient for travel", "Very handy while travelling for work. Easy to carry and easy to remember.", false],
  ],
  "daily-nutra-gummy": [
    ["Aarav Kapoor", 5, "Delicious orange flavour", "The orange flavour is delicious and the whole family enjoys them. Great quality.", true],
    ["Ishita Bose", 5, "Better than tablets", "I always forgot my multivitamin tablets. With these gummies I haven't missed a day.", false],
    ["Rohan Gupta", 4, "Good daily habit", "Nice taste, good packaging and clear ingredient list. Would buy again.", false],
    ["Divya Menon", 5, "My kids' favourite bottle to look at", "Keeps well out of reach of the kids but they love the colourful jar! Tastes great for me.", false],
    ["Siddharth Rao", 4, "Worth it", "Fair price for 30 gummies and the taste is not artificial. Happy overall.", false],
    ["Tanvi Agarwal", 5, "Premium feel", "From the box to the jar, everything feels premium. Gummies are fresh and soft.", false],
  ],
  "iron-glow-gummy": [
    ["Neha Trivedi", 5, "Finally consistent", "Great taste and lovely packaging. Finally a supplement I actually look forward to.", true],
    ["Simran Kaur", 5, "Strawberry flavour is lovely", "Sweet strawberry taste without being sugary. Easily the nicest gummy I've tried.", false],
    ["Aditi Verma", 4, "Nice product", "Soft texture and good flavour. The label clearly lists every ingredient, which I appreciate.", false],
    ["Fatima Shaikh", 5, "Ordering again", "Finished my first bottle and already reordered. Smooth ordering and delivery experience.", false],
    ["Pallavi Chauhan", 4, "Good taste", "Good taste and quality. Would love to see a family pack in future.", false],
  ],
};

async function main() {
  if (process.argv.includes("--remove")) {
    const { count } = await prisma.review.deleteMany({ where: { customerEmail: { endsWith: SAMPLE_DOMAIN } } });
    console.log(`✓ Removed ${count} sample reviews`);
    return;
  }

  const existing = await prisma.review.count({ where: { customerEmail: { endsWith: SAMPLE_DOMAIN } } });
  if (existing > 0) {
    console.log(`• ${existing} sample reviews already exist — skipped (use --remove first to re-seed)`);
    return;
  }

  let total = 0;
  for (const [slug, rows] of Object.entries(reviews)) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) {
      console.log(`• Product ${slug} not found — run npm run db:seed first`);
      continue;
    }
    await prisma.review.createMany({
      data: rows.map(([customerName, rating, title, comment, isFeatured], i) => ({
        productId: product.id,
        customerName,
        customerEmail: `${customerName.toLowerCase().replace(/[^a-z]+/g, ".")}${SAMPLE_DOMAIN}`,
        rating,
        title,
        comment,
        status: "APPROVED",
        isFeatured,
        createdAt: new Date(Date.now() - (i * 5 + Math.floor(Math.random() * 4) + 2) * 24 * 60 * 60 * 1000),
      })),
    });
    total += rows.length;
  }
  console.log(`✓ Added ${total} sample reviews (remove before launch: npm run db:seed:reviews -- --remove)`);
}

main()
  .catch((err) => {
    console.error("Review seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
