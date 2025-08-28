import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goldPrice: number;
  userId: string;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  goldPrice,
  userId
}: PurchaseModalProps) {
  const [amount, setAmount] = useState("");
  const [goldQuantity, setGoldQuantity] = useState(0);
  const [GST, setGST] = useState(0);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const purchaseMutation = useMutation({
    mutationFn: async (amountInvested: number) => {
      const response = await apiRequest("POST", "/api/purchase", {
        amountInvested,
        userId
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      onSuccess();
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to complete purchase",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    const amountNum = parseFloat(amount) || 0;
    const quantity = amountNum / goldPrice;
    const fee = amountNum * 0.03; // 3% GST fee
    const totalAmount = amountNum + fee;

    setGoldQuantity(quantity);
    setGST(fee);
    setTotal(totalAmount);
  }, [amount, goldPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    
    if (amountNum < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum investment amount is ₹10",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate(amountNum);
  };

  const handleClose = () => {
    if (!purchaseMutation.isPending) {
      onClose();
      setAmount("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md" data-testid="purchase-modal">
        <DialogHeader>
          <DialogTitle className="text-foreground" data-testid="purchase-modal-title">Purchase Digital Gold</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Price Display */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Price</span>
              <span className="text-xl font-bold text-primary" data-testid="current-gold-price">
                ₹{goldPrice.toLocaleString()}/gram
              </span>
            </div>
          </div>

          {/* Purchase Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-foreground">Amount to Invest</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    min="10"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 bg-input border-border text-foreground"
                    data-testid="investment-amount-input"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Minimum investment: ₹10</p>
              </div>

              <div>
                <Label className="text-foreground">Gold Quantity</Label>
                <div className="bg-muted/20 rounded-lg p-3 mt-2">
                  <span className="text-lg font-semibold text-foreground" data-testid="gold-quantity">
                    ~{goldQuantity.toFixed(6)} grams
                  </span>
                  <p className="text-xs text-muted-foreground">Based on current market price</p>
                </div>
              </div>

              {/* Purchase Summary */}
              <div className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Investment Amount</span>
                  <span className="text-foreground" data-testid="summary-investment">₹{parseFloat(amount || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-foreground" data-testid="summary-fee">₹{GST.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground" data-testid="summary-total">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-primary text-sm">
                  <Shield size={16} />
                  <span data-testid="security-notice">Secure transaction protected by 256-bit encryption</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={purchaseMutation.isPending}
                  data-testid="cancel-purchase-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gold-shine"
                  disabled={purchaseMutation.isPending || !amount || parseFloat(amount) < 10}
                  data-testid="complete-purchase-button"
                >
                  {purchaseMutation.isPending ? "Processing..." : "Complete Purchase"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
