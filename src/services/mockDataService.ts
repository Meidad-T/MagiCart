
// Mock service to simulate fetching product reviews and store data
export interface ProductReview {
  id: string;
  productName: string;
  rating: number;
  reviewCount: number;
  commonComplaints: string[];
  positiveAspects: string[];
  storeName: string;
}

export interface StoreMetrics {
  name: string;
  overallRating: number;
  deliveryReliability: number;
  productQuality: number;
  customerService: number;
  substitutionRate: number;
  avgDeliveryTime: number;
}

// Mock product reviews data
const mockProductReviews: ProductReview[] = [
  {
    id: "1",
    productName: "DiGiorno Rising Crust Three Meat Pizza",
    rating: 4.2,
    reviewCount: 1247,
    commonComplaints: ["too salty", "crust sometimes burnt"],
    positiveAspects: ["great taste", "easy to cook", "good value"],
    storeName: "walmart"
  },
  {
    id: "2",
    productName: "Great Value Chicken Alfredo Pasta",
    rating: 3.8,
    reviewCount: 892,
    commonComplaints: ["sauce consistency", "packaging issues"],
    positiveAspects: ["affordable", "decent taste", "convenient"],
    storeName: "walmart"
  },
  {
    id: "3",
    productName: "Stouffers Lasagna with Meat & Sauce",
    rating: 4.5,
    reviewCount: 2156,
    commonComplaints: ["small portion", "takes long to cook"],
    positiveAspects: ["authentic taste", "quality ingredients", "consistent"],
    storeName: "multiple"
  }
];

// Mock store metrics
const mockStoreMetrics: StoreMetrics[] = [
  {
    name: "Walmart",
    overallRating: 4.1,
    deliveryReliability: 0.89,
    productQuality: 3.9,
    customerService: 3.7,
    substitutionRate: 0.12,
    avgDeliveryTime: 45
  },
  {
    name: "H-E-B",
    overallRating: 4.6,
    deliveryReliability: 0.94,
    productQuality: 4.4,
    customerService: 4.5,
    substitutionRate: 0.08,
    avgDeliveryTime: 35
  },
  {
    name: "Target",
    overallRating: 4.3,
    deliveryReliability: 0.91,
    productQuality: 4.1,
    customerService: 4.2,
    substitutionRate: 0.10,
    avgDeliveryTime: 50
  },
  {
    name: "Kroger",
    overallRating: 3.9,
    deliveryReliability: 0.86,
    productQuality: 3.8,
    customerService: 3.9,
    substitutionRate: 0.15,
    avgDeliveryTime: 55
  },
  {
    name: "Aldi",
    overallRating: 4.4,
    deliveryReliability: 0.88,
    productQuality: 4.2,
    customerService: 3.8,
    substitutionRate: 0.18,
    avgDeliveryTime: 40
  },
  {
    name: "Sam's Club",
    overallRating: 4.0,
    deliveryReliability: 0.85,
    productQuality: 4.0,
    customerService: 3.8,
    substitutionRate: 0.14,
    avgDeliveryTime: 65
  }
];

export const fetchProductReviews = async (productNames: string[]): Promise<ProductReview[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  return mockProductReviews.filter(review => 
    productNames.some(name => name.toLowerCase().includes(review.productName.toLowerCase()))
  );
};

export const fetchStoreMetrics = async (): Promise<StoreMetrics[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));
  
  return mockStoreMetrics;
};

export const analyzeMarketTrends = async (storeNames: string[]): Promise<{
  trending: string[];
  priceVolatility: Record<string, number>;
  demandScore: Record<string, number>;
}> => {
  // Simulate complex market analysis
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 600));
  
  return {
    trending: ["H-E-B", "Target"],
    priceVolatility: {
      "Walmart": 0.12,
      "H-E-B": 0.08,
      "Target": 0.15,
      "Kroger": 0.18,
      "Aldi": 0.22,
      "Sam's Club": 0.10
    },
    demandScore: {
      "Walmart": 0.85,
      "H-E-B": 0.92,
      "Target": 0.78,
      "Kroger": 0.71,
      "Aldi": 0.88,
      "Sam's Club": 0.65
    }
  };
};
