# QuizFlow

QuizFlow is an intelligent, interactive quiz platform built with Next.js. It leverages AI to generate engaging questions and provides actionable analytics to track user performance.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Features**: AI-powered question generation & interactive dashboard analytics

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env` file based on `.env.example` and fill in your database and AI API keys.

3. **Database Setup**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using QuizFlow!
