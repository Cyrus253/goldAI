import { ArrowUp, ArrowDown } from "lucide-react";

interface GoldPriceCardProps {
  goldPrice?: {
    currentPrice: number;
    change24h: string;
    lastUpdated: string;
  };
}

export default function GoldPriceCard({ goldPrice }: GoldPriceCardProps) {
  const price = goldPrice?.currentPrice || 10400;
  const change = parseFloat(goldPrice?.change24h || "0");
  const isPositive = change >= 0;

  return (
    <div className="bg-card rounded-lg border border-border p-6" data-testid="gold-price-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground" data-testid="price-card-title">Gold Price</h3>
        <div className={`flex items-center text-sm ${isPositive ? 'price-trend-up' : 'price-trend-down'}`}>
          {isPositive ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
          <span data-testid="price-change">{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-primary mb-2">
        ₹<span data-testid="current-price">{price.toLocaleString()}</span>
        <span className="text-sm font-normal text-muted-foreground">/gram</span>
      </div>
      <div className="text-sm text-muted-foreground">
        Last updated: <span data-testid="last-updated">
          {goldPrice?.lastUpdated 
            ? new Date(goldPrice.lastUpdated).toLocaleTimeString() 
            : "2 minutes ago"
          }
        </span>
      </div>
    </div>
  );
}
