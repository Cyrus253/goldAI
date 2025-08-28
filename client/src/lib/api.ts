import { apiRequest } from "./queryClient";

export interface ChatResponse {
  response: string;
  hasInvestmentIntent: boolean;
  goldPrice: number;
}

export interface PurchaseRequest {
  amountInvested: number;
  userId: string;
}

export interface PurchaseResponse {
  success: boolean;
  purchase: any;
  message: string;
}

export interface GoldPriceData {
  currentPrice: number;
  change24h: string;
  high24h: number;
  low24h: number;
  volume: string;
  lastUpdated: string;
}

export interface PortfolioData {
  totalGold: string;
  totalInvested: string;
  currentValue: string;
  totalGains: string;
  gainsPercentage: string;
  purchases: any[];
}

export const chatAPI = {
  sendMessage: async (message: string, userId: string): Promise<ChatResponse> => {
    const response = await apiRequest("POST", "/api/chat", { message, userId });
    return response.json();
  },

  getChatHistory: async (userId: string) => {
    const response = await apiRequest("GET", `/api/chat-history/${userId}`);
    return response.json();
  }
};

export const purchaseAPI = {
  createPurchase: async (data: PurchaseRequest): Promise<PurchaseResponse> => {
    const response = await apiRequest("POST", "/api/purchase", data);
    return response.json();
  }
};

export const goldPriceAPI = {
  getCurrentPrice: async (): Promise<GoldPriceData> => {
    const response = await apiRequest("GET", "/api/gold-price");
    return response.json();
  }
};

export const portfolioAPI = {
  getPortfolio: async (userId: string): Promise<PortfolioData> => {
    const response = await apiRequest("GET", `/api/portfolio/${userId}`);
    return response.json();
  }
};
