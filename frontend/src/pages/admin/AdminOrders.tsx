import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Eye, MoreHorizontal, Loader2, Calendar, ArrowUpDown, RefreshCw, MapPin, CreditCard, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import apiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  items: OrderItem[];
  quantity: number;
  price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  date: string;
}

type SortField = 'date' | 'price' | 'status' | 'customerName';
type SortOrder = 'asc' | 'desc';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Extract numeric ID from "ORD-001" format
  const getNumericId = (orderId: string): number => {
    const match = orderId.match(/ORD-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.customerName?.toLowerCase().includes(query) ||
        order.id?.toLowerCase().includes(query) ||
        order.productName?.toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFrom) {
      result = result.filter(order => order.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(order => order.date <= dateTo);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = (a.date || '').localeCompare(b.date || '');
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'customerName':
          comparison = (a.customerName || '').localeCompare(b.customerName || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [orders, searchQuery, statusFilter, dateFrom, dateTo, sortField, sortOrder]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      const numericId = getNumericId(orderId);
      await apiService.updateOrderStatus(numericId, newStatus);

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ));

      toast({
        title: 'Status Updated',
        description: `Order ${orderId} status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-500';
      case 'shipped': return 'bg-blue-500/20 text-blue-500';
      case 'processing': return 'bg-yellow-500/20 text-yellow-500';
      case 'pending': return 'bg-orange-500/20 text-orange-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'card': return 'Credit Card';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  };

  // Calculate summary
  const summary = useMemo(() => {
    const total = filteredAndSortedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const pending = filteredAndSortedOrders.filter(o => o.status === 'pending').length;
    const processing = filteredAndSortedOrders.filter(o => o.status === 'processing').length;
    const shipped = filteredAndSortedOrders.filter(o => o.status === 'shipped').length;
    const delivered = filteredAndSortedOrders.filter(o => o.status === 'delivered').length;
    return { total, pending, processing, shipped, delivered };
  }, [filteredAndSortedOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Orders</h1>
          <p className="text-muted-foreground">Manage all customer orders</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">${summary.total.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-4">
            <p className="text-sm text-orange-500">Pending</p>
            <p className="text-2xl font-bold text-orange-500">{summary.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-500">Processing</p>
            <p className="text-2xl font-bold text-yellow-500">{summary.processing}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-500">Shipped</p>
            <p className="text-2xl font-bold text-blue-500">{summary.shipped}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4">
            <p className="text-sm text-green-500">Delivered</p>
            <p className="text-2xl font-bold text-green-500">{summary.delivered}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, customer, product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">From:</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-background w-auto"
                />
                <span className="text-sm text-muted-foreground">To:</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-background w-auto"
                />
              </div>
              {(searchQuery || statusFilter !== 'all' || dateFrom || dateTo) && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            All Orders ({filteredAndSortedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort('customerName')}
                    >
                      <span className="flex items-center gap-1">
                        Customer
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Product</th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort('price')}
                    >
                      <span className="flex items-center gap-1">
                        Amount
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort('status')}
                    >
                      <span className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono">{order.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm hidden md:table-cell">
                        <span className="truncate max-w-[150px] block">{order.productName}</span>
                        {order.quantity > 1 && (
                          <span className="text-xs text-muted-foreground">+{order.quantity - 1} more</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">${order.price?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{order.date}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={updating === order.id}>
                              {updating === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              disabled={order.status === 'processing'}
                            >
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'shipped')}
                              disabled={order.status === 'shipped'}
                            >
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              disabled={order.status === 'delivered'}
                            >
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              disabled={order.status === 'cancelled'}
                              className="text-red-500"
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Details - {selectedOrder?.id}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedOrder?.status || 'pending')}`}>
                {selectedOrder?.status}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Order Date
                  </p>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Shipping Address
                </p>
                <p className="text-sm bg-secondary p-3 rounded-lg">{selectedOrder.shippingAddress || 'No address provided'}</p>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Payment Method
                  </p>
                  <p className="font-medium">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedOrder.paymentStatus === 'paid'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-orange-500/20 text-orange-500'
                    }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Order Items</p>
                <div className="bg-secondary rounded-lg divide-y divide-border">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.size && `Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                            {` • Qty: ${item.quantity}`}
                          </p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3">
                      <p className="font-medium">{selectedOrder.productName}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {selectedOrder.quantity}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <p className="font-medium text-lg">Total Amount</p>
                <p className="font-bold text-2xl text-primary">${selectedOrder.price?.toFixed(2)}</p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.id, 'processing');
                    setSelectedOrder(prev => prev ? { ...prev, status: 'processing' } : null);
                  }}
                  disabled={selectedOrder.status === 'processing' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                >
                  Mark Processing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.id, 'shipped');
                    setSelectedOrder(prev => prev ? { ...prev, status: 'shipped' } : null);
                  }}
                  disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                >
                  Mark Shipped
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.id, 'delivered');
                    setSelectedOrder(prev => prev ? { ...prev, status: 'delivered' } : null);
                  }}
                  disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                  className="text-green-500 border-green-500/50 hover:bg-green-500/10"
                >
                  Mark Delivered
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.id, 'cancelled');
                    setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
                  }}
                  disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                  className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
