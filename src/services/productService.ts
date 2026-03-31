import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProductInput {
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

const PRODUCTS_COLLECTION = 'products';

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));

  return snapshot.docs.map((productDoc) => {
    const data = productDoc.data() as Omit<Product, 'id'>;

    return {
      id: productDoc.id,
      title: data.title,
      price: data.price,
      category: data.category,
      description: data.description,
      image: data.image,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createProduct(product: ProductInput): Promise<void> {
  await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(productId: string, product: ProductInput): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    ...product,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}
