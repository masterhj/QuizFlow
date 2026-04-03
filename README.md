# QuizFlow

A comprehensive full-stack adaptive quiz platform with spaced repetition, AI-powered content generation, and role-based learning analytics.

## 🎯 Features

### For Students
- **Interactive Quiz Taking**: Full-screen immersive quiz interface with real-time timer and progress tracking
- **Spaced Repetition**: SM-2 algorithm-powered review system with intelligent scheduling
- **Performance Analytics**: Detailed dashboards with mastery tracking, performance trends, and weak area identification
- **Adaptive Difficulty**: Questions adjust based on user performance
- **Achievement System**: XP points, streaks, and progress badges
- **Multi-format Questions**: Multiple choice, short answer, and fill-in-the-blank support

### For Teachers
- **Quiz Creation Wizard**: 3-step intuitive interface to create quizzes manually or with AI assistance
- **AI Content Generation**: Claude-powered automatic question and topic generation from prompts
- **Analytics Dashboard**: Monitor student progress, identify struggling learners, and track class performance
- **Quiz Management**: Full CRUD operations with version control and analytics per quiz
- **Student Performance Tracking**: Individual performance reports and class-wide analytics

### Core Features
- **Dark Mode Support**: Full theme support with next-themes
- **Real-time Feedback**: Immediate answer evaluation with score calculations
- **Secure Authentication**: NextAuth v5 with credentials and OAuth support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript coverage for frontend and backend
- **Database Persistence**: PostgreSQL with Prisma ORM

## 🛠 Tech Stack

### Frontend
- **Next.js 15**: Full-stack React framework with App Router
- **React 19**: Latest React features with concurrent rendering
- **TypeScript 5**: Strict static typing
- **Tailwind CSS v4**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Data visualization for analytics
- **CVA**: Component Variant Authority for variant management
- **Lucide React**: Beautiful SVG icons

### Backend
- **Next.js API Routes**: Serverless backend functions
- **Prisma 6**: ORM with PostgreSQL
- **NextAuth v5**: Authentication with JWT and OAuth
- **bcryptjs**: Password hashing and security
- **Zod**: Runtime schema validation

### AI & External Services
- **Anthropic Claude**: AI-powered content generation with streaming
- **next-themes**: Theme management

### Database
- **PostgreSQL**: Relational database
- **Prisma**: Database client and migrations

## 📋 Prerequisites

- **Node.js**: v20 or higher
- **npm or pnpm**: Package manager
- **PostgreSQL**: Database (local or cloud)
- **Git**: Version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/quizflow.git
cd quizflow
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quizflow"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Optional: Seed database with sample data
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
quizflow/
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── dashboard/page.tsx     # Student/teacher dashboards
│   │   ├── quiz/
│   │   │   ├── [id]/page.tsx      # Quiz detail
│   │   │   ├── [id]/attempt/page.tsx
│   │   │   └── [id]/results/page.tsx
│   │   ├── analytics/page.tsx     # Analytics dashboard
│   │   ├── create/page.tsx        # Quiz creation wizard
│   │   ├── review/page.tsx        # Spaced repetition review
│   │   └── settings/page.tsx      # User settings
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...]nextauth/route.ts
│   │   │   └── register/route.ts
│   │   ├── quiz/
│   │   │   ├── create/route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── submit/route.ts
│   │   ├── analytics/route.ts
│   │   ├── ai/
│   │   │   └── generate/route.ts
│   │   ├── review/route.ts
│   │   └── user/
│   │       └── profile/route.ts
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── nav-bar.tsx
│   │   └── profile-dropdown.tsx
│   ├── quiz/
│   │   ├── quiz-card.tsx
│   │   ├── quiz-attempt-client.tsx
│   │   ├── quiz-results-client.tsx
│   │   ├── quiz-create-wizard.tsx
│   │   └── score-reveal.tsx
│   ├── analytics/
│   │   ├── performance-chart.tsx
│   │   └── stats-card.tsx
│   └── ui/                        # Base UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── modal.tsx
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── prisma.ts                  # Prisma client
│   ├── validations.ts             # Zod schemas
│   └── utils.ts                   # Utility functions
├── types/
│   └── index.ts                   # TypeScript types
├── prisma/
│   └── schema.prisma              # Database schema
├── .env.local                     # Environment variables (not in git)
├── next.config.ts                 # Next.js configuration
└── tailwind.config.ts             # Tailwind configuration
```



## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📝 Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run type-check      # Run TypeScript type checking
npm run db:push         # Push schema changes to database
npm run db:migrate      # Create database migration
npm run db:seed         # Seed database with sample data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Himanshu Jaiswal** - Initial implementation

## 🙏 Acknowledgments

- Next.js documentation and community
- Prisma for excellent ORM
- Tailwind CSS for utility framework
- All open-source contributors

## 📞 Support

For support, email support@quizflow.app or open an issue on GitHub.
