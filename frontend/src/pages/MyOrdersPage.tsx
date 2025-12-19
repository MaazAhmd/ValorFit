import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Package,
    Loader2,
    ShoppingBag,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    MapPin,
    CreditCard,
    Eye,
    ArrowLeft
} from 'lucide-react';
import apiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

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

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/auth/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await apiService.getOrders();
                setOrders(response.orders || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load your orders',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Separate active and past orders
    const { activeOrders, pastOrders } = useMemo(() => {
        const active = orders.filter(o =>
            ['pending', 'processing', 'shipped'].includes(o.status)
        );
        const past = orders.filter(o =>
            ['delivered', 'cancelled'].includes(o.status)
        );
        return { activeOrders: active, pastOrders: past };
    }, [orders]);

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'processing': return <Package className="h-4 w-4" />;
            case 'shipped': return <Truck className="h-4 w-4" />;
            case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'delivered': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30';
            case 'shipped': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30';
            case 'processing': return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30';
            case 'pending': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30';
            case 'cancelled': return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'Order Placed';
            case 'processing': return 'Processing';
            case 'shipped': return 'On The Way';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status;
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

    const OrderCard = ({ order, showViewButton = true }: { order: Order; showViewButton?: boolean }) => (
        <Card
            className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            onClick={() => setSelectedOrder(order)}
        >
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex gap-4 flex-1">
                        {/* Product Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            {order.items && order.items[0]?.image ? (
                                <img
                                    src={order.items[0].image}
                                    alt={order.productName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-mono text-xs text-primary mb-1">{order.id}</p>
                                    <h3 className="font-medium text-foreground truncate">{order.productName}</h3>
                                    {order.quantity > 1 && (
                                        <p className="text-xs text-muted-foreground">+{order.quantity - 1} more items</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{order.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <p className="text-lg font-bold text-primary">${order.price?.toFixed(2)}</p>
                        {showViewButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                }}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="mb-4 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold">
                            My <span className="text-primary">Orders</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">Track and manage your orders</p>
                    </div>

                    {orders.length === 0 ? (
                        /* Empty State */
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                    <ShoppingBag className="h-10 w-10 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    You haven't placed any orders yet. Start shopping to see your orders here!
                                </p>
                                <Button onClick={() => navigate('/shop')} className="gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Start Shopping
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-10">
                            {/* Active Orders Section */}
                            {activeOrders.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Truck className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">Active Orders</h2>
                                            <p className="text-sm text-muted-foreground">{activeOrders.length} order{activeOrders.length > 1 ? 's' : ''} in progress</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {activeOrders.map((order) => (
                                            <OrderCard key={order.id} order={order} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Past Orders Section */}
                            {pastOrders.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">Past Orders</h2>
                                            <p className="text-sm text-muted-foreground">{pastOrders.length} completed order{pastOrders.length > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {pastOrders.map((order) => (
                                            <OrderCard key={order.id} order={order} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="font-mono text-primary">{selectedOrder?.id}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(selectedOrder?.status || 'pending')}`}>
                                {getStatusIcon(selectedOrder?.status || 'pending')}
                                <span className="ml-1">{getStatusText(selectedOrder?.status || 'pending')}</span>
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Date */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Ordered on {selectedOrder.date}
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                <h3 className="font-medium">Order Items</h3>
                                <div className="bg-secondary/50 rounded-xl divide-y divide-border/50">
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-background flex-shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.size && `Size: ${item.size}`}
                                                        {item.color && ` • Color: ${item.color}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4">
                                            <p className="font-medium">{selectedOrder.productName}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {selectedOrder.quantity}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="space-y-2">
                                <h3 className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    Shipping Address
                                </h3>
                                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                                    {selectedOrder.shippingAddress || 'No address provided'}
                                </p>
                            </div>

                            {/* Payment Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-medium flex items-center gap-2 text-sm">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        Payment
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium text-sm">Payment Status</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${selectedOrder.paymentStatus === 'paid'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-orange-500/20 text-orange-400'
                                        }`}>
                                        {selectedOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-4 border-t border-border">
                                <p className="font-medium">Total Amount</p>
                                <p className="text-2xl font-bold text-primary">${selectedOrder.price?.toFixed(2)}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        navigate('/shop');
                                    }}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
