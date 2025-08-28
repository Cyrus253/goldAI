import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AIChat from "@/components/ai-chat";
import GoldPriceCard from "@/components/gold-price-card";
import PortfolioCard from "@/components/portfolio-card";
import MarketTrendsCard from "@/components/market-trends-card";
import PurchaseModal from "@/components/purchase-modal";
import { Coins, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_USER_ID = "default-user-id";

export default function Home() {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const { data: goldPrice } = useQuery({
    queryKey: ["/api/gold-price"],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const { data: portfolio, refetch: refetchPortfolio } = useQuery({
    queryKey: ["/api/portfolio", DEFAULT_USER_ID],
  });

  const handlePurchaseSuccess = () => {
    refetchPortfolio();
    setIsPurchaseModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center">
                <Coins className="text-primary-foreground" size={16} />
              </div>
              <h1 className="text-xl font-bold text-foreground" data-testid="app-title">GoldAI</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-dashboard">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-portfolio">Portfolio</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-market">Market</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-history">History</a>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                <User className="mr-2" size={18} />
                <span data-testid="user-name"> Parag</span>
              </div>
              <Button variant="ghost" size="sm" className="md:hidden text-muted-foreground" data-testid="mobile-menu">
                <Menu size={18} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Gold Prices & Market Info */}
          <div className="lg:col-span-1 space-y-6">
            <GoldPriceCard goldPrice={goldPrice} />
            <MarketTrendsCard goldPrice={goldPrice} />
            <PortfolioCard portfolio={portfolio} />
          </div>

          {/* Center Column: AI Chat Interface */}
          <div className="lg:col-span-2">
            <AIChat 
              userId={DEFAULT_USER_ID}
              onPurchaseRequest={() => setIsPurchaseModalOpen(true)}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        {portfolio?.purchases && portfolio.purchases.length > 0 && (
          <div className="mt-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="recent-transactions-title">Recent Transactions</h3>
              <div className="space-y-3">
                {portfolio.purchases.map((transaction, index) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0" data-testid={`transaction-${index}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <Coins className="text-primary" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`transaction-type-${index}`}>Gold Purchase</p>
                        <p className="text-sm text-muted-foreground" data-testid={`transaction-date-${index}`}>
                          {new Date(transaction.createdAt || "").toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground" data-testid={`transaction-amount-${index}`}>+{parseFloat(transaction.goldQuantity || "0").toFixed(3)}g</p>
                      <p className="text-sm text-muted-foreground" data-testid={`transaction-value-${index}`}>₹{parseFloat(transaction.amountInvested || "0").toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
        goldPrice={goldPrice?.currentPrice || 10400}
        userId={DEFAULT_USER_ID}
      />
    </div>
  );
}
