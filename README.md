# User Directory & Management Application

A real-time user management dashboard built with modern **Angular (Zoneless + Signals)** and **Google Firebase (Firestore, Cloud Functions, and Hosting)**.

---

## 🚀 Key Features

* **Real-time User Synchronization**: Subscribes directly to the Firestore `users` collection for live data updates across all open clients.
* **User Creation**: Form to add users with `username` and `role` (`Admin`, `Manager`, `Editor`, `Viewer`), automatically stamping `createdAt` and `updatedAt` server timestamps.
* **Instant Search & Role Filtering**: Sub-millisecond client-side filtering by username and role using Angular computed signals.
* **User Management & Status Control**:
  * Inline status toggle (**Active** / **Disabled**).
  * Edit user modal to update username, role, or status.
* **Secure Cloud Function Deletion**: Destructive deletion is delegated strictly to a 2nd Gen Firebase Cloud Function (`deleteUser`) powered by the Firebase Admin SDK.
* **High-Performance UI**: Fast, responsive solid-surface SCSS design with zero rendering lag.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Angular (v21) | Standalone components with Zoneless Change Detection (`provideZonelessChangeDetection`) and Signals |
| **Database** | Cloud Firestore | Real-time NoSQL document store (`/users` collection) |
| **Serverless Backend** | Firebase Cloud Functions (v2) | TypeScript callable RPC function for audited document deletion |
| **Hosting** | Firebase Hosting | Production-grade CDN serving the compiled Single Page Application (SPA) |
| **Styling** | SCSS | Clean, responsive design system with role badges and modal dialogs |

---

## 📁 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── user.model.ts      # User and Role interfaces
│   │   ├── services/
│   │   │   └── user.service.ts    # Firestore CRUD & Cloud Function service
│   │   ├── app.ts                 # Main component logic & state signals
│   │   ├── app.html               # Main UI template
│   │   ├── app.scss               # Component styles
│   │   └── app.config.ts          # Zoneless Angular configuration
│   ├── environments/
│   │   ├── environment.ts         # Dev environment (imports from config.ts)
│   │   └── environment.prod.ts    # Prod environment (imports from config.ts)
│   ├── config.ts                  # Zod-validated Firebase config from process.env
│   ├── env.d.ts                   # TypeScript declarations for process.env
│   ├── index.html
│   ├── main.ts
│   └── styles.scss                # Global styles and resets
├── functions/
│   ├── src/
│   │   └── index.ts               # 2nd Gen 'deleteUser' Cloud Function
│   ├── package.json
│   └── tsconfig.json
├── firestore.rules                # Firestore security rules
├── firebase.json                  # Firebase Hosting, Functions & Firestore config
├── .env                           # Local environment variables (git-ignored)
├── .env.example                   # Example env file for new developers
└── README.md
```

---

## 💻 Getting Started (Local Development)

### 1. Prerequisites
* **Node.js**: `v20+` or `v22+`
* **Firebase CLI**: Install globally via `npm install -g firebase-tools`
* **Firebase Login**: Authenticate with `firebase login`

### 2. Installation
Install root dependencies:
```bash
npm install
```

Install Cloud Functions dependencies:
```bash
cd functions && npm install && cd ..
```

### 3. Environment Setup

Copy the example env file and populate it with your Firebase project credentials:
```bash
cp .env.example .env
```

Your `.env` file should look like:
```env
API_KEY=your_firebase_api_key
AUTH_DOMAIN=your_project_id.firebaseapp.com
PROJECT_ID=your_project_id
STORAGE_BUCKET=your_project_id.firebasestorage.app
MESSAGING_SENDER_ID=your_messaging_sender_id
APP_ID=your_app_id
MEASUREMENT_ID=your_measurement_id
```

> ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

The environment files (`environment.ts` / `environment.prod.ts`) import from `src/config.ts`, which validates all required variables using **Zod** at startup. If any variable is missing, you will get a clear validation error immediately.

### 4. Run the Application Locally

`npm start` uses Node's native `--env-file` flag to load `.env` before the Angular CLI starts:

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 🔒 Firestore Security Rules

The security rules ([`firestore.rules`](./firestore.rules)) enforce:
1. **Reads**: Allowed for the client app.
2. **Creates & Updates**: Allowed with schema validation on required fields (`username`, `role`, `status`).
3. **Deletions**: **Explicitly blocked on the client side (`allow delete: if false;`)**. All deletions must be routed through the serverless Cloud Function using the Firebase Admin SDK.

---

## 🚀 Deployment Guide

### Step 1: Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### Step 2: Deploy Firebase Cloud Functions
Ensure Blaze (pay-as-you-go) plan is active on your Firebase project, then deploy the `deleteUser` function:
```bash
firebase deploy --only functions
```

### Step 3: Build & Deploy Angular Hosting
Compile the production bundle (loads `.env` automatically) and deploy to Firebase Hosting:
```bash
npm run build
firebase deploy --only hosting
```

### Step 4: Deploy Everything Together
```bash
npm run build && firebase deploy
```

Once deployment completes, Firebase CLI will output your live Hosting URL (e.g. `https://<project-id>.web.app`).

---

## 🧪 Testing User Operations

1. **Add User**: Click **"+ Add User"**, type a name, choose a role, and click **"Create"**. The user will immediately appear in the list.
2. **Search**: Type in the search box to filter live by username or role.
3. **Toggle Status**: Click the status button on any row to toggle between **Active** and **Disabled**.
4. **Edit User**: Click **"Edit"** to modify the username, role, or status.
5. **Delete User**: Click **"Delete"** and confirm. The app invokes the `deleteUser` Cloud Function, which deletes the document via Admin SDK.
