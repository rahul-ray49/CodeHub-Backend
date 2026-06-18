# CodeHub 🚀

CodeHub is a LeetCode-inspired coding platform built using Node.js, Express.js, MongoDB, Redis, and Judge0 API. The platform allows users to solve coding problems, execute code in multiple programming languages, and receive real-time evaluation results based on hidden and visible test cases.

---

## Features

### Authentication & Security

* User Registration and Login
* JWT-Based Authentication
* Cookie-Based Session Management
* Redis Token Blacklisting for Secure Logout
* Role-Based Access Control (Admin/User)

### Problem Management

* Create Coding Problems
* Update Existing Problems
* Delete Problems
* Difficulty Levels (Easy, Medium, Hard)
* Topic-Based Tags
* Starter Code Templates
* Multi-Language Reference Solutions

### Online Judge System

* Judge0 API Integration
* Multi-Language Code Execution
* Batch Test Case Evaluation
* Hidden and Visible Test Cases
* Real-Time Code Execution

### Submission Tracking

* Runtime Analysis
* Memory Usage Tracking
* Accepted / Wrong Answer / Runtime Error Verdicts
* Submission History
* Solved Problems Tracking

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis

### Security

* JWT (JSON Web Tokens)
* Bcrypt
* Cookie Parser

### External Services

* Judge0 API

---

## Project Architecture

```text
Client
   │
   ▼
Express Server
   │
   ▼
Authentication Layer
   │
   ▼
Problem Management Service
   │
   ▼
Judge0 API
   │
   ▼
MongoDB + Redis
```

---

## Database Models

### User

* firstName
* lastName
* emailId
* role
* password
* problemSolved

### Problem

* title
* description
* difficulty
* tags
* visibleTestCases
* hiddenTestCases
* startCode
* referenceSolution

### Submission

* userId
* problemId
* code
* language
* status
* runtime
* memory
* testCasesPassed
* testCasesTotal

---

## API Endpoints

### Authentication

```http
POST /user/register
POST /user/login
POST /user/logout
POST /user/admin/register
DELETE /user/deleteProfile
```

### Problem Management

```http
POST /problem/create
PUT /problem/update/:id
DELETE /problem/delete/:id

GET /problem/problemById/:id
GET /problem/getAllProblem
GET /problem/problemSolvedByUser
```

### Submission

```http
POST /submit/run/:id
POST /submit/submit/:id
```

---

## Installation

```bash
git clone <repository-url>

cd CodeHub

npm install

npm start
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=
DB_CONNECT_STRING=
JWT_SECRET=
REDIS_PASS=
REDIS_HOST=
JUDGE0_APIKEY=
```

---

## Future Scope

* Contest Module
* Global Leaderboard
* Editorial Solutions
* AI-Based Code Review
* Discussion Forum
* User Profiles and Rankings

---

## License

MIT License
