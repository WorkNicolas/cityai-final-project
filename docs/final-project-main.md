# COMP-308 Emerging Technologies

## Group Project – CivicCase: AI-Powered Local Issue Tracker

**Due Date:** Group presentation and demonstration in Week 14

## Purpose

The purpose of this project is to:

- Design and code web apps using emerging web frameworks
- Build a GraphQL API using Apollo Server & Express or Next.js
- Build a Front-End (React 19 or Svelte) that utilizes the GraphQL API
- Apply appropriate design patterns and principles
- Use Deep Learning & Generative AI to make intelligent use of data

## References

Read the reference textbooks, lecture slides, class examples, and additional references provided here. This material provides the necessary information to complete the project. You may need to read and use more materials and tools to implement a good solution.

## General Instructions

- This project may be completed in groups of 4 to 5 students.
- This project can be replaced with your capstone project (COMP-231 or COMP-313), if you use and implement the same front-end/back-end technologies shown in this document.
- You will have to present and demonstrate your solution in Week 14 and upload the solution on Luminate course shell.
- Bonus marks will be given if you also publish the app on Heroku, Microsoft Azure, Amazon, or another cloud platform.
- Your VS Code project should be named `YourGroupNameCOMP308Project` and should be zipped in a file `YourGroupNameCOMP308Project.zip`.

---

# Project Specifications for Software Engineering Technology Students

Your client, a Canadian municipality, wants an AI-driven web app that helps residents report, track, and resolve local community issues such as potholes, broken streetlights, flooding, or safety hazards. The application should allow residents to submit reports, city staff to manage them, and AI to power an agentic chatbot for natural language queries. In addition, AI services will provide summarization, classification, and trend insights.

## User Registration / Login

Use JWT authentication or OAuth for Google/GitHub sign-in.

## User Roles

- **Resident:** Submit and track issues.
- **Municipal Staff:** Manage and update issues.
- **Community Advocate (Optional):** Monitor trends and support residents.

## Core Features (Choose at least 3)

### For Residents
- **Issue Reporting & Tracking** - Submit issues with geotag and photo, track status; AI categorization.
- **Notifications & Alerts** - Real-time updates and urgent neighborhood alerts.

### For Municipal Staff
- **Issue Management Dashboard** - Assign and update issues, AI-based triage.
- **Analytics & Insights** - Heatmap, backlog tracking, AI trend detection.

### For Community Advocates
- **Engagement Tools** - Comment, upvote, volunteer coordination.

## Backend Requirements

- **Database:** MongoDB for document-based storage.
- **API:** GraphQL implemented with Express.js or Next.js.
- **Microservices Architecture (at least 3):**
  - User Authentication Service (handles login, registration).
  - Issue Management Service: stores and updates reported issues, tracks issue status, sends urgent alerts.
  - Analytics and AI Service: powers the agentic chatbot (LangGraph + Gemini) for natural language queries, classifies and summarizes issues with AI, detects trends, and provides dashboards and insights.
  - **Optional Community Engagement Service:** enables comments and upvotes, supports volunteer matching, summarizes community discussions.

## Frontend Requirements

Choose from:

- React 19.2 or higher, using functional components
- Next.js 15.5 or higher
- Svelte 5 or higher

You may use a Micro Frontends Approach for modular UI components.

Suggested modules:
- Authentication & User Management micro frontend
- Issue Reporting & Tracking
- Analytics & Administration

Teams may reorganize modules if justified.

## AI Integrations

The Gemini API can be used for all these features.

### Agentic Chatbot (LangGraph + Gemini)

Each team must build an agentic chatbot (LangGraph + Gemini) tailored to their civic focus area. The chatbot must support basic Q&A about issues (open, resolved, trends) and at least one specialized capability (e.g., safety alerts, accessibility queries, sustainability tips, volunteer matching).

### Optional Extensions
- **AI Summarization:** auto-generates concise summaries of long discussions or issue threads.
- **Classification & Triage:** categorizes new reports and suggests appropriate handling.
- **Trend Detection:** identifies clusters of similar issues and emerging patterns.
- **Sentiment Analysis:** analyzes resident feedback and staff responses for tone and satisfaction.

## UI & Design

- Use Tailwind CSS or React Bootstrap for styling.
- Responsive web design to support all device sizes.

## Flexibility Clause

- Teams must document the chosen civic focus (e.g., flooding, accessibility, mobility).
- At least 70% of requirements must align with specs.
- Up to 30% may be customized (roles, features, AI modules).
- The chatbot is mandatory and cannot be omitted.

## Mark Value

**100 marks**

---

# Evaluation of Software Solution for Each Component

All items need to be shown during the group presentation.

| Evaluation Component | Weight |
|---|---:|
| User registration/login | 10 |
| Issue Reporting & AI Categorization | 5 |
| Notifications & Alerts | 10 |
| Issue Management Dashboard | 10 |
| Agentic Chatbot (LangGraph + Gemini) | 10 |
| Analytics & AI Insights | 5 |
| MongoDB Database (Document Modeling) | 5 |
| GraphQL API Implementation (Express.js or Next.js) | 10 |
| Frontend Implementation (React, Next.js, or Svelte) | 15 |
| UI/UX Design & Responsiveness | 5 |
| Community Problem Alignment | 5 |
| Project Presentation according to presentation guidelines | 10 |

---

# Evaluation Rubric with Criteria and Level of Achievement

| Criteria | Failure to Minimal | Satisfactory | Good to Excellent | Excellent to Outstanding |
|---|---|---|---|---|
| MongoDB database (proper use of document structure/model) | Incorrect model, errors. | Model has some missing or incorrect fields. | Model has the correct fields, some constraints are missing. | Excellent design and implementation of the document model. |
| GraphQL API design and implementation | Incomplete design or implementation of most CRUD functionalities, errors. | Some functionalities are missing or have errors. | The design and implementation of functionalities is correct. | Excellent GraphQL API design as per specs, with excellent use of design patterns. |
| Front-end design and implementation | Incomplete front-end, most components are not implemented, errors. | The design does not follow specs and UI is not friendly. Some elements are not aligned. Some components have errors. | The design mostly follows the specs. UI is not very friendly. | Excellent design and implementation of components, very friendly UI. |
| Friendliness and use of naming guidelines for functional components, variables, methods, comments | No use of naming guidelines in most components. | Some functional components, methods, variables are not named correctly. | Most functional components, methods, variables are named correctly. | Excellent use of naming guidelines. |
| Intelligent use of symptoms or other data using deep learning | Not implemented. | Does not work properly. | The AI implementation is mostly correct. | Correct implementation and excellent use of AI, efficient model, and high accuracy. |

---

# References

- https://docs.mongodb.com/manual/data-modeling/
- https://expressjs.com/en/5x/api.html
- http://mongoosejs.com/docs/guide.html
- https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs
- https://react.dev/
- https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
- https://svelte.dev/
- https://nextjs.org/
- https://www.tensorflow.org/js/
- https://www.tensorflow.org/js/tutorials
- https://www.llamaindex.ai/
- https://js.langchain.com/docs/introduction/
- https://langchain-ai.github.io/langgraphjs/
- https://platform.openai.com/docs/overview
- https://ai.google.dev/gemini-api/docs#javascript
- https://ai.google.dev/prompts/sentiment-analysis
- https://dev.to/rutamhere/sentiment-analysis-app-using-gemini-ahp
- https://habr.com/en/articles/764692/
- https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/Building_up_a_basic_demo_with_Three.js
