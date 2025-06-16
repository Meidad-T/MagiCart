
# MagiCart 🛒

*Smart grocery price comparison for budget-conscious students*

## About the Creators

**Meidad Troper** | **Kelvin Mathew** | **Vaidic Soni**  
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

## AI Integration & Intelligence

MagiCart leverages advanced AI technology to provide personalized shopping experiences:

### 🧠 Google Gemini API Integration
Our built-in AI assistant powered by Google Gemini provides:
- **Personalized Health & Nutrition Advice** - Get tailored recommendations based on what's in your cart
- **Smart Store Selection** - Receive recommendations for store selection based on nearby locations, prices, and current deals
- **Meal Planning Assistance** - Plan meals based on dietary needs, allergies, and personal preferences in real-time
- **Budget Optimization** - AI analyzes your shopping patterns to suggest cost-effective alternatives
- **Nutritional Analysis** - Real-time analysis of your cart's nutritional value with improvement suggestions

### 🚀 Developed with Lovable AI
MagiCart was built using **Lovable**, an AI-powered development platform that enabled us to:
- Rapidly prototype and iterate on complex features
- Implement sophisticated AI integrations with minimal development overhead
- Create a polished, production-ready application in record time
- Focus on user experience while AI handled much of the technical implementation

This combination of Google Gemini for intelligent recommendations and Lovable for rapid development allowed us to create a feature-rich application that would typically require a much larger development team and significantly more time.

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
  - Edge Functions for server-side logic

### APIs & External Services
- **Google Gemini API** - Advanced AI for intelligent product recommendations and chat assistance
- **Google Places API** - Store location discovery and details
- **Google Maps API** - Interactive maps and location services
- **Google Geocoding API** - Address to coordinates conversion
- **Google Maps Datasets API** - Enhanced location data and mapping features
- **Firebase** - Additional backend services and real-time database

### State Management & Data Fetching
- **TanStack Query (React Query)** - Powerful data synchronization
- **React Router DOM** - Client-side routing

### Icons & UI Elements
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library

### Development Tools
- **Lovable AI** - AI-powered development platform for rapid prototyping and full-stack development
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

## Revenue Generation Strategy

### Sustainable Business Model
MagiCart is designed to remain **completely free for end users** while generating revenue through strategic partnerships and affiliate programs:

#### 🤝 Affiliate Partnerships
- **"Order at [Store Name]" Links** - Affiliate links that provide us with a small percentage of each order's total
- Commission-based revenue from major grocery chains
- Performance-based partnerships that incentivize quality service

#### 🏪 Store Partnerships & Premium Features
- **Featured Store Placement** - Premium positioning for grocery chains wanting increased consumer exposure
- **Weekly Flyer Integration** - Partnering with stores to showcase their weekly ads and special offers
- **Data Insights** - Providing anonymized consumer behavior insights to retail partners
- **Enhanced Store Profiles** - Premium store listings with additional features and visibility

#### 💡 Value Proposition for Partners
- **Increased Customer Acquisition** - Direct access to budget-conscious shoppers
- **Enhanced Brand Visibility** - Prominent placement on our platform
- **Competitive Intelligence** - Market positioning insights
- **Customer Retention** - Tools to improve customer loyalty through better pricing

This model ensures that MagiCart remains accessible to students and families while creating sustainable revenue streams that benefit all stakeholders - users save money, stores gain customers, and we maintain a high-quality, ad-free experience.

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
# Create a .env file with your API credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
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
- 🎯 **Personalized deals** - AI-curated offers based on shopping history

## Contributing

We welcome contributions from fellow students and developers! Feel free to:
- Report bugs and suggest features
- Submit pull requests
- Share your own money-saving tips
- Help us expand to more stores and locations

## Acknowledgments

Special thanks to:
- **Texas State University** for fostering innovation and providing resources
- **Lovable AI** for revolutionizing our development process and making rapid, sophisticated application development possible
- **Google Gemini** for providing the advanced AI capabilities that power our intelligent recommendations
- **Supabase** for providing excellent backend services
- **Google** for their comprehensive API ecosystem
- **The open-source community** for the amazing tools and libraries
- **Our fellow international students** who inspired this project

---

*Built with ❤️ by international students, for students everywhere*

**Contact Us:**
- GitHub: Meidad-T
- University: Texas State University
- Program: Computer Science

*"Making smart shopping accessible to everyone, one cart at a time."*
