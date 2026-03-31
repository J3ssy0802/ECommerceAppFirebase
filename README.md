# ECommerce App

A React + TypeScript ecommerce application backed by Firebase. It uses Firestore as the database for products, users, and orders, Firebase Authentication for identity management, React Query for data fetching and cache invalidation, and Redux Toolkit for cart state management.

## Features

### Authentication
- Email and password registration — creates a corresponding Firestore user document on sign-up
- Email and password login / logout
- Auth-gated routes — unauthenticated users are redirected to the login/register screen

### User Profile
- View and edit profile fields (name, shipping address) stored in Firestore
- Delete account — removes the Firestore user document and the Firebase Auth account, then redirects to the auth screen with a confirmation message

### Product Catalog
- Products are stored in and fetched from Firestore (`products` collection)
- Create, update, and delete products directly in the app
- Category filter derived live from Firestore product data
- Clicking **Edit** on a product card scrolls to and pre-fills the product form

### Shopping Cart
- Add products to cart, adjust quantities, remove items
- Cart state persisted to `sessionStorage` and **scoped per authenticated user** — switching accounts loads that user's own saved cart
- Checkout confirmation modal saves the order to Firestore before clearing the cart

### Order Management
- All orders are stored in Firestore (`orders` collection) with user ID, email, items, totals, status, and timestamp
- **Order history** page lists previous orders with cart ID, date, total items, and total price
- **Order detail** page shows the full product breakdown for a selected order

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Firebase 12 (Authentication + Firestore)
- React Router 7
- React Query (@tanstack/react-query)
- Redux Toolkit + React Redux
- Bootstrap 5

## Project Structure

```
src/
├── components/
│   ├── AuthForm.tsx       # Login / register form
│   ├── Cart.tsx           # Shopping cart with checkout flow
│   ├── Header.tsx         # Navbar with auth-aware navigation
│   ├── Home.tsx           # Product catalog with CRUD controls
│   ├── OrderDetail.tsx    # Full detail view for a single order
│   ├── Orders.tsx         # Order history list
│   └── Profile.tsx        # User profile edit and account deletion
├── services/
│   ├── authService.ts     # Firebase Auth + Firestore user CRUD
│   ├── orderService.ts    # Firestore order CRUD
│   └── productService.ts  # Firestore product CRUD
├── store/
│   ├── cartSlice.ts       # Redux cart state and reducers
│   ├── hooks.ts           # Typed Redux hooks
│   └── store.ts           # Redux store configuration
├── firebaseConfig.ts      # Firebase app initialisation and exports
├── App.tsx                # Root component, auth state, routing
└── main.tsx               # App entry point with providers
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Firebase project with **Authentication** (Email/Password provider enabled) and **Firestore** set up

### 1. Configure Firebase

Open `src/firebaseConfig.ts` and replace the `firebaseConfig` object values with those from your Firebase project console if needed.

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Open the local URL printed in the terminal (usually `http://localhost:5173`).

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

### 6. Lint the project

```bash
npm run lint
```

## Application Flow

1. User registers or logs in via the auth form.
2. On registration, a user document is created in the Firestore `users` collection.
3. Home page loads products from the Firestore `products` collection.
4. Users can create, edit, and delete products from the home page.
5. Selecting a category filters the displayed products client-side.
6. Adding items to cart saves to user-scoped `sessionStorage` automatically.
7. Cart page lets users review items, change quantities, remove items, and proceed to checkout.
8. Placing an order saves a document to the Firestore `orders` collection, then clears the cart.
9. Users can view their full order history and individual order details under **Orders**.
10. The Profile page allows updating name and address, or permanently deleting the account.

## Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users`    | User profile documents (uid, email, name, address, createdAt, updatedAt) |
| `products` | Product catalog documents (title, price, category, description, image, createdAt, updatedAt) |
| `orders`   | Order documents (userId, userEmail, items, totalItems, totalPrice, status, createdAt) |

## Notes

- Cart data survives page refreshes within the same browser session and is isolated per user account.
- Firestore security rules should be configured in the Firebase console to restrict reads and writes appropriately for production use.
- The `orders` collection query uses a composite index on `userId` + `createdAt`. If Firestore prompts you to create the index, follow the link it provides in the browser console.
