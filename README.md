# Time Banking Skill Platform

Platform peer-to-peer skill exchange untuk pelajar menggunakan sistem Time Banking.

## 🎯 Konsep

**Time Banking**: Sistem ekonomi alternatif di mana WAKTU = MATA UANG
- 1 jam mengajar = 1 Time Credit
- 1 Time Credit = 1 jam belajar skill lain
- Semua skill dihargai sama
- No money involved, pure skill barter

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + Hooks

### Backend
- **Language**: Golang
- **Framework**: Gin
- **ORM**: GORM
- **Auth**: JWT
- **Database**: PostgreSQL (Supabase)

## 📁 Project Structure

```
timebankingskill/
├── backend/          # Golang API server
│   ├── cmd/          # Application entrypoints
│   ├── internal/     # Private application code
│   ├── pkg/          # Public libraries
│   └── migrations/   # Database migrations
├── frontend/         # Next.js application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/      # Utilities
│   │   └── types/    # TypeScript types
│   └── public/       # Static assets
└── docs/             # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL (or Supabase account)

### Backend Setup
```bash
cd backend
go mod download
go run cmd/server/main.go
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📋 Features

- ✅ User Authentication & Profile
- ✅ Skill Marketplace
- ✅ Time Credit System
- ✅ Booking & Session Management
- ✅ Rating & Review
- ✅ Gamification & Badges
- ✅ Community Features

## 👥 User Flow

### As Teacher (Earn Credits)
1. Register → Setup profile → List skills
2. Set availability
3. Receive & approve session requests
4. Teach → Confirm completion
5. Earn credits + ratings

### As Student (Spend Credits)
1. Browse marketplace
2. Find tutor → View profile & ratings
3. Request session → Wait approval
4. Attend session → Learn
5. Confirm & rate

## 🏆 Gamification

- **Badges**: Top Tutor, Quick Learner, Jack of All Trades
- **Leaderboard**: Top contributors, Best rated
- **Achievements**: Unlock bonus credits

## 📝 License

MIT License - see LICENSE file
