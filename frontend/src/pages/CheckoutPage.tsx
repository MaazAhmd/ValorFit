import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Truck, Check, Loader2, Banknote, Smartphone, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [processingTimer, setProcessingTimer] = useState(0);
  const [showProcessingModal, setShowProcessingModal] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: 'Pakistan',
    postalCode: '',
    phone: '',
    saveInfo: false,
  });

  // Update email if user logs in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const processDigitalPayment = (): Promise<void> => {
    return new Promise((resolve) => {
      setShowProcessingModal(true);
      setProcessingTimer(5);

      const interval = setInterval(() => {
        setProcessingTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            resolve();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    setIsProcessing(true);

    try {
      // For digital payment methods, show the processing simulation
      if (paymentMethod !== 'cod') {
        await processDigitalPayment();
        setShowProcessingModal(false);
      }

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          id: item.product.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          image: item.product.image,
        })),
        total: totalPrice,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        paymentMethod: paymentMethod,
      };

      // Create order via API
      await apiService.createOrder(orderData);

      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: paymentMethod === 'cod'
          ? "Thank you for your order. Pay on delivery."
          : `Payment via ${paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} confirmed. Thank you!`,
      });
      navigate('/');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error?.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowProcessingModal(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const paymentOptions = [
    {
      id: 'cod' as PaymentMethod,
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: Banknote,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
    },
    {
      id: 'jazzcash' as PaymentMethod,
      name: 'JazzCash',
      description: 'Pay instantly via JazzCash',
      icon: Smartphone,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
    },
    {
      id: 'easypaisa' as PaymentMethod,
      name: 'Easypaisa',
      description: 'Pay instantly via Easypaisa',
      icon: Wallet,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/50',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Checkout Form */}
            <div>
              <h1 className="font-display text-4xl md:text-5xl mb-8">CHECKOUT</h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact */}
                <div className="space-y-4">
                  <h2 className="font-display text-xl flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                    CONTACT
                  </h2>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                    className="w-full bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    required
                    className="w-full bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                  />
                </div>

                {/* Shipping */}
                <div className="space-y-4">
                  <h2 className="font-display text-xl flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                    SHIPPING
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      required
                      className="bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      required
                      className="bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                    />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Complete Address"
                    required
                    className="w-full bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                      className="bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal Code"
                      required
                      className="bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                    />
                  </div>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    required
                    className="w-full bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <h2 className="font-display text-xl flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                    PAYMENT METHOD
                  </h2>

                  <div className="grid gap-3">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${paymentMethod === option.id
                            ? `${option.borderColor} ${option.bgColor}`
                            : 'border-border bg-secondary hover:border-muted-foreground'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-full ${option.bgColor} flex items-center justify-center`}>
                          <option.icon className={`w-6 h-6 ${option.color}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === option.id ? option.borderColor : 'border-muted-foreground'
                          }`}>
                          {paymentMethod === option.id && (
                            <div className={`w-2.5 h-2.5 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod !== 'cod' && (
                    <div className="bg-card border border-border p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-medium">Note:</span> You will be redirected to {paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} for secure payment processing.
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Info */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="w-5 h-5 bg-secondary border border-border checked:bg-primary checked:border-primary accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">Save my information for faster checkout</span>
                </label>

                {/* Submit */}
                <Button
                  variant="hero"
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'} • ${totalPrice}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:pl-12 lg:border-l border-border">
              <h2 className="font-display text-2xl mb-6">ORDER SUMMARY</h2>

              {/* Items */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-4"
                  >
                    <div className="w-20 h-24 bg-card overflow-hidden relative shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.selectedSize}{item.selectedColor && ` / ${item.selectedColor}`}
                      </p>
                      <p className="text-sm text-primary mt-2">${item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</span>
                </div>
                <div className="flex justify-between font-display text-xl pt-3 border-t border-border">
                  <span>TOTAL</span>
                  <span className="text-primary">${totalPrice}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Banknote className="w-4 h-4 text-primary" />
                  <span>COD Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {showProcessingModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${paymentMethod === 'jazzcash' ? 'bg-red-500/20' : 'bg-emerald-500/20'
              }`}>
              <Smartphone className={`w-10 h-10 ${paymentMethod === 'jazzcash' ? 'text-red-500' : 'text-emerald-500'
                }`} />
            </div>

            <div>
              <h3 className="font-display text-2xl mb-2">Processing Payment</h3>
              <p className="text-muted-foreground">
                Connecting to {paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}...
              </p>
            </div>

            <div className="relative">
              <div className="w-24 h-24 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251}
                    strokeDashoffset={251 - (251 * (5 - processingTimer)) / 5}
                    className={paymentMethod === 'jazzcash' ? 'text-red-500' : 'text-emerald-500'}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-3xl">{processingTimer}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CheckoutPage;
