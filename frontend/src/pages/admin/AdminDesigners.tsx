import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Mail, Palette, DollarSign, Loader2, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

interface Designer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalDesigns: number;
  totalSales: number;
  totalEarnings: number;
  walletBalance: number;
  joinDate: string;
}

export default function AdminDesigners() {
  const [searchQuery, setSearchQuery] = useState('');
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDesigners();
      setDesigners(response.designers || []);
    } catch (error) {
      console.error('Failed to fetch designers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load designers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigners = designers.filter(designer =>
    designer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    designer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalApprovedDesigns = designers.reduce((sum, d) => sum + d.totalDesigns, 0);
  const totalEarningsPaid = designers.reduce((sum, d) => sum + d.totalEarnings, 0);
  const totalSales = designers.reduce((sum, d) => sum + d.totalSales, 0);

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
        <h1 className="text-3xl font-display">Designers</h1>
        <p className="text-muted-foreground">Manage designer accounts and performance</p>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search designers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{designers.length}</p>
                <p className="text-sm text-muted-foreground">Total Designers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <Palette className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalApprovedDesigns}</p>
                <p className="text-sm text-muted-foreground">Total Designs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSales}</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalEarningsPaid.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Designers Grid */}
      {filteredDesigners.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No designers found matching your search' : 'No designers yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDesigners.map((designer) => (
            <Card key={designer.id} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {designer.avatar ? (
                    <img
                      src={designer.avatar}
                      alt={designer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{designer.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                        active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {designer.email}
                    </p>
                    {designer.joinDate && (
                      <p className="text-xs text-muted-foreground mt-1">Joined: {designer.joinDate}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-2xl font-bold text-primary">{designer.totalDesigns}</p>
                    <p className="text-xs text-muted-foreground">Designs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{designer.totalSales}</p>
                    <p className="text-xs text-muted-foreground">Sales</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Earnings</span>
                    <span className="font-bold text-green-500">${designer.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wallet Balance</span>
                    <span className="font-bold text-primary">${designer.walletBalance?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
                  <Button size="sm" className="flex-1">View Designs</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
