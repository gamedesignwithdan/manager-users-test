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
| **Database** | Cloud Firestore | Real-time NoSQL document store (`/users` collection in `manage-users-db`) |
| **Serverless Backend** | Firebase Cloud Functions (v2) | TypeScript callable function for audited document deletion |
| **Hosting** | Firebase Hosting | Production-grade CDN serving the compiled Single Page Application (SPA) |
| **Styling** | SCSS | Clean, responsive design system with role badges and modal dialogs |

---

## 📁 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── user.model.ts      # User interface and types
│   │   ├── services/
│   │   │   └── user.service.ts    # Firestore CRUD & Cloud Function service
│   │   ├── app.ts                 # Main component logic & state signals
│   │   ├── app.html               # Main UI template
│   │   ├── app.scss               # Component styles
│   │   └── app.config.ts          # Zoneless Angular configuration
│   ├── environments/
│   │   ├── environment.ts         # Firebase configuration (development)
│   │   └── environment.prod.ts    # Firebase configuration (production)
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

### 3. Firebase Configuration

Firebase configuration is committed directly in `src/environments/environment.ts`. Firebase web API keys are public project identifiers — security is enforced entirely through Firestore security rules, not by keeping the config secret. This is [explicitly documented by Google](https://firebase.google.com/docs/projects/api-keys).

### 4. Run the Application Locally

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
