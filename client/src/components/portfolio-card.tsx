interface PortfolioCardProps {
  portfolio?: {
    totalGold: string;
    currentValue: string;
    totalGains: string;
    gainsPercentage: string;
  };
}

export default function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const totalGold = parseFloat(portfolio?.totalGold || "0");
  const currentValue = parseFloat(portfolio?.currentValue || "0");
  const totalGains = parseFloat(portfolio?.totalGains || "0");
  const gainsPercentage = parseFloat(portfolio?.gainsPercentage || "0");
  const isPositiveGains = totalGains >= 0;

  return (
    <div className="bg-card rounded-lg border border-border p-6" data-testid="portfolio-card">
      <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="portfolio-title">Your Portfolio</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Gold</span>
          <span className="text-foreground font-medium" data-testid="total-gold">
            {totalGold.toFixed(3)}g
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current Value</span>
          <span className="text-foreground font-medium" data-testid="current-value">
            ₹{currentValue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Gains</span>
          <span className={`font-medium ${isPositiveGains ? 'price-trend-up' : 'price-trend-down'}`} data-testid="total-gains">
            {isPositiveGains ? '+' : ''}₹{Math.abs(totalGains).toLocaleString()} ({isPositiveGains ? '+' : ''}{gainsPercentage.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
