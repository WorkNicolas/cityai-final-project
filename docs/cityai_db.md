# CityAI — Database Architecture

CityAI employs a microservices architecture, which extends to its database strategy. To maintain loose coupling and optimize for different workloads, CityAI utilizes three separate MongoDB databases. 

---

## 1. Authentication Service Database (`cityai-auth`)
This database strictly manages user identity, access credentials, and roles.

**Collection:** `users`
**Mongoose Model:** `backend/auth-service/src/models/User.ts`

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary key. | Auto-generated |
| `email` | String | User's email address. | Required, Unique, Lowercase |
| `name` | String | Display name. | Required |
| `passwordHash` | String | Bcrypt hash of the user's password. | Optional (for OAuth) |
| `provider` | String | Identity provider ('local', 'google', 'github'). | Default: 'local' |
| `providerId` | String | Provider's unique ID for OAuth users. | Optional |
| `role` | String | Access control ('resident', 'staff', 'advocate'). | Default: 'resident' |
| `createdAt` | Date | Timestamp of account creation. | Auto-managed |
| `updatedAt` | Date | Timestamp of last update. | Auto-managed |

*Note: The `passwordHash` is protected via a Mongoose `pre('save')` hook that ensures passwords are never saved in plaintext.*

---

## 2. Issue Management Database (`cityai-issues`)
This is the core transactional database for the platform, storing the operational state of municipal reports and user notifications.

### **Collection:** `issues`
**Mongoose Model:** `backend/issue-service/src/models/Issue.ts`

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary key. | Auto-generated |
| `title` | String | Short summary of the report. | Required, Max 120 chars |
| `description` | String | Detailed description. | Required |
| `status` | String | Lifecycle state ('open', 'in-progress', 'resolved', 'closed').| Default: 'open' |
| `category` | String | AI-assigned classification (e.g., 'pothole', 'graffiti').| Default: 'other' |
| `location` | String | Human-readable address. | Required |
| `coordinates` | [Number] | `[longitude, latitude]` for mapping. | Optional |
| `photoUrl` | String | URL of uploaded photo. | Optional |
| `reportedBy` | String | User ID of the submitting resident. | Required |
| `assignedTo` | String | User ID of the assigned staff member. | Optional |
| `aiSummary` | String | Gemini-generated summary. | Optional |
| `upvotes` | Number | Community upvote count. | Default: 0 |
| `downvotes` | Number | Community downvote count. | Default: 0 |
| `comments` | Array | Nested community comments. | `[{userId, userName, text, createdAt}]` |
| `resolvedAt` | Date | Timestamp of resolution. | Optional |
| `createdAt` | Date | Submission timestamp. | Auto-managed |
| `updatedAt` | Date | Last modification timestamp. | Auto-managed |

*Indexes:* Indexed on `status`, `category`, and `reportedBy` for efficient dashboard queries.

### **Collection:** `notifications`
**Mongoose Model:** `backend/issue-service/src/models/Notification.ts`

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary key. | Auto-generated |
| `userId` | String | ID of the recipient user. | Required, Indexed |
| `type` | String | Alert type ('status_change', 'urgent_alert', 'community_update').| Required |
| `message` | String | Plain-language alert message. | Required |
| `isRead` | Boolean | Whether the user has dismissed the alert. | Default: false |
| `createdAt` | Date | Timestamp of alert generation. | Auto-managed |

---

## 3. Analytics & AI Database (`cityai_analytics`)
This database is optimized for AI workloads, large-scale data aggregation, and complex spatial queries without impacting the transactional performance of the core issue-service.

**Collection:** `issuesnapshots`
**Accessed by:** `backend/analytics-service/src/services/trendService.ts` and `scripts/bulk_seed.js`

*Note: Instead of using strict Mongoose schemas, the analytics service queries the raw MongoDB collection directly. It acts as a read-replica/event-store.*

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary key. |
| `issueId` | ObjectId | Reference to the original Issue ID in `cityai-issues`. |
| `title` | String | Copied issue title. |
| `description` | String | Copied issue description. |
| `category` | String | Copied category. |
| `status` | String | Copied status (normalized with hyphens). |
| `location` | String | Copied address string. |
| `resolvedAt` | Date | Copied resolution timestamp. |
| `createdAt` | Date | Original submission timestamp. |

**Purpose:**
- Used by LangGraph/Gemini to perform bulk text analysis for trend detection.
- Used to calculate application-wide metrics (like Resolution Efficiency and Sentiment).
- Serves bulk coordinate data for the incident heatmap.
