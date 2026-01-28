# antiresume

Showcase your digital footprint and real-world impact through genuine interactions, public wins, and concrete online evidence — not a traditional resume. Built for engineers, designers, and traders.

## Features

### Profile Management
- **Unique Usernames** - Create a public profile at `/:username`
- **Social Links** - Connect LinkedIn, Twitter, Instagram, and your personal website
- **Wallet Addresses** - Display EVM and Solana wallet addresses with copy-to-clipboard functionality

### Tweet Portfolio
- **Curate Your Work** - Add tweets that showcase your projects, wins, and testimonials
- **Custom Notes** - Add context to each tweet
- **Drag & Drop Reordering** - Arrange your portfolio in the order you want
- **Rich Embeds** - Full Twitter embeds with engagement metrics

### Public Profiles
- **Shareable URL** - Each user gets a public profile page viewable by anyone
- **Social Proof Display** - Show your tweets, social links, and wallet addresses
- **Clean Design** - Custom typography and color theme

### Authentication & Security
- **Clerk Authentication** - Secure sign-up and sign-in
- **Data Privacy** - Users can only modify their own data
- **Profile Reset** - Full control to delete your profile if needed

## Tech Stack

- Next.js 15 with Turbopack
- React 19
- TypeScript
- Supabase (PostgreSQL)
- Clerk Auth
- Tailwind CSS
- react-tweet for Twitter embeds

## Getting Started

Install dependencies:

```bash
npm install
```

Create your env file:

```bash
cp .env.example .env
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
