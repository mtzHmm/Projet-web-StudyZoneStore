export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isClothing: boolean;
  category?: {
    id: number;
    name: string;
  };
  imageUrl?: string;
  reference?: string;
  material?: string;
  printings?: string;
  images?: string[];
  availableSizes?: string[];
}

// Interface pour l'affichage avec propriétés d'édition
export interface ProductDisplay extends Product {
  editing?: boolean;
}

export interface ProductResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Backend API response structure
export interface BackendProductResponse {
  items: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  message?: string;
}

export interface ProductCreateRequest extends Partial<Product> {}
export interface ProductUpdateRequest extends Partial<Product> {}
