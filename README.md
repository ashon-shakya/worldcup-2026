# CupQuest - World Cup 2026 Prediction App

CupQuest is a comprehensive web application designed for organizing and playing prediction leagues for the FIFA World Cup 2026. Users can predict match scores, compete in leaderboards, and track their progress throughout the tournament.

## 🚀 Key Features

### For Players
- **Match Predictions:** Predict scores for all World Cup matches.
- **Dynamic Scoring:** Points are awarded for:
  - Correct Score (Home & Away)
  - Correct Outcome (Win/Loss/Draw)
  - Penalty Shootout Accuracy (Knockout Stages)
- **Knockout Penalty Prediction:**
  - If you predict a **DRAW** in a knockout match, you can predict if it will go to penalties.
  - Choose the **Penalty Winner** to earn bonus points (coming soon).
- **Leagues:** Create or join private leagues to compete with friends.
- **Leaderboards:** Global and league-specific rankings.
- **Match Schedule:**
  - View matches sorted by latest first (Finals at top).
  - Clear indicators for match winners, including penalty shootout results.
  - Live status updates.

### For Administrators
- **Match Management:**
  - Create, edit, and delete matches.
  - Update scores and set status (Scheduled, Live, Finished).
  - **Penalty Outcomes:** Record if a match went to penalties and select the penalty winner.
  - **Cascade Deletion:** Deleting a match automatically removes all associated predictions.
- **User Management:**
  - View all registered users.
  - Promote/Demote users to Admin.
  - Delete users.
  - Search, filter, and sort users by role, join date, etc.
- **System Settings:**
  - Configure point values for correct scores, outcomes, and penalty predictions dynamically via the dashboard.

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB (w/ Mongoose)
- **Authentication:** Auth.js (NextAuth)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Validation:** Zod

## 📦 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Recent Updates

- **Penalty Prediction Enhancements:** Users can now predict the specific winner of a penalty shootout if they predict a draw in knockout rounds.
- **Data Integrity:** Strict validation ensures penalty predictions are only possible for draw scores.
- **Admin UI Polish:** Improved clarity in Admin Dashboard with standard styles (white inputs, black text) and icon-based actions.
- **Schedule Sort:** Matches are now displayed in reverse chronological order (Latest first).

## 🔒 Environment Variables

Create a `.env.local` file with the following:

```env
MONGODB_URI=...
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
