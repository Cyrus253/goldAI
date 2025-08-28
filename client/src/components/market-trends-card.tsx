interface MarketTrendsCardProps {
  goldPrice?: {
    high24h: number;
    low24h: number;
    volume: string;
  };
}

export default function MarketTrendsCard({ goldPrice }: MarketTrendsCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6" data-testid="market-trends-card">
      <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="market-trends-title">Market Trends</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">24h High</span>
          <span className="text-foreground font-medium" data-testid="high-24h">
            ₹{(goldPrice?.high24h || 10485).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">24h Low</span>
          <span className="text-foreground font-medium" data-testid="low-24h">
            ₹{(goldPrice?.low24h || 10290).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Volume</span>
          <span className="text-foreground font-medium" data-testid="volume">
            ₹{goldPrice?.volume || "2.4M"}
          </span>
        </div>
      </div>
    </div>
  );
}
