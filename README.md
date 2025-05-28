# Kanah Health

A comprehensive postnatal health companion platform designed specifically for mothers in Kenya. This Next.js application provides essential health services and support during the postnatal journey.

## Features

- **Symptom Checker**: Monitor and track postnatal symptoms
- **Baby Growth Tracking**: Track your baby's development milestones
- **Health Tips**: Access valuable health information and guidance
- **Consultations**: Schedule and manage healthcare consultations
- **Call Nurse**: Direct access to nursing support
- **Multi-language Support**: Available in multiple languages
- **User Authentication**: Secure login and signup system
- **Personalized Dashboard**: Track your health journey

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm (Package manager)
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone `https://github.com/ekirira22/kanah-health.git`
cd kanah-health
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
pnpm dev
```

The application will be available at `http://kanah-health.vercel.app`

## Available Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint for code linting

## Project Structure

```
kanah-health/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication related pages
│   ├── dashboard/         # User dashboard
│   ├── symptom-checker/   # Symptom checking feature
│   ├── health-tips/       # Health information
│   ├── consultations/     # Consultation management
│   ├── baby-growth/       # Baby growth tracking
│   └── call-nurse/        # Nurse calling feature
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
├── contexts/             # React context providers
├── styles/               # Global styles
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact info@kanah.health