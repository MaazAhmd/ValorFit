import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Palette, Trash2, Edit, ShoppingCart, Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

interface CustomDesign {
    id: number;
    name: string;
    previewFront?: string;
    previewBack?: string;
    createdAt: string;
    baseProductId?: number;
}

export default function MyCustomDesigns() {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [designs, setDesigns] = useState<CustomDesign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [designToDelete, setDesignToDelete] = useState<CustomDesign | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [baseProduct, setBaseProduct] = useState<any>(null);

    useEffect(() => {
        loadDesigns();
        loadBaseProduct();
    }, []);

    const loadDesigns = async () => {
        try {
            setLoading(true);
            const response = await apiService.getCustomDesigns();
            setDesigns(response.designs || []);
        } catch (error) {
            console.error('Failed to load designs:', error);
            toast({ title: 'Error', description: 'Failed to load designs', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const loadBaseProduct = async () => {
        try {
            const response = await apiService.getCustomTshirtProduct();
            setBaseProduct(response.product);
        } catch (error) {
            console.error('Failed to load base product:', error);
        }
    };

    const handleDeleteDesign = async () => {
        if (!designToDelete) return;
        setDeleting(true);
        try {
            await apiService.deleteCustomDesign(designToDelete.id);
            setDesigns(designs.filter(d => d.id !== designToDelete.id));
            toast({ title: 'Success', description: 'Design deleted successfully' });
            setDeleteDialogOpen(false);
            setDesignToDelete(null);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to delete design', variant: 'destructive' });
        } finally {
            setDeleting(false);
        }
    };

    const handleAddToCart = async (design: CustomDesign) => {
        if (!baseProduct) {
            toast({ title: 'Error', description: 'Base product not available', variant: 'destructive' });
            return;
        }

        const product = {
            id: String(baseProduct.id),
            name: `Custom Compression Shirt - ${design.name}`,
            price: baseProduct.price,
            image: design.previewFront || baseProduct.image,
            customDesignId: design.id,
        };

        addToCart(product, 'M', 'White', 1);

        toast({ title: 'Added to Cart', description: 'Your custom design has been added to cart' });
        navigate('/cart');
    };

    const filteredDesigns = designs.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-display">My Custom Designs</h1>
                            <p className="text-muted-foreground">Your personalized compression shirt designs</p>
                        </div>
                        <Link to="/custom-design">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Create New Design
                            </Button>
                        </Link>
                    </div>

                    {/* Search */}
                    <Card className="bg-card border-border mb-6">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search designs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Designs Grid */}
                    {filteredDesigns.length === 0 ? (
                        <Card className="bg-card border-border">
                            <CardContent className="py-16 text-center">
                                <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium mb-2">No Designs Yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    {searchQuery ? 'No designs match your search' : 'Start creating your custom compression shirt designs!'}
                                </p>
                                <Link to="/custom-design">
                                    <Button>Create Your First Design</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredDesigns.map((design) => (
                                <Card key={design.id} className="bg-card border-border overflow-hidden group">
                                    <div className="aspect-square bg-white relative">
                                        {design.previewFront ? (
                                            <img
                                                src={design.previewFront}
                                                alt={design.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                                                <Palette className="h-16 w-16 text-primary/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="icon" variant="secondary" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => handleAddToCart(design)}
                                                title="Add to Cart"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => {
                                                    setDesignToDelete(design);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium truncate">{design.name}</h3>
                                        <p className="text-xs text-muted-foreground">Created: {design.createdAt}</p>
                                        {baseProduct && (
                                            <p className="text-lg font-bold text-primary mt-2">${baseProduct.price}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Design</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                        Are you sure you want to delete "{designToDelete?.name}"? This action cannot be undone.
                    </p>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteDesign} disabled={deleting}>
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
