import { Link } from 'react-router-dom';
import { Product } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-card aspect-[3/4]">
        {/* Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.quantity !== undefined && product.quantity <= 0 && (
            <Badge className="bg-red-500 text-white uppercase text-xs tracking-wider">
              Out of Stock
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground uppercase text-xs tracking-wider">
              New
            </Badge>
          )}
          {product.category === 'designer' && (
            <Badge variant="outline" className="border-foreground/50 text-foreground uppercase text-xs tracking-wider">
              Designer
            </Badge>
          )}
          {product.originalPrice && (
            <Badge className="bg-destructive text-destructive-foreground uppercase text-xs tracking-wider">
              Sale
            </Badge>
          )}
        </div>

        {/* Quick View */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <button className="w-full bg-foreground text-background py-3 text-sm font-medium uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-smooth">
            Quick View
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-smooth">
            {product.name}
          </h3>
          {product.designer && (
            <span className="text-xs text-muted-foreground">
              by {product.designer}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground font-medium">${product.price}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-sm">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
