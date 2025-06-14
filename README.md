
# MagiCart 🛒

*Smart grocery price comparison for budget-conscious students*

## About the Creators

**Meidad Troper** | **Kelvin Mathew & Vaidic Soni**  
Computer Science Students at Texas State University (TXST)

## Our Story

As international students living in the United States, we've experienced firsthand how expensive daily life can be. While living costs here might be cheaper than some of our home countries, being on our own and managing tight budgets is genuinely challenging. Every dollar counts when you're a student trying to balance academics, living expenses, and dreams of a better future.

That's why we created **MagiCart** - a smart grocery price comparison tool that helps students and budget-conscious shoppers find the cheapest prices across all major grocery stores in their area.

## Breaking the Myth

There's a common misconception that eating healthy is a luxury only the wealthy can afford. Coming from developing countries, we know this isn't true. Fresh, nutritious food should be accessible to everyone, regardless of their economic situation. MagiCart helps prove that you can eat well without breaking the bank - you just need to know where to shop smart.

## What MagiCart Does

🔍 **Compare Prices** - Instantly compare grocery prices across major retailers  
🏪 **Multiple Stores** - Support for Walmart, H-E-B, Target, Kroger, Aldi, and Sam's Club  
🤖 **Smart Recommendations** - AI-powered suggestions based on price, quality, and convenience  
🛒 **Shopping Lists** - Build and manage your grocery lists with real-time pricing  
📱 **Mobile Friendly** - Responsive design that works on all devices  
💰 **Budget Tracking** - See your total savings and make informed decisions

## Technology Stack

### Frontend
- **React** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - Beautiful, accessible UI components

### Backend & Database
- **Supabase** - Open-source Firebase alternative
  - Authentication system
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)

### State Management & Data Fetching
- **TanStack Query (React Query)** - Powerful data synchronization
- **React Router DOM** - Client-side routing

### Icons & UI Elements
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library

### Development Tools
- **Lovable AI** - AI-powered development platform for rapid prototyping
- **ESLint** - Code linting and quality assurance

### Assets
- **Pexels** - Free stock photography
- **Unsplash** - High-quality free images
- **AI-generated content** - Custom product images and descriptions

## Features

### 🎯 Intelligent Price Comparison
- Real-time price tracking across multiple stores
- Smart algorithms that factor in quality ratings and store reviews
- Personalized recommendations based on shopping preferences

### 🛍️ Shopping Experience
- **Pickup Mode** - Find stores with the best curbside pickup experience
- **Delivery Mode** - Compare delivery fees and reliability
- **In-Store Mode** - Plan your in-person shopping trips

### 📊 Smart Analytics
- Store performance metrics (freshness, availability, service quality)
- Price trend analysis
- Savings tracking and budget insights

### 🔐 User Authentication
- Secure sign-up and login system
- Personal shopping lists and preferences
- Order history and favorite products

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd magicart
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create a .env file with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/           # Reusable UI components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API and business logic
├── types/               # TypeScript type definitions
├── integrations/        # Third-party integrations
└── lib/                 # Utility functions
```

## Our Mission

We built MagiCart because we believe that:
- **Smart shopping shouldn't be complicated** - Everyone deserves access to tools that help them save money
- **Healthy eating is a right, not a privilege** - Good nutrition should be affordable for students and families
- **Technology can solve real problems** - AI and modern web tools can make a genuine difference in people's daily lives

## Future Plans

- 📍 **Location-based pricing** - Prices based on your specific location
- 🚗 **Route optimization** - Plan the most efficient shopping trips
- 📱 **Mobile app** - Native iOS and Android applications
- 🤝 **Store partnerships** - Direct integration with retailer APIs
- 🌟 **Community features** - User reviews and price submissions

## Contributing

We welcome contributions from fellow students and developers! Feel free to:
- Report bugs and suggest features
- Submit pull requests
- Share your own money-saving tips
- Help us expand to more stores and locations

## Acknowledgments

Special thanks to:
- **Texas State University** for fostering innovation and providing resources
- **Lovable AI** for making rapid development possible
- **Supabase** for providing excellent backend services
- **The open-source community** for the amazing tools and libraries
- **Our fellow international students** who inspired this project

---

*Built with ❤️ by international students, for students everywhere*

**Contact Us:**
- GitHub: Meidad-T
- University: Texas State University
- Program: Computer Science

*"Making smart shopping accessible to everyone, one cart at a time."*
