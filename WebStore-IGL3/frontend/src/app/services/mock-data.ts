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
  // Additional products to reach 25+ total
  {
    id: 11,
    name: 'StudyZone Laptop Bag',
    reference: 'BAG-001',
    price: 125.00,
    stock: 45,
    category: { id: 6, name: 'Accessories' },
    description: 'Professional laptop bag for students',
    imageUrl: '/assets/images/laptop-bag.jpg',
    isClothing: false,
  },
  {
    id: 12,
    name: 'StudyZone Notebook',
    reference: 'NOTE-001',
    price: 15.50,
    stock: 200,
    category: { id: 7, name: 'Stationery' },
    description: 'High-quality notebook for studies',
    imageUrl: '/assets/images/notebook.jpg',
    isClothing: false,
  },
  {
    id: 13,
    name: 'StudyZone Pen Set',
    reference: 'PEN-001',
    price: 25.00,
    stock: 75,
    category: { id: 7, name: 'Stationery' },
    description: 'Premium pen set with StudyZone logo',
    imageUrl: '/assets/images/pen-set.jpg',
    isClothing: false,
  },
  {
    id: 14,
    name: 'StudyZone Desk Organizer',
    reference: 'DESK-001',
    price: 45.99,
    stock: 30,
    category: { id: 6, name: 'Accessories' },
    description: 'Keep your desk organized with style',
    imageUrl: '/assets/images/desk-organizer.jpg',
    isClothing: false,
  },
  {
    id: 15,
    name: 'StudyZone Water Bottle',
    reference: 'BOTTLE-001',
    price: 19.99,
    stock: 120,
    category: { id: 6, name: 'Accessories' },
    description: 'Stay hydrated with StudyZone bottle',
    imageUrl: '/assets/images/water-bottle.jpg',
    isClothing: false,
  },
  {
    id: 16,
    name: 'StudyZone Polo Shirt',
    reference: 'POLO-001',
    price: 35.99,
    stock: 18, // Low stock
    category: { id: 1, name: 'T-Shirts' },
    description: 'Classic polo shirt with StudyZone emblem',
    imageUrl: '/assets/images/polo.jpg',
    isClothing: true,
  },
  {
    id: 17,
    name: 'StudyZone Backpack',
    reference: 'BAG-002',
    price: 75.00,
    stock: 55,
    category: { id: 6, name: 'Accessories' },
    description: 'Durable backpack for daily use',
    imageUrl: '/assets/images/backpack.jpg',
    isClothing: false,
  },
  {
    id: 18,
    name: 'StudyZone Cap',
    reference: 'HAT-001',
    price: 19.99,
    stock: 15, // Low stock
    category: { id: 5, name: 'Hats' },
    description: 'Stylish cap with StudyZone logo',
    imageUrl: '/assets/images/cap.jpg',
    isClothing: true,
  },
  {
    id: 19,
    name: 'StudyZone Mug',
    reference: 'MUG-001',
    price: 12.99,
    stock: 90,
    category: { id: 6, name: 'Accessories' },
    description: 'Coffee mug for study sessions',
    imageUrl: '/assets/images/mug.jpg',
    isClothing: false,
  },
  {
    id: 20,
    name: 'StudyZone Stickers Pack',
    reference: 'STICK-001',
    price: 9.99,
    stock: 300,
    category: { id: 6, name: 'Accessories' },
    description: 'Cool stickers for laptops and notebooks',
    imageUrl: '/assets/images/stickers.jpg',
    isClothing: false,
  },
  {
    id: 21,
    name: 'StudyZone Sweatshirt',
    reference: 'SWEAT-001',
    price: 45.00,
    stock: 65,
    category: { id: 2, name: 'Hoodies' },
    description: 'Comfortable sweatshirt for cold days',
    imageUrl: '/assets/images/sweatshirt.jpg',
    isClothing: true,
  },
  {
    id: 22,
    name: 'StudyZone Phone Case',
    reference: 'PHONE-001',
    price: 24.99,
    stock: 85,
    category: { id: 6, name: 'Accessories' },
    description: 'Protect your phone with style',
    imageUrl: '/assets/images/phone-case.jpg',
    isClothing: false,
  },
  {
    id: 23,
    name: 'StudyZone Keychain',
    reference: 'KEY-001',
    price: 8.99,
    stock: 150,
    category: { id: 6, name: 'Accessories' },
    description: 'StudyZone branded keychain',
    imageUrl: '/assets/images/keychain.jpg',
    isClothing: false,
  },
  {
    id: 24,
    name: 'StudyZone Mouse Pad',
    reference: 'MOUSE-001',
    price: 14.99,
    stock: 110,
    category: { id: 6, name: 'Accessories' },
    description: 'High-quality mouse pad for gaming and work',
    imageUrl: '/assets/images/mouse-pad.jpg',
    isClothing: false,
  },
  {
    id: 25,
    name: 'StudyZone Lanyard',
    reference: 'LAND-001',
    price: 6.99,
    stock: 8, // Low stock
    category: { id: 6, name: 'Accessories' },
    description: 'StudyZone lanyard for ID cards',
    imageUrl: '/assets/images/lanyard.jpg',
    isClothing: false,
  },
  {
    id: 26,
    name: 'StudyZone USB Drive',
    reference: 'USB-001',
    price: 29.99,
    stock: 0, // Out of stock
    category: { id: 8, name: 'Tech' },
    description: '32GB USB drive with StudyZone design',
    imageUrl: '/assets/images/usb-drive.jpg',
    isClothing: false,
  },
];

// ==================== USERS ====================
// Centralized users list extracted from MOCK_ORDERS for consistency
export const MOCK_USERS: User[] = [
  {
    id: 1,
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'ahmed.benali@studyzone.com',
    role: 'ADMIN',
  },
  {
    id: 2,
    firstName: 'Fatma',
    lastName: 'Trabelsi',
    email: 'fatma.trabelsi@studyzone.com',
    role: 'CLIENT',
  },
  {
    id: 3,
    firstName: 'Mohamed',
    lastName: 'Gharbi',
    email: 'mohamed.gharbi@studyzone.com',
    role: 'CLIENT',
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@studyzone.com',
    role: 'CLIENT',
  },
  {
    id: 5,
    firstName: 'Youssef',
    lastName: 'Mejri',
    email: 'youssef.mejri@studyzone.com',
    role: 'CLIENT',
  },
  {
    id: 6,
    firstName: 'Nadia',
    lastName: 'Slim',
    email: 'nadia.slim@studyzone.com',
    role: 'CLIENT',
  },
  {
    id: 7,
    firstName: 'Karim',
    lastName: 'Ben Salem',
    email: 'karim.bensalem@studyzone.com',
    role: 'CLIENT',
  },
  {
    id: 8,
    firstName: 'Imen',
    lastName: 'Karray',
    email: 'imen.karray@studyzone.com',
    role: 'CLIENT',
  },
];

// ==================== CENTRALIZED MOCK ORDERS ====================
// This is the single source of truth for all orders across the application
export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    orderDate: '2024-12-10T10:30:00',
    status: OrderStatus.DELIVERED,
    deliveryMethod: 'Standard',
    user: {
      id: 1,
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      email: 'ahmed.benali@studyzone.com'
    },
    orderItems: [
      {
        id: 1,
        quantity: 2,
        product: {
          id: 1,
          name: 'StudyZone Classic T-Shirt',
          price: 29.99,
          imageUrl: '/assets/images/tshirt.jpg'
        }
      },
      {
        id: 2,
        quantity: 1,
        product: {
          id: 2,
          name: 'StudyZone Hoodie',
          price: 59.99,
          imageUrl: '/assets/images/hoodie.jpg'
        }
      }
    ]
  },
  {
    id: 2,
    orderDate: '2024-12-09T14:20:00',
    status: OrderStatus.PENDING,
    deliveryMethod: 'Express',
    user: {
      id: 2,
      firstName: 'Fatma',
      lastName: 'Trabelsi',
      email: 'fatma.trabelsi@studyzone.com'
    },
    orderItems: [
      {
        id: 3,
        quantity: 3,
        product: {
          id: 3,
          name: 'StudyZone Sweatshirt',
          price: 45.00,
          imageUrl: '/assets/images/sweatshirt.jpg'
        }
      }
    ]
  },
  {
    id: 3,
    orderDate: '2024-12-08T09:15:00',
    status: OrderStatus.CONFIRMED,
    deliveryMethod: 'Standard',
    user: {
      id: 3,
      firstName: 'Mohamed',
      lastName: 'Gharbi',
      email: 'mohamed.gharbi@studyzone.com'
    },
    orderItems: [
      {
        id: 4,
        quantity: 1,
        product: {
          id: 4,
          name: 'StudyZone Premium Jacket',
          price: 89.99,
          imageUrl: '/assets/images/jacket.jpg'
        }
      },
      {
        id: 5,
        quantity: 2,
        product: {
          id: 5,
          name: 'StudyZone Cap',
          price: 19.99,
          imageUrl: '/assets/images/cap.jpg'
        }
      }
    ]
  },
  {
    id: 4,
    orderDate: '2024-12-07T16:45:00',
    status: OrderStatus.DELIVERED,
    deliveryMethod: 'Express',
    user: {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@studyzone.com'
    },
    orderItems: [
      {
        id: 6,
        quantity: 1,
        product: {
          id: 6,
          name: 'StudyZone Backpack',
          price: 75.00,
          imageUrl: '/assets/images/backpack.jpg'
        }
      }
    ]
  },
  {
    id: 5,
    orderDate: '2024-12-06T11:30:00',
    status: OrderStatus.CONFIRMED,
    deliveryMethod: 'Standard',
    user: {
      id: 5,
      firstName: 'Youssef',
      lastName: 'Mejri',
      email: 'youssef.mejri@studyzone.com'
    },
    orderItems: [
      {
        id: 7,
        quantity: 2,
        product: {
          id: 7,
          name: 'StudyZone Polo Shirt',
          price: 35.99,
          imageUrl: '/assets/images/polo.jpg'
        }
      }
    ]
  },
  {
    id: 6,
    orderDate: '2024-12-05T16:45:00',
    status: OrderStatus.DELIVERED,
    deliveryMethod: 'Express',
    user: {
      id: 6,
      firstName: 'Nadia',
      lastName: 'Slim',
      email: 'nadia.slim@studyzone.com'
    },
    orderItems: [
      {
        id: 8,
        quantity: 1,
        product: {
          id: 8,
          name: 'StudyZone Laptop Bag',
          price: 125.00,
          imageUrl: '/assets/images/laptop-bag.jpg'
        }
      }
    ]
  },
  {
    id: 7,
    orderDate: '2024-12-04T13:20:00',
    status: OrderStatus.CONFIRMED,
    deliveryMethod: 'Standard',
    user: {
      id: 7,
      firstName: 'Karim',
      lastName: 'Ben Salem',
      email: 'karim.bensalem@studyzone.com'
    },
    orderItems: [
      {
        id: 9,
        quantity: 3,
        product: {
          id: 9,
          name: 'StudyZone Notebook',
          price: 15.50,
          imageUrl: '/assets/images/notebook.jpg'
        }
      },
      {
        id: 10,
        quantity: 2,
        product: {
          id: 10,
          name: 'StudyZone Pen Set',
          price: 25.00,
          imageUrl: '/assets/images/pen-set.jpg'
        }
      }
    ]
  },
  {
    id: 8,
    orderDate: '2024-12-03T08:15:00',
    status: OrderStatus.DELIVERED,
    deliveryMethod: 'Standard',
    user: {
      id: 8,
      firstName: 'Imen',
      lastName: 'Karray',
      email: 'imen.karray@studyzone.com'
    },
    orderItems: [
      {
        id: 11,
        quantity: 1,
        product: {
          id: 11,
          name: 'StudyZone Desk Organizer',
          price: 45.99,
          imageUrl: '/assets/images/desk-organizer.jpg'
        }
      }
    ]
  }
];

// Backward compatibility function
export const generateMockOrders = (userId?: number): Order[] => {
  if (userId) {
    return MOCK_ORDERS.filter(order => order.user.id === userId);
  }
  return MOCK_ORDERS;
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
