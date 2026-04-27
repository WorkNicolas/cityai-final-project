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
    { email: 'keziah.noreen.mendoza@gmail.com',   name: 'Keziah Noreen Mendoza',  passwordHash: hash, role: 'resident' },
    { email: 'marissa.mendoza@gmail.com',         name: 'Marissa Mendoza',        passwordHash: hash, role: 'staff' },
    { email: 'kyle.nathaniel.mendoza@gmail.com',  name: 'Kyle Nathaniel Mendoza', passwordHash: hash, role: 'advocate' },
  ]);

  console.log(`Created ${users.length} users.`);
  await conn.close();
  return users;
}

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
 * @description Resets and populates the issue and analytics databases with demo reports.
 */
async function seedIssues(residentId: string, advocateId: string, staffId: string) {
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

  for (let i = 0; i < issueData.length; i++) {
    const data = issueData[i];
    
    // Vary comments for testing: 
    // - Index 0, 3: Multiple comments
    // - Index 1, 4: Single comment
    // - Index 2, 5: No comments
    // - Index 6: Multiple comments
    let comments: any[] = [];
    if ([0, 3, 6].includes(i)) {
      comments = [
        { userId: advocateId, userName: 'Kyle Nathaniel Mendoza', text: 'First guidance note: verifying local impact.', createdAt: new Date(Date.now() - 86400000) },
        { userId: advocateId, userName: 'Kyle Nathaniel Mendoza', text: 'Update: Escalated to public works department.', createdAt: new Date() }
      ];
    } else if ([1, 4].includes(i)) {
      comments = [
        { userId: advocateId, userName: 'Kyle Nathaniel Mendoza', text: 'As a community advocate, I have flagged this for urgent staff review.', createdAt: new Date() }
      ];
    }

    const descriptions = [
      "There is a massive pothole that almost ruined my tires. It's getting wider every day.",
      "The streetlight has been out for a week, making the intersection very dark and unsafe at night.",
      "Heavy rain caused the drain to block completely, water is pooling on the sidewalk.",
      "Someone spray-painted inappropriate tags on the side of the community center wall.",
      "The stop sign at the corner was knocked down over the weekend. Extremely dangerous for traffic.",
      "The entire street floods during moderate rain. Needs drainage clearing immediately.",
      "Hit another deep pothole here. This whole street needs to be repaved as soon as possible."
    ];
    const realDescription = descriptions[i] || `This is a demo report for ${data.title}.`;

    const issue = await Issue.create({
      ...data,
      description: realDescription,
      reportedBy: residentId,
      assignedTo: [0, 1].includes(i) ? staffId : null,
      upvotes: 0,
      upvotedBy: [],
      downvotes: 0,
      downvotedBy: [],
      comments,
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

run();
