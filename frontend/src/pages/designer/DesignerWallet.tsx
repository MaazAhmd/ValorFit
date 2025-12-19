import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'pending';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  walletBalance: number;
  totalCommission: number;
  totalSales: number;
}

export default function DesignerWallet() {
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData>({ walletBalance: 0, totalCommission: 0, totalSales: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch designer stats
        const statsResponse = await apiService.getDesignerStats();
        setWalletData({
          walletBalance: statsResponse.stats.walletBalance || 0,
          totalCommission: statsResponse.stats.totalCommission || 0,
          totalSales: statsResponse.stats.totalSales || 0
        });

        // Fetch transactions - using the designer transactions endpoint
        try {
          const token = localStorage.getItem('token');
          const txResponse = await fetch('/api/designer/transactions', {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (txResponse.ok) {
            const txData = await txResponse.json();
            setTransactions(txData.transactions || []);
          }
        } catch (e) {
          console.log('No transactions found');
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingEarnings = transactions
    .filter(t => t.type === 'pending' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (amount > walletData.walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum withdrawal is $10.00');
      return;
    }

    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/designer/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        toast.success(`Withdrawal of $${amount.toFixed(2)} initiated`);
        setShowWithdrawDialog(false);
        setWithdrawAmount('');
        // Refresh wallet data
        const statsResponse = await apiService.getDesignerStats();
        setWalletData({
          walletBalance: statsResponse.stats.walletBalance || 0,
          totalCommission: statsResponse.stats.totalCommission || 0,
          totalSales: statsResponse.stats.totalSales || 0
        });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      toast.error('Failed to process withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning': return 'text-green-500';
      case 'withdrawal': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold text-primary">${walletData.walletBalance.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-full">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
            <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" disabled={walletData.walletBalance < 10}>
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="10"
                        max={walletData.walletBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8 bg-background"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: ${walletData.walletBalance.toFixed(2)} • Min: $10.00
                    </p>
                  </div>
                  <div>
                    <Label>Withdrawal Method</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Button type="button" variant="outline" className="justify-start gap-2">
                        <CreditCard className="h-4 w-4" />
                        Bank Transfer
                      </Button>
                      <Button type="button" variant="outline" className="justify-start gap-2">
                        <Wallet className="h-4 w-4" />
                        PayPal
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm">
                    <p className="font-medium mb-1">Processing Time</p>
                    <p className="text-muted-foreground">Bank transfers take 3-5 business days. PayPal withdrawals are typically instant.</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10 || isWithdrawing}
                  >
                    {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Withdrawal
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-green-500">${walletData.totalCommission.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Lifetime earnings from {walletData.totalSales} sales</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Earnings</p>
                <p className="text-3xl font-bold text-yellow-500">${pendingEarnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Being processed (24-48 hours)</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Info */}
      <Card className="bg-accent/10 border-accent/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-lg">
              <span className="text-2xl font-bold text-accent">5%</span>
            </div>
            <div>
              <p className="font-medium">Your Commission Rate</p>
              <p className="text-sm text-muted-foreground">You earn 5% commission on every sale of your designs. The company handles printing, shipping, and customer service.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">Your earnings and withdrawals will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'earning' ? 'bg-green-500/20' :
                        transaction.type === 'withdrawal' ? 'bg-red-500/20' :
                          'bg-yellow-500/20'
                      }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${transaction.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                        transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                      }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
