import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { goldAI } from "./services/langchain";
import { insertPurchaseSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

const GOLD_PRICE_PER_GRAM = 10310; // ₹10,310 per gram
const GST = 0.03; // 3% GST fee

export async function registerRoutes(app: Express): Promise<Server> {
  
  // AI Chat Interaction API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId = "default-user-id" } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Process message with GoldAI
      const aiResult = await goldAI.processMessage(message);
      
      // Store chat message
      await storage.createChatMessage({
        userId,
        message,
        response: aiResult.response,
        isInvestmentIntent: aiResult.hasInvestmentIntent.toString()
      });

      res.json({
        response: aiResult.response,
        hasInvestmentIntent: aiResult.hasInvestmentIntent,
        goldPrice: GOLD_PRICE_PER_GRAM
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Purchase API
  app.post("/api/purchase", async (req, res) => {
    try {
      const { amountInvested, userId = "default-user-id" } = req.body;
      
      if (!amountInvested || amountInvested < 10) {
        return res.status(400).json({ error: "Minimum investment amount is ₹10" });
      }

      const amount = parseFloat(amountInvested);
      const platformFee = amount * GST;
      const totalAmount = amount + platformFee;
      const goldQuantity = amount / GOLD_PRICE_PER_GRAM;

      const purchaseData = {
        userId,
        amountInvested: amount.toFixed(2),
        goldQuantity: goldQuantity.toFixed(6),
        pricePerGram: GOLD_PRICE_PER_GRAM.toFixed(2),
        platformFee: platformFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2)
      };

      // Validate purchase data
      const validatedPurchase = insertPurchaseSchema.parse(purchaseData);
      
      // Create purchase record
      const purchase = await storage.createPurchase(validatedPurchase);

      res.json({
        success: true,
        purchase,
        message: "Gold purchase completed successfully!"
      });

    } catch (error) {
      console.error("Purchase error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid purchase data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process purchase" });
    }
  });

  // Get user portfolio
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const purchases = await storage.getUserPurchases(userId);
      const totalGold = await storage.getUserTotalGold(userId);
      const totalInvested = purchases.reduce((sum, p) => sum + parseFloat(p.amountInvested || "0"), 0);
      const currentValue = totalGold * GOLD_PRICE_PER_GRAM;
      const totalGains = currentValue - totalInvested;
      const gainsPercentage = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

      res.json({
        totalGold: totalGold.toFixed(6),
        totalInvested: totalInvested.toFixed(2),
        currentValue: currentValue.toFixed(2),
        totalGains: totalGains.toFixed(2),
        gainsPercentage: gainsPercentage.toFixed(2),
        purchases: purchases.slice(0, 5) // Last 5 transactions
      });

    } catch (error) {
      console.error("Portfolio error:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Get current gold price and market data
  app.get("/api/gold-price", async (req, res) => {
    try {
      // Simulate some market fluctuation
      const basePrice = GOLD_PRICE_PER_GRAM;
      const variation = (Math.random() - 0.5) * 100; // ±₹50 variation
      const currentPrice = Math.round(basePrice + variation);
      const change24h = (variation / basePrice) * 100;

      res.json({
        currentPrice,
        change24h: change24h.toFixed(2),
        high24h: Math.round(currentPrice + Math.abs(variation) * 0.5),
        low24h: Math.round(currentPrice - Math.abs(variation) * 0.5),
        volume: "2.4M",
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error("Price fetch error:", error);
      res.status(500).json({ error: "Failed to fetch gold price" });
    }
  });

  // Get chat history
  app.get("/api/chat-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const history = await storage.getUserChatHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
