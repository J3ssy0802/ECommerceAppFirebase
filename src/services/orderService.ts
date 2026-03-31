import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { CartItem } from '../store/cartSlice';

export interface Order {
  id: string;
  userId: string;
  userEmail: string | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  status: 'placed' | 'processing' | 'fulfilled';
  createdAt?: Timestamp;
}

interface CreateOrderInput {
  userId: string;
  userEmail: string | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

const ORDERS_COLLECTION = 'orders';

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const result = await addDoc(collection(db, ORDERS_COLLECTION), {
    userId: input.userId,
    userEmail: input.userEmail,
    items: input.items,
    totalItems: input.totalItems,
    totalPrice: input.totalPrice,
    status: 'placed',
    createdAt: serverTimestamp(),
  });

  return result.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.map((orderDoc) => {
    const data = orderDoc.data() as Omit<Order, 'id'>;

    return {
      id: orderDoc.id,
      userId: data.userId,
      userEmail: data.userEmail,
      items: data.items,
      totalItems: data.totalItems,
      totalPrice: data.totalPrice,
      status: data.status,
      createdAt: data.createdAt,
    };
  });
}

export async function getOrderById(orderId: string, userId: string): Promise<Order | null> {
  const orderSnapshot = await getDoc(doc(db, ORDERS_COLLECTION, orderId));

  if (!orderSnapshot.exists()) {
    return null;
  }

  const data = orderSnapshot.data() as Omit<Order, 'id'>;

  if (data.userId !== userId) {
    return null;
  }

  return {
    id: orderSnapshot.id,
    userId: data.userId,
    userEmail: data.userEmail,
    items: data.items,
    totalItems: data.totalItems,
    totalPrice: data.totalPrice,
    status: data.status,
    createdAt: data.createdAt,
  };
}
