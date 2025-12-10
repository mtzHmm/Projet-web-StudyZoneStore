// Interface pour les données brutes de l'API
export interface CartItemApi {
  id: number;
  quantity: number;
  productName: string;
  productPrice: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

// Interface pour l'affichage (compatible avec l'ancien code)
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  totalPrice: number;
  productId: number; // Ajouté pour la suppression
}

// Fonction utilitaire pour convertir l'API vers l'affichage
export function mapCartItemFromApi(apiItem: CartItemApi): CartItem {
  // Construire l'URL de l'image
  let imageUrl = '/assets/images/placeholder.jpg'; // Défaut
  
  if (apiItem.product?.imageUrl) {
    const rawUrl = apiItem.product.imageUrl;
    // Si l'URL commence par /uploads/products/, construire l'URL backend
    if (rawUrl.startsWith('/uploads/products/')) {
      const filename = rawUrl.substring('/uploads/products/'.length);
      imageUrl = `http://localhost:8080/api/images/${filename}`;
    } 
    // Sinon utiliser l'URL telle quelle (pour les assets frontend)
    else {
      imageUrl = rawUrl;
    }
  }
  
  return {
    id: apiItem.id,
    name: apiItem.product?.name || apiItem.productName,
    price: apiItem.product?.price || apiItem.productPrice,
    quantity: apiItem.quantity,
    imageUrl: imageUrl,
    totalPrice: (apiItem.product?.price || apiItem.productPrice) * apiItem.quantity,
    productId: apiItem.product?.id || 0 // Ajouté pour la suppression
  };
}
