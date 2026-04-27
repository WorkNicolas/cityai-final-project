/** scripts/seed_lots.ts
 * @file seed_lots.ts
 * @description Utility script to populate MongoDB with a large amount of demo data
 * for CityAI to test analytics features like Resolution Efficiency and Public Sentiment.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @version 0.2.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_AUTH      = 'mongodb://localhost:27017/cityai-auth';
const MONGO_ISSUES    = 'mongodb://localhost:27017/cityai-issues';
const MONGO_ANALYTICS = 'mongodb://localhost:27017/cityai_analytics';

/**
 * seedUsers
 */
async function seedUsers() {
  console.log('Seeding Users...');
  const conn = await mongoose.createConnection(MONGO_AUTH).asPromise();
  const User = conn.model('User', new mongoose.Schema({
    email: String, name: String, passwordHash: String, role: String
  }, { timestamps: true }));

  await User.deleteMany({});
  
  const hash = await bcrypt.hash('Cnnmcn54$', 12);
  
  const users = await User.create([
    { email: 'keziah.noreen.mendoza@gmail.com',   name: 'Keziah Noreen Mendoza',  passwordHash: hash, role: 'resident' },
    { email: 'marissa.mendoza@gmail.com',         name: 'Marissa Mendoza',        passwordHash: hash, role: 'staff' },
    { email: 'kyle.nathaniel.mendoza@gmail.com',  name: 'Kyle Nathaniel Mendoza', passwordHash: hash, role: 'advocate' },
  ]);

  console.log(`Created ${users.length} users.`);
  await conn.close();
  return users;
}

/**
 * run
 */
async function run() {
  try {
    const users = await seedUsers();
    const resident = users.find(u => u.role === 'resident');
    const advocate = users.find(u => u.role === 'advocate');
    const staff = users.find(u => u.role === 'staff');

    if (resident && advocate && staff) {
      await seedIssues(String(resident._id), String(advocate._id), String(staff._id));
    }
    console.log('Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Failed:', err);
    process.exit(1);
  }
}

/**
 * seedIssues
 */
async function seedIssues(residentId: string, advocateId: string, staffId: string) {
  console.log('Seeding Large Dataset of Issues, Notifications & Snapshots...');
  const issueConn = await mongoose.createConnection(MONGO_ISSUES).asPromise();
  const Issue = issueConn.model('Issue', new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Notification = issueConn.model('Notification', new mongoose.Schema({}, { strict: false, timestamps: true }));
  
  const analyticsConn = await mongoose.createConnection(MONGO_ANALYTICS).asPromise();
  const Snapshot = analyticsConn.collection('issuesnapshots');

  await Issue.deleteMany({});
  await Notification.deleteMany({});
  await Snapshot.deleteMany({});

  const categories = ['pothole', 'streetlight', 'flooding', 'graffiti', 'safety_hazard'];
  const statuses = ['open', 'in_progress', 'resolved'];
  
  const descriptions = [
    "There is a massive pothole that almost ruined my tires. It's getting wider every day.",
    "The streetlight has been out for a week, making the intersection very dark and unsafe at night.",
    "Heavy rain caused the drain to block completely, water is pooling on the sidewalk.",
    "Someone spray-painted inappropriate tags on the side of the community center wall.",
    "The stop sign at the corner was knocked down over the weekend. Extremely dangerous for traffic.",
    "The entire street floods during moderate rain. Needs drainage clearing immediately.",
    "Hit another deep pothole here. This whole street needs to be repaved as soon as possible.",
    "Traffic light is blinking red constantly. Traffic is backing up.",
    "A tree branch fell and is blocking the pedestrian path completely.",
    "There's a strong smell of gas near the park entrance, needs immediate checking."
  ];

  let issueCount = 0;

  for (let i = 0; i < 40; i++) {
    const category = categories[i % categories.length];
    const status = statuses[i % statuses.length];
    const description = descriptions[i % descriptions.length];
    const title = `Issue with ${category} ${i}`;
    const location = `${Math.floor(Math.random() * 100) + 1} Main St`;
    
    // Create timestamps to simulate history
    const now = new Date().getTime();
    // Created between 1 and 10 days ago
    const createdDaysAgo = Math.floor(Math.random() * 9) + 1;
    const createdAt = new Date(now - createdDaysAgo * 86400000);
    
    let resolvedAt = null;
    if (status === 'resolved') {
        // Resolved between 0 and createdDaysAgo-1 days ago
        const resolvedDaysAgo = Math.floor(Math.random() * createdDaysAgo);
        resolvedAt = new Date(now - resolvedDaysAgo * 86400000);
    }

    const issue = await Issue.create({
      title,
      category,
      status,
      location,
      description,
      reportedBy: residentId,
      assignedTo: status !== 'open' ? staffId : null,
      upvotes: Math.floor(Math.random() * 10),
      upvotedBy: [],
      downvotes: 0,
      downvotedBy: [],
      comments: [],
      aiSummary: `AI Summary: ${title} reported at ${location}.`,
      createdAt,
      updatedAt: resolvedAt || createdAt
    });

    const snapshotData: any = {
      issueId:     issue._id,
      title:       title,
      description: description,
      category:    category,
      status:      status,
      location:    location,
      createdAt:   createdAt,
    };
    
    if (resolvedAt) {
        snapshotData.resolvedAt = resolvedAt;
    }

    await Snapshot.insertOne(snapshotData);
    issueCount++;
  }

  console.log(`Created ${issueCount} issues and snapshots.`);
  await issueConn.close();
  await analyticsConn.close();
}

run();
