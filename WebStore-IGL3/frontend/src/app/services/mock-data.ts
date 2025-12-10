/**
 * Mock Data for Frontend-Only Application
 * Provides temporary data for development and testing without a backend
 */

import { Product } from '../models/product.interface';
import { Category } from '../models/category.interface';
import { User } from './user.service';
import { Order, OrderStatus } from '../models/order.interface';

// ==================== CATEGORIES ====================
export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'T-Shirts', description: 'Casual t-shirts' },
  { id: 2, name: 'Hoodies', description: 'Comfortable hoodies' },
  { id: 3, name: 'Pants', description: 'Quality pants' },
  { id: 4, name: 'Jackets', description: 'Stylish jackets' },
  { id: 5, name: 'Hats', description: 'Hats and caps' },
];

// ==================== PRODUCTS ====================
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'StudyZone Classic Black T-Shirt',
    reference: 'TSHIRT-001',
    price: 29.99,
    stock: 100,
    category: { id: 1, name: 'T-Shirts' },
    description: 'Premium quality StudyZone black t-shirt',
    imageUrl: '/assets/images/product-1.jpg',
    isClothing: true,
  },
  {
    id: 2,
    name: 'StudyZone White T-Shirt',
    reference: 'TSHIRT-002',
    price: 24.99,
    stock: 150,
    category: { id: 1, name: 'T-Shirts' },
    description: 'Clean StudyZone white t-shirt',
    imageUrl: '/assets/images/product-2.jpg',
    isClothing: true,
  },
  {
    id: 3,
    name: 'StudyZone Navy Hoodie',
    reference: 'HOODIE-001',
    price: 59.99,
    stock: 80,
    category: { id: 2, name: 'Hoodies' },
    description: 'Cozy navy hoodie',
    imageUrl: '/assets/images/product-3.jpg',
    isClothing: true,
  },
  {
    id: 4,
    name: 'Black Hoodie',
    reference: 'HOODIE-002',
    price: 59.99,
    stock: 90,
    category: { id: 2, name: 'Hoodies' },
    description: 'Classic black hoodie',
    imageUrl: '/assets/images/product-4.jpg',
    isClothing: true,
  },
  {
    id: 5,
    name: 'Blue Jeans',
    reference: 'JEANS-001',
    price: 79.99,
    stock: 60,
    category: { id: 3, name: 'Pants' },
    description: 'Classic blue denim jeans',
    imageUrl: '/assets/images/product-5.jpg',
    isClothing: true,
  },
  {
    id: 6,
    name: 'Black Jeans',
    reference: 'JEANS-002',
    price: 79.99,
    stock: 70,
    category: { id: 3, name: 'Pants' },
    description: 'Slim fit black jeans',
    imageUrl: '/assets/images/product-6.jpg',
    isClothing: true,
  },
  {
    id: 7,
    name: 'Leather Jacket',
    reference: 'JACKET-001',
    price: 199.99,
    stock: 30,
    category: { id: 4, name: 'Jackets' },
    description: 'Premium leather jacket',
    imageUrl: '/assets/images/product-7.jpg',
    isClothing: true,
  },
  {
    id: 8,
    name: 'Denim Jacket',
    reference: 'JACKET-002',
    price: 89.99,
    stock: 45,
    category: { id: 4, name: 'Jackets' },
    description: 'Classic denim jacket',
    imageUrl: '/assets/images/product-8.jpg',
    isClothing: true,
  },
  {
    id: 9,
    name: 'Baseball Cap',
    reference: 'CAP-001',
    price: 19.99,
    stock: 200,
    category: { id: 5, name: 'Hats' },
    description: 'Adjustable baseball cap',
    imageUrl: '/assets/images/product-9.jpg',
    isClothing: true,
  },
  {
    id: 10,
    name: 'Red Dress',
    reference: 'DRESS-001',
    price: 89.99,
    stock: 50,
    category: { id: 1, name: 'T-Shirts' },
    description: 'Elegant red dress',
    imageUrl: '/assets/images/product-10.jpg',
    isClothing: true,
  },
];

// ==================== USERS ====================
export const MOCK_USERS: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'ADMIN',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: 'CLIENT',
  },
  {
    id: 3,
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    role: 'CLIENT',
  },
  {
    id: 4,
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice@example.com',
    role: 'MEMBER',
  },
  {
    id: 5,
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@example.com',
    role: 'CLIENT',
  },
];

// ==================== MOCK ORDERS ====================
export const generateMockOrders = (): any[] => {
  return [
    {
      id: 1,
      reference: 'ORDER-001',
      userId: 1,
      orderDate: '2024-12-01T10:00:00Z',
      deliveryDate: '2024-12-05T15:30:00Z',
      status: OrderStatus.DELIVERED,
      items: [
        { productId: 1, productName: 'Classic Black T-Shirt', quantity: 2, price: 29.99 },
        { productId: 3, productName: 'Navy Hoodie', quantity: 1, price: 59.99 },
      ],
      shippingAddress: '123 Main St, Anytown, USA',
      totalAmount: 119.97,
    },
    {
      id: 2,
      reference: 'ORDER-002',
      userId: 2,
      orderDate: '2024-12-03T14:20:00Z',
      status: OrderStatus.PENDING,
      items: [
        { productId: 5, productName: 'Blue Jeans', quantity: 1, price: 79.99 },
      ],
      shippingAddress: '456 Oak Ave, Somewhere, USA',
      totalAmount: 79.99,
    },
    {
      id: 3,
      reference: 'ORDER-003',
      userId: 1,
      orderDate: '2024-12-05T09:15:00Z',
      deliveryDate: '2024-12-08T16:45:00Z',
      status: OrderStatus.CONFIRMED,
      items: [
        { productId: 7, productName: 'Leather Jacket', quantity: 1, price: 199.99 },
      ],
      shippingAddress: '123 Main St, Anytown, USA',
      totalAmount: 199.99,
    },
  ];
};

// ==================== TEST ACCOUNTS ====================
export const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@studyzonestore.com',
    password: 'admin123',
    user: {
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@studyzonestore.com',
      role: 'ADMIN',
    },
  },
  client: {
    email: 'client@studyzonestore.com',
    password: 'client123',
    user: {
      id: 2,
      firstName: 'Client',
      lastName: 'User',
      email: 'client@studyzonestore.com',
      role: 'CLIENT',
    },
  },
};

// ==================== LOCAL STORAGE KEYS ====================
export const LOCAL_STORAGE_KEYS = {
  USER: 'studyzone_user',
  CART: 'studyzone_cart',
  FAVORITES: 'studyzone_favorites',
  ORDERS: 'studyzone_orders',
  TOKEN: 'studyzone_token',
};
