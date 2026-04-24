/** scripts/seed.ts
 * @file seed.ts
 * @description Utility script to populate MongoDB with demo data for CityAI.
 * Resets all databases and creates specific demo accounts.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-24 - Updated demo accounts and password hashing to match standards.
 * @version 0.2.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_AUTH      = 'mongodb://localhost:27017/cityai-auth';
const MONGO_ISSUES    = 'mongodb://localhost:27017/cityai-issues';
const MONGO_ANALYTICS = 'mongodb://localhost:27017/cityai_analytics';

/**
 * seedUsers
 * @description Resets and populates the auth database with specified demo accounts.
 */
async function seedUsers() {
  console.log('Seeding Users...');
  const conn = await mongoose.createConnection(MONGO_AUTH).asPromise();
  const User = conn.model('User', new mongoose.Schema({
    email: String, name: String, passwordHash: String, role: String
  }, { timestamps: true }));

  await User.deleteMany({});
  
  // As per docs/password_hashing.md: bcryptjs with 12 rounds
  const hash = await bcrypt.hash('Cnnmcn54$', 12);
  
  const users = await User.create([
    { email: 'keziah.noreen.mendoza@gmail.com',   name: 'Keziah Resident',  passwordHash: hash, role: 'resident' },
    { email: 'marissa.mendoza@gmail.com',         name: 'Marissa Staff',    passwordHash: hash, role: 'staff' },
    { email: 'kyle.nathaniel.mendoza@gmail.com',  name: 'Kyle Advocate',    passwordHash: hash, role: 'advocate' },
  ]);

  console.log(`Created ${users.length} users.`);
  await conn.close();
  return users;
}

/**
 * seedIssues
 * @description Resets and populates the issue and analytics databases with demo reports.
 */
async function seedIssues(residentId: string) {
  console.log('Seeding Issues, Notifications & Snapshots...');
  const issueConn = await mongoose.createConnection(MONGO_ISSUES).asPromise();
  const Issue = issueConn.model('Issue', new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Notification = issueConn.model('Notification', new mongoose.Schema({}, { strict: false, timestamps: true }));
  
  const analyticsConn = await mongoose.createConnection(MONGO_ANALYTICS).asPromise();
  const Snapshot = analyticsConn.collection('issuesnapshots');

  // Clear all data
  await Issue.deleteMany({});
  await Notification.deleteMany({});
  await Snapshot.deleteMany({});

  const issueData = [
    { title: 'Large Pothole', category: 'pothole', status: 'open', location: '123 Queen St' },
    { title: 'Broken Lamp',   category: 'streetlight', status: 'in-progress', location: '45 King St' },
    { title: 'Blocked Drain', category: 'flooding', status: 'resolved', location: '88 Bay St' },
    { title: 'Graffiti Tag',  category: 'graffiti', status: 'open', location: '200 Spadina Ave' },
    { title: 'Missing Sign',  category: 'safety-hazard', status: 'open', location: '50 Front St' },
    { title: 'Street Flood',  category: 'flooding', status: 'open', location: '10 Main St' },
    { title: 'Pothole Alert', category: 'pothole', status: 'open', location: '99 York St' },
  ];

  for (const data of issueData) {
    const upvotes = Math.floor(Math.random() * 20);
    const downvotes = Math.floor(Math.random() * 5);

    const issue = await Issue.create({
      ...data,
      description: `This is a demo report for ${data.title}. Needs urgent attention.`,
      reportedBy: residentId,
      upvotes,
      upvotedBy: [],
      downvotes,
      downvotedBy: [],
      comments: [
        {
          userId: residentId,
          userName: 'Keziah Resident',
          text: 'This is getting dangerous, please fix it!',
          createdAt: new Date()
        }
      ],
      aiSummary: `AI Summary: ${data.title} reported at ${data.location}.`
    });

    // Create snapshot for analytics
    await Snapshot.insertOne({
      issueId:     issue._id,
      title:       data.title,
      description: issue.description,
      category:    issue.category,
      status:      issue.status,
      location:    issue.location,
      createdAt:   new Date(),
    });
  }

  console.log(`Created ${issueData.length} issues and snapshots.`);
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
    console.log('Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Failed:', err);
    process.exit(1);
  }
}

run();
