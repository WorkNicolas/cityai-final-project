# comment_standards.md
# CityAI — Comment Standards

> **Security Note:** Do not use the `cors` npm package directly in any microservice.
> Instead, use `helmet` for HTTP security headers and rely on the **Vite proxy** in the
> host microfrontend to route all API requests, eliminating cross-origin issues entirely.
> If an endpoint must be externally accessible, whitelist origins manually via
> `helmet` configuration — never use a wildcard `cors()` middleware.

This document defines the standardized comment format used throughout the CityAI project.
All JavaScript/TypeScript files (frontend and backend) must follow these conventions.

---

## Table of Contents

1. [File Header Format](#file-header-format)
2. [Table of Contents Block](#table-of-contents-block)
3. [Class Documentation](#class-documentation)
4. [Method/Function Documentation](#methodfunction-documentation)
5. [Property/Field Documentation](#propertyfield-documentation)
6. [Enum Documentation](#enum-documentation)
7. [GraphQL Resolver Documentation](#graphql-resolver-documentation)
8. [Route Documentation (Backend)](#route-documentation-backend)
9. [Version Tracking](#version-tracking)
10. [Examples](#examples)

---

## File Header Format

Every file must start with a file header block using JSDoc-style comments.

### Format

```js
/** frontend/host/src/App.tsx
 * @file App.tsx
 * @description Brief description of the file's purpose.
 * @author Carl Nicolas Mendoza
 * @since YYYY-MM-DD
 * @updated YYYY-MM-DD - Brief description of changes.
 * @version X.X.X
 */
```

### Fields

| Field          | Description                                  | Example                                      |
|----------------|----------------------------------------------|----------------------------------------------|
| `@file`        | The filename (basename only)                 | `App.tsx`                                    |
| `@description` | One-sentence purpose of the file             | `Shell application that lazy-loads MFEs.`    |
| `@author`      | Author's full name                           | `Carl Nicolas Mendoza`                       |
| `@since`       | Initial creation date (YYYY-MM-DD)           | `2026-04-20`                                 |
| `@updated`     | Last modification date with change summary   | `2026-04-20 - Added analytics MFE route.`    |
| `@version`     | Semantic version number                      | `0.1.0`                                      |

### Example

```js
/** backend/auth-service/src/index.ts
 * @file index.ts
 * @description Apollo Server entry point for the User Authentication microservice.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Added JWT cookie strategy.
 * @version 0.1.0
 */
```

---

## Table of Contents Block

Immediately after the file header, include a Table of Contents block.

### Format

```js
/**
 * Table of Contents
 * - Imports
 * - Classes
 *   - ClassName
 *     - Constructor
 *     - Properties
 *     - Methods
 *       - methodName
 * - Resolvers
 *   - Query
 *   - Mutation
 * - Exports
 */
```

### Structure Categories

Use these categories as appropriate:

- **Imports** — Import statements
- **Classes** — Class definitions
- **Resolvers** — GraphQL Query and Mutation resolvers
- **Routes** — Express route definitions
- **Constants** — Constant definitions
- **Enums** — Enum definitions
- **Helper Functions** — Private/utility functions
- **Providers** — React context or state providers
- **Exports** — Module exports

### Example (Backend Resolver)

```js
/**
 * Table of Contents
 * - Imports
 * - Resolvers
 *   - Query
 *     - getIssue
 *     - listIssues
 *   - Mutation
 *     - createIssue
 *     - updateIssueStatus
 * - Exports
 */
```

### Example (Frontend Component)

```js
/**
 * Table of Contents
 * - Imports
 * - Types
 *   - IssueDashboardProps
 * - Components
 *   - IssueDashboard
 *     - render
 * - Exports
 */
```

---

## Class Documentation

Every class must have a documentation block immediately before its declaration.

### Format

```js
/**
 * ClassName
 * @description Detailed description of the class purpose and behavior.
 * @param paramName Description (if class has constructor parameters).
 */
```

### Example

```js
/**
 * IssueService
 * @description Service class that handles CRUD operations for municipal issues in MongoDB.
 * Interfaces with Mongoose and provides data to GraphQL resolvers.
 */
class IssueService {
  // ...
}
```

---

## Method/Function Documentation

Every method and function must be documented.

### Format

```js
/**
 * functionName
 * @description What the function does.
 * @param {Type} paramName - Description of parameter.
 * @returns {Type} Description of return value.
 * @throws {ErrorType} When this error is thrown.
 */
```

### Tags

| Tag            | Usage                                 | Example                                              |
|----------------|---------------------------------------|------------------------------------------------------|
| `@description` | Required. What the function does.     | `@description Classifies a submitted issue via AI.`  |
| `@param`       | For each parameter.                   | `@param {string} issueId - The MongoDB document ID.` |
| `@returns`     | Return value description.             | `@returns {Promise<Issue>} The updated issue.`       |
| `@throws`      | Exception conditions.                 | `@throws {Error} If the issue is not found.`         |

### Example (Resolver)

```js
/**
 * createIssue
 * @description GraphQL mutation resolver that creates a new municipal issue report,
 * runs AI categorization via Gemini, and stores the result in MongoDB.
 * @param {Object} _ - Unused parent resolver value.
 * @param {Object} args - Mutation arguments.
 * @param {string} args.title - Title of the reported issue.
 * @param {string} args.description - Detailed description of the issue.
 * @param {string} args.location - Geotag or address string.
 * @param {Object} context - Apollo context containing the authenticated user.
 * @returns {Promise<Issue>} The newly created issue document.
 * @throws {AuthenticationError} If the user is not authenticated.
 */
async function createIssue(_, args, context) {
  // ...
}
```

### Example (React Component)

```js
/**
 * IssueCard
 * @description Renders a summary card for a single municipal issue including
 * its status badge, category, and submission date.
 * @param {IssueCardProps} props - Component props.
 * @param {string} props.title - Issue title.
 * @param {string} props.status - Current status (open, in-progress, resolved).
 * @param {string} props.category - AI-assigned category label.
 * @returns {JSX.Element} The rendered issue card.
 */
function IssueCard({ title, status, category }: IssueCardProps): JSX.Element {
  // ...
}
```

---

## Property/Field Documentation

Every class property and schema field must be documented.

### Format

```js
/**
 * propertyName
 * @description Description of what this property stores.
 */
```

### Example

```js
/**
 * status
 * @description Current lifecycle status of the issue.
 * One of: 'open', 'in-progress', 'resolved', 'closed'.
 */
status: String;

/**
 * aiCategory
 * @description Category label assigned by the Gemini AI classification service.
 * Examples: 'pothole', 'streetlight', 'flooding', 'safety-hazard'.
 */
aiCategory: String;
```

---

## Enum Documentation

Document enums with descriptions for the enum and each value.

### Format

```js
/**
 * EnumName
 * @description What the enum represents.
 * - value1: Description
 * - value2: Description
 */
```

### Example

```js
/**
 * IssueStatus
 * @description Enum representing the lifecycle states of a municipal issue report.
 * - open: Newly submitted, not yet reviewed by staff.
 * - inProgress: Assigned to municipal staff and being actioned.
 * - resolved: Issue has been fixed and confirmed.
 * - closed: Issue closed without resolution (duplicate or invalid).
 */
enum IssueStatus {
  open = 'open',
  inProgress = 'in-progress',
  resolved = 'resolved',
  closed = 'closed',
}
```

---

## GraphQL Resolver Documentation

Document GraphQL type definitions and resolvers with their operation type, arguments, and return type.

### Format

```js
/**
 * QUERY/MUTATION operationName
 * @description What this resolver does.
 * @param {Type} args.argName - Description.
 * @returns {Type} Description of return value.
 */
```

### Example

```js
/**
 * QUERY listIssues
 * @description Returns a paginated list of municipal issues, optionally filtered by status or category.
 * @param {string} [args.status] - Optional status filter.
 * @param {string} [args.category] - Optional AI category filter.
 * @param {number} [args.limit] - Maximum number of results (default: 20).
 * @returns {Promise<Issue[]>} Array of matching issue documents.
 */

/**
 * MUTATION updateIssueStatus
 * @description Allows municipal staff to update the status of an existing issue.
 * Sends a real-time notification to the reporting resident on status change.
 * @param {string} args.issueId - The MongoDB document ID of the issue.
 * @param {IssueStatus} args.status - The new status to assign.
 * @returns {Promise<Issue>} The updated issue document.
 * @throws {AuthenticationError} If the caller does not have the 'staff' role.
 */
```

---

## Route Documentation (Backend)

Document Express routes with HTTP method, path, and response shape.

### Format

```js
/**
 * HTTP_METHOD /path
 * @description What the endpoint does.
 * @param {Type} req.body.field - Description.
 * @returns {Type} Response description.
 */
```

### Example

```js
/**
 * POST /graphql
 * @description Apollo Server GraphQL endpoint for the Issue Management microservice.
 * Requires a valid JWT in the HTTP-only cookie set by the auth-service.
 * @param {Object} req - Express request object.
 * @param {Object} req.cookies.token - JWT used to authenticate the request.
 * @returns {Object} GraphQL response payload.
 */
```

---

## Version Tracking

### Version Numbering

Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to the API or schema.
- **MINOR**: New features (backwards compatible).
- **PATCH**: Bug fixes or comment updates.

### When to Update

| Change Type              | Update `@updated` | Update `@version` |
|--------------------------|:-----------------:|:-----------------:|
| Adding comments          | Yes               | Yes (patch)       |
| New fields/methods       | Yes               | Yes (minor)       |
| Bug fixes                | Yes               | Yes (patch)       |
| Breaking schema changes  | Yes               | Yes (major)       |
| Minor refactoring        | Optional          | Optional          |

---

## Examples

### Complete Backend File (GraphQL Resolver)

```js
/** backend/issue-service/src/graphql/resolvers.ts
 * @file resolvers.ts
 * @description GraphQL resolvers for the Issue Management microservice.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Added AI categorization call on createIssue.
 * @version 0.2.0
 */

/**
 * Table of Contents
 * - Imports
 * - Resolvers
 *   - Query
 *     - getIssue
 *     - listIssues
 *   - Mutation
 *     - createIssue
 *     - updateIssueStatus
 * - Exports
 */

import { IssueService } from '../services/issueService';

const resolvers = {
  Query: {
    /**
     * getIssue
     * @description Fetches a single issue by its MongoDB document ID.
     * @param {Object} _ - Unused parent resolver value.
     * @param {Object} args - Query arguments.
     * @param {string} args.id - The issue document ID.
     * @returns {Promise<Issue>} The matching issue document.
     * @throws {Error} If no issue is found with the provided ID.
     */
    getIssue: async (_, { id }) => {
      return IssueService.findById(id);
    },
  },
  Mutation: {
    /**
     * createIssue
     * @description Creates a new municipal issue and triggers Gemini AI categorization.
     * @param {Object} _ - Unused parent resolver value.
     * @param {Object} args - Mutation arguments.
     * @param {string} args.title - Issue title.
     * @param {string} args.description - Detailed description.
     * @param {string} args.location - Geotag or address string.
     * @param {Object} context - Apollo context with authenticated user.
     * @returns {Promise<Issue>} The created issue document.
     * @throws {AuthenticationError} If the user is not authenticated.
     */
    createIssue: async (_, args, context) => {
      return IssueService.create(args, context.user);
    },
  },
};

export default resolvers;
```

### Complete Frontend File (React Component)

```tsx
/** frontend/issue-mfe/src/components/IssueCard.tsx
 * @file IssueCard.tsx
 * @description Reusable card component that displays a summary of a municipal issue report.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Added AI category badge.
 * @version 0.1.1
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - IssueCardProps
 * - Components
 *   - IssueCard
 * - Exports
 */

import React from 'react';

/**
 * IssueCardProps
 * @description Props accepted by the IssueCard component.
 */
interface IssueCardProps {
  /**
   * title
   * @description The title of the municipal issue.
   */
  title: string;

  /**
   * status
   * @description Current status of the issue.
   */
  status: 'open' | 'in-progress' | 'resolved' | 'closed';

  /**
   * category
   * @description AI-assigned category label.
   */
  category: string;
}

/**
 * IssueCard
 * @description Renders a summary card for a single municipal issue including
 * its status badge, category, and title.
 * @param {IssueCardProps} props - Component props.
 * @returns {JSX.Element} The rendered issue card.
 */
function IssueCard({ title, status, category }: IssueCardProps): JSX.Element {
  return (
    <div className="issue-card">
      <h3>{title}</h3>
      <span className={`badge badge-${status}`}>{status}</span>
      <span className="category">{category}</span>
    </div>
  );
}

export default IssueCard;
```

---

## Quick Reference

### Minimum Required Comments Per File

- [ ] File header block (`@file`, `@description`, `@author`, `@since`, `@updated`, `@version`)
- [ ] Table of Contents block
- [ ] Class or component documentation
- [ ] Method/function documentation for every exported function
- [ ] Property documentation for every interface field or class property

### Comment Style Rules

- Use `/** */` for all documentation comments (JSDoc style).
- Use `//` for inline explanations within function bodies (sparingly).
- Never use `/* */` (C-style block comments).
- Never use `///` triple-slash comments.

### File Path in Header

Include the full monorepo-relative path in the first line:

```js
/** backend/auth-service/src/graphql/resolvers.ts
/** frontend/host/src/App.tsx
/** frontend/shared/design-tokens.css
```

---

*These standards apply to all code in the CityAI project. All new files must follow this format.*
