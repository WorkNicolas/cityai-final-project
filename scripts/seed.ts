/** scripts/seed.ts
 * @file seed.ts
 * @description Utility script to populate MongoDB with demo data for CityAI.
 * Creates users, issues, and analytics snapshots for presentation testing.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_AUTH      = 'mongodb://localhost:27017/cityai-auth';
const MONGO_ISSUES    = 'mongodb://localhost:27017/cityai-issues';
const MONGO_ANALYTICS = 'mongodb://localhost:27017/civicase-analytics';

/**
 * seedUsers
 * @description Populates the auth database with demo accounts.
 */
async function seedUsers() {
  console.log('🌱 Seeding Users...');
  const conn = await mongoose.createConnection(MONGO_AUTH).asPromise();
  const User = conn.model('User', new mongoose.Schema({
    email: String, name: String, passwordHash: String, role: String
  }, { timestamps: true }));

  await User.deleteMany({});
  
  const hash = await bcrypt.hash('password123', 12);
  
  const users = await User.create([
    { email: 'resident@example.ca', name: 'Jane Resident', passwordHash: hash, role: 'resident' },
    { email: 'staff@city.ca',      name: 'Bob Staff',     passwordHash: hash, role: 'staff' },
    { email: 'advocate@help.org',  name: 'Alice Advocate', passwordHash: hash, role: 'advocate' },
  ]);

  console.log(`✅ Created ${users.length} users.`);
  await conn.close();
  return users;
}

/**
 * seedIssues
 * @description Populates the issue and analytics databases with demo reports.
 */
async function seedIssues(residentId: string) {
  console.log('🌱 Seeding Issues & Snapshots...');
  const issueConn = await mongoose.createConnection(MONGO_ISSUES).asPromise();
  const Issue = issueConn.model('Issue', new mongoose.Schema({}, { strict: false, timestamps: true }));
  
  const analyticsConn = await mongoose.createConnection(MONGO_ANALYTICS).asPromise();
  const Snapshot = analyticsConn.collection('issuesnapshots');

  await Issue.deleteMany({});
  await Snapshot.deleteMany({});

  const issueData = [
    { title: 'Large Pothole', category: 'pothole', status: 'open', location: '123 Queen St', coords: [-79.3832, 43.6532] },
    { title: 'Broken Lamp',   category: 'streetlight', status: 'in-progress', location: '45 King St', coords: [-79.3732, 43.6432] },
    { title: 'Blocked Drain', category: 'flooding', status: 'resolved', location: '88 Bay St', coords: [-79.3802, 43.6502] },
    { title: 'Graffiti Tag',  category: 'graffiti', status: 'open', location: '200 Spadina Ave', coords: [-79.3982, 43.6482] },
    { title: 'Missing Sign',  category: 'safety_hazard', status: 'open', location: '50 Front St', coords: [-79.3782, 43.6452] },
    { title: 'Street Flood',  category: 'flooding', status: 'open', location: '10 Main St', coords: [-79.3852, 43.6552] },
    { title: 'Pothole Alert', category: 'pothole', status: 'open', location: '99 York St', coords: [-79.3812, 43.6512] },
  ];

  for (const data of issueData) {
    const issue = await Issue.create({
      ...data,
      description: `This is a demo report for ${data.title}. Needs urgent attention.`,
      reportedBy: residentId,
      upvotes: Math.floor(Math.random() * 20),
      aiSummary: `AI Summary: ${data.title} reported at ${data.location}.`
    });

    // Create snapshot for analytics
    await Snapshot.insertOne({
      issueId: issue._id,
      category: issue.category,
      status: issue.status,
      location: issue.location,
      createdAt: new Date(),
    });
  }

  console.log(`✅ Created ${issueData.length} issues and snapshots.`);
  await issueConn.close();
  await analyticsConn.close();
}

async function run() {
  try {
    const users = await seedUsers();
    const resident = users.find(u => u.role === 'resident');
    if (resident) {
      await seedIssues(String(resident._id));
    }
    console.log('🚀 Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
}

run();
