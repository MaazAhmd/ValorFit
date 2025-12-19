import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Palette,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Package,
  Calendar,
  Loader2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

interface ProductSale {
  productId: string;
  productName: string;
  productImage: string;
  unitsSold: number;
  revenue: number;
  commission: number;
}

interface DesignInfo {
  id: string;
  name: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  sales: number;
  revenue: number;
  uploadDate: string;
}

interface Stats {
  totalDesigns: number;
  approvedDesigns: number;
  pendingDesigns: number;
  activeProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  walletBalance: number;
}

export default function DesignerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [designs, setDesigns] = useState<DesignInfo[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchData = async (from?: string, to?: string) => {
    try {
      setLoading(true);
      const response = await apiService.getDesignerStats(from, to);
      setStats(response.stats);
      setProductSales(response.productSales || []);
      setDesigns(response.designs || []);
    } catch (error) {
      console.error('Error fetching designer stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    setIsFiltering(true);
    fetchData(dateFrom, dateTo).finally(() => setIsFiltering(false));
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    fetchData();
  };

  const pendingDesigns = designs.filter(d => d.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Designer'}!</span>
          </h1>
          <p className="text-muted-foreground">Here's an overview of your design business</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchData(dateFrom, dateTo)}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Date Filter */}
      <Card className="bg-card/50 border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Date:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-auto bg-background"
                  placeholder="From"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto bg-background"
                placeholder="To"
              />
              <Button onClick={handleFilter} disabled={isFiltering} size="sm">
                {isFiltering ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </Button>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Units sold</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commission Earned
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${stats?.totalCommission?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">5% of revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Designs
            </CardTitle>
            <Palette className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats?.approvedDesigns || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved designs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">${stats?.walletBalance?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">Available to withdraw</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Sales Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Product Sales Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productSales.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sales data found for the selected period</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sales will appear here once customers purchase your designs
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Units Sold</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Your Commission (5%)</th>
                  </tr>
                </thead>
                <tbody>
                  {productSales.map((product) => (
                    <tr key={product.productId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            {product.productImage ? (
                              <img
                                src={product.productImage}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{product.productName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                          <ShoppingBag className="h-3 w-3" />
                          {product.unitsSold}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-sm">${product.revenue.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-primary">${product.commission.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td className="py-4 px-4 font-semibold">Total</td>
                    <td className="py-4 px-4 text-center font-semibold">{stats?.totalSales || 0}</td>
                    <td className="py-4 px-4 text-right font-semibold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 px-4 text-right font-bold text-primary">${stats?.totalCommission?.toFixed(2) || '0.00'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Designs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/designer/designs">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Palette className="h-4 w-4" />
                Upload New Design
              </Button>
            </Link>
            <Link to="/designer/wallet">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Wallet className="h-4 w-4" />
                Withdraw Earnings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Designs</CardTitle>
          </CardHeader>
          <CardContent>
            {designs.length === 0 ? (
              <div className="text-center py-8">
                <Palette className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No designs yet</p>
                <Link to="/designer/designs">
                  <Button size="sm" className="mt-3">Upload Your First Design</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {designs.slice(0, 4).map((design) => (
                  <div key={design.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {design.image ? (
                        <img
                          src={design.image}
                          alt={design.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Palette className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{design.name}</p>
                      <p className="text-xs text-muted-foreground">{design.sales} sales</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${design.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                        design.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                      }`}>
                      {design.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Notification */}
      {pendingDesigns.length > 0 && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <Palette className="h-8 w-8 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium">You have {pendingDesigns.length} design(s) pending approval</p>
              <p className="text-sm text-muted-foreground">Our team is reviewing your submissions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
