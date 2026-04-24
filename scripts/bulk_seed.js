/** scripts/bulk_seed.js
 * @description Injects a large number of issues into MongoDB to visualize the heatmap.
 * Use: node scripts/bulk_seed.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_AUTH = 'mongodb://localhost:27017/cityai-auth';
const MONGO_ISSUES = 'mongodb://localhost:27017/cityai-issues';
const MONGO_ANALYTICS = 'mongodb://localhost:27017/cityai_analytics';

// Toronto Center
const CENTER_LAT = 43.6532;
const CENTER_LNG = -79.3832;

async function run() {
  const authClient = new MongoClient(MONGO_AUTH);
  const issueClient = new MongoClient(MONGO_ISSUES);
  const analyticsClient = new MongoClient(MONGO_ANALYTICS);

  try {
    await authClient.connect();
    await issueClient.connect();
    await analyticsClient.connect();

    const authDb = authClient.db();
    const issueDb = issueClient.db();
    const analyticsDb = analyticsClient.db();

    const users = authDb.collection('users');
    const issues = issueDb.collection('issues');
    const snapshots = analyticsDb.collection('issuesnapshots');

    console.log('🔍 Finding resident for attribution...');
    const resident = await users.findOne({ role: 'resident' });
    const residentId = resident ? resident._id.toString() : '6624a0000000000000000001';

    if (!resident) {
      console.warn('⚠️ No resident found in cityai-auth. Falling back to mock ID.');
    } else {
      console.log(`👤 Attributing issues to: ${resident.name} (${residentId})`);
    }

    console.log('🧹 Cleaning existing data...');
    // We'll keep the users but clean issues to make the heatmap clear
    await issues.deleteMany({});
    await snapshots.deleteMany({});

    const categories = ['pothole', 'streetlight', 'flooding', 'safety-hazard', 'graffiti'];
    const statuses = ['open', 'in-progress', 'resolved'];

    const bulkIssues = [];
    const bulkSnapshots = [];

    console.log('🏗️ Generating 150 mock issues...');

    for (let i = 0; i < 150; i++) {
      // Generate random coordinates within ~5km of downtown Toronto
      const lat = CENTER_LAT + (Math.random() - 0.5) * 0.1;
      const lng = CENTER_LNG + (Math.random() - 0.5) * 0.1;

      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const id = new ObjectId();

      const issue = {
        _id: id,
        title: `Bulk Issue #${i + 1}`,
        description: 'Generated issue for heatmap visualization.',
        location: 'Toronto, ON',
        coordinates: [lng, lat],
        category: category,
        status: status,
        reportedBy: residentId,
        upvotes: Math.floor(Math.random() * 50),
        aiSummary: 'Automatically generated cluster data.',
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };

      const snapshot = {
        issueId: id,
        title: issue.title,
        description: issue.description,
        category: category,
        status: status,
        location: issue.location,
        createdAt: new Date()
      };

      bulkIssues.push(issue);
      bulkSnapshots.push(snapshot);
    }

    await issues.insertMany(bulkIssues);
    await snapshots.insertMany(bulkSnapshots);

    console.log('✅ Successfully injected 150 issues into MongoDB.');
    console.log('🔥 Heatmap should now be clearly visible at localhost:3000/dashboard');

  } catch (err) {
    console.error('❌ Bulk Seeding Failed:', err);
  } finally {
    await authClient.close();
    await issueClient.close();
    await analyticsClient.close();
  }
}

run();
