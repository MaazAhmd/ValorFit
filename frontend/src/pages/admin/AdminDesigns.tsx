import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Search, Upload, Check, X, Eye, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

interface Design {
  id: string;
  name: string;
  designerId?: string;
  designerName?: string;
  image: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate?: string;
  sales?: number;
  revenue?: number;
}

export default function AdminDesigns() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'classic',
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

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (design.designerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || design.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Design['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleApprove = async (designId: string) => {
    try {
      // Extract numeric ID from "DES-XXX" format
      const numericId = designId.replace('DES-', '');
      const response = await fetch(`/api/designs/${numericId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('Design approved successfully');
      loadDesigns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve design');
    }
  };

  const handleReject = async (designId: string) => {
    try {
      // Extract numeric ID from "DES-XXX" format
      const numericId = designId.replace('DES-', '');
      const response = await fetch(`/api/designs/${numericId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason: 'Does not meet quality guidelines' }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.error('Design rejected');
      loadDesigns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject design');
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
    setFormData({ name: '', category: 'classic' });
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
        category: formData.category,
      }, imageFile);

      toast.success('Design uploaded successfully');
      setShowUploadDialog(false);
      resetForm();
      loadDesigns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload design');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Designs</h1>
          <p className="text-muted-foreground">Manage and approve designer submissions</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={(open) => { setShowUploadDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Design
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Design</DialogTitle>
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">Design File</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
                    </>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Uploading...
                  </span>
                ) : (
                  'Upload Design'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Designs Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No designs found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDesigns.map((design) => (
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
                </div>
                <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${getStatusColor(design.status)}`}>
                  {design.status}
                </span>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{design.name}</h3>
                <p className="text-sm text-muted-foreground">
                  by {design.designerName || 'Admin'}
                </p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sales:</span> {design.sales || 0}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Revenue:</span> ${(design.revenue || 0).toFixed(2)}
                  </div>
                </div>
                {design.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 gap-1" onClick={() => handleApprove(design.id)}>
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => handleReject(design.id)}>
                      <X className="h-3 w-3" /> Reject
                    </Button>
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
