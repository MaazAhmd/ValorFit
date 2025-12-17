import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette, Upload, Eye, Edit, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import apiService from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

interface Design {
  id: string;
  name: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate?: string;
  sales?: number;
  revenue?: number;
  rejectionReason?: string;
}

export default function DesignerDesigns() {
  const { user } = useAuth();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
  });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDesigns();
      setDesigns(response.designs || []);
    } catch (error: any) {
      console.error('Failed to load designs:', error);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Design['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', tags: '' });
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please upload a design image');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter a design name');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createDesignWithImage({
        name: formData.name,
        category: 'designer',
      }, imageFile);

      toast.success('Design submitted for review!');
      setShowUploadDialog(false);
      resetForm();
      loadDesigns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit design');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = designs.filter(d => d.status === 'pending').length;
  const approvedCount = designs.filter(d => d.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">My Designs</h1>
          <p className="text-muted-foreground">Manage your design portfolio</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={(open) => { setShowUploadDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload New Design
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit New Design</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="name">Design Name</Label>
                <Input
                  id="name"
                  placeholder="Enter design name"
                  className="bg-background"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your design..."
                  className="bg-background resize-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="abstract, minimal, modern"
                  className="bg-background"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div>
                <Label>Design File</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-sm text-muted-foreground">{imageFile?.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); resetForm(); }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Image className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, GIF, WEBP up to 10MB</p>
                      <p className="text-xs text-accent mt-2">High resolution recommended</p>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="font-medium mb-1">Commission Structure</p>
                <p className="text-muted-foreground">You earn 5% commission on every sale of your design. Designs are reviewed within 24-48 hours.</p>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Submitting...
                  </span>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{designs.length}</p>
                <p className="text-sm text-muted-foreground">Total Designs</p>
              </div>
              <Palette className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 text-lg">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 text-lg">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Designs Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No designs yet. Upload your first design!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <Card key={design.id} className="bg-card border-border overflow-hidden group">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={design.image}
                  alt={design.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${getStatusColor(design.status)}`}>
                  {design.status}
                </span>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{design.name}</h3>
                {design.uploadDate && (
                  <p className="text-xs text-muted-foreground">Uploaded: {design.uploadDate}</p>
                )}

                {design.status === 'approved' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-medium">{design.sales || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Your Earnings (5%)</span>
                      <span className="font-medium text-accent">${((design.revenue || 0) * 0.05).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {design.status === 'rejected' && (
                  <div className="mt-3 p-2 bg-red-500/10 rounded-lg">
                    <p className="text-xs text-red-400">
                      {design.rejectionReason || 'Design did not meet our quality guidelines. Please review and resubmit.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
