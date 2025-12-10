export interface Order {
  id: number;
  orderDate: string;
  status: OrderStatus;
  deliveryMethod: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  orderItems: OrderItem[];
  totalAmount?: number;
}

export interface OrderItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface OrderResponse {
  orders: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrderCreateRequest {
  deliveryMethod: string;
  orderItems: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  deliveryMethod?: string;
}