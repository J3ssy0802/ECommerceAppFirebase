import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  type Product,
  type ProductInput,
} from '../services/productService';

interface ProductFormState {
  title: string;
  price: string;
  category: string;
  description: string;
  image: string;
}

export default function Home() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const productFormCardRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [form, setForm] = useState<ProductFormState>({
    title: '',
    price: '',
    category: '',
    description: '',
    image: '',
  });

  const { data: products, isLoading: productsLoading, isError: productsError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });

  const createProductMutation = useMutation({
    mutationFn: (payload: ProductInput) => createProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: ProductInput }) =>
      updateProduct(productId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const categories = useMemo(() => {
    const nextCategories = new Set<string>();
    for (const product of products ?? []) {
      if (product.category.trim()) {
        nextCategories.add(product.category.trim());
      }
    }
    return Array.from(nextCategories).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) {
      return [];
    }

    if (!selectedCategory) {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  function resetForm() {
    setForm({
      title: '',
      price: '',
      category: '',
      description: '',
      image: '',
    });
    setEditingProductId(null);
  }

  function mapFormToPayload(): ProductInput {
    return {
      title: form.title.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    };
  }

  function validateForm(): string {
    if (!form.title.trim()) {
      return 'Product title is required.';
    }

    const parsedPrice = Number(form.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return 'Price must be a valid number greater than 0.';
    }

    if (!form.category.trim()) {
      return 'Category is required.';
    }

    if (!form.description.trim()) {
      return 'Description is required.';
    }

    if (!form.image.trim()) {
      return 'Image URL is required.';
    }

    return '';
  }

  async function handleProductSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setStatusMessage('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = mapFormToPayload();

    try {
      if (editingProductId) {
        await updateProductMutation.mutateAsync({ productId: editingProductId, payload });
        setStatusMessage('Product updated successfully.');
      } else {
        await createProductMutation.mutateAsync(payload);
        setStatusMessage('Product created successfully.');
      }
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save product.';
      setFormError(message);
    }
  }

  function startEditing(product: Product) {
    setForm({
      title: product.title,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      image: product.image,
    });
    setEditingProductId(product.id);
    setFormError('');
    setStatusMessage('');
    productFormCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleDelete(productId: string) {
    const confirmed = window.confirm('Delete this product permanently?');
    if (!confirmed) {
      return;
    }

    setFormError('');
    setStatusMessage('');

    try {
      await deleteProductMutation.mutateAsync(productId);
      if (editingProductId === productId) {
        resetForm();
      }
      setStatusMessage('Product deleted successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product.';
      setFormError(message);
    }
  }

  return (
    <div className="container my-5">
      <h1 className="mb-4">Products</h1>

      <div ref={productFormCardRef} className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3">
            {editingProductId ? 'Update Product' : 'Create Product'}
          </h2>

          {formError && (
            <div className="alert alert-danger" role="alert">
              {formError}
            </div>
          )}

          {statusMessage && (
            <div className="alert alert-success" role="alert">
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleProductSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="productTitle" className="form-label">
                  Title
                </label>
                <input
                  id="productTitle"
                  className="form-control"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="productPrice" className="form-label">
                  Price
                </label>
                <input
                  id="productPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-control"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="productCategory" className="form-label">
                  Category
                </label>
                <input
                  id="productCategory"
                  className="form-control"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />
              </div>
              <div className="col-12">
                <label htmlFor="productImage" className="form-label">
                  Image URL
                </label>
                <input
                  id="productImage"
                  type="url"
                  className="form-control"
                  value={form.image}
                  onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                  required
                />
              </div>
              <div className="col-12">
                <label htmlFor="productDescription" className="form-label">
                  Description
                </label>
                <textarea
                  id="productDescription"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {editingProductId
                  ? updateProductMutation.isPending
                    ? 'Updating...'
                    : 'Update Product'
                  : createProductMutation.isPending
                    ? 'Creating...'
                    : 'Create Product'}
              </button>
              {editingProductId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="mb-4">
        <label htmlFor="categorySelect" className="form-label fw-bold">
          Filter by Category:
        </label>
        <select
          id="categorySelect"
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Products Loading State */}
      {productsLoading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading products...</span>
          </div>
        </div>
      )}

      {/* Products Error State */}
      {productsError && (
        <div className="alert alert-danger" role="alert">
          Failed to load products from Firestore. Please try again later.
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100 shadow-sm">
                <div
                  className="d-flex align-items-center justify-content-center p-3"
                  style={{ height: '220px', background: '#f8f9fa' }}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <span className="badge bg-secondary text-uppercase mb-2" style={{ width: 'fit-content' }}>
                    {product.category}
                  </span>
                  <h5 className="card-title" style={{ fontSize: '0.95rem' }}>
                    {product.title}
                  </h5>
                  <p className="card-text text-muted" style={{ fontSize: '0.85rem', flexGrow: 1 }}>
                    {product.description}
                  </p>
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <span className="fs-5 fw-bold text-primary">${product.price.toFixed(2)}</span>
                  </div>
                  <button
                    className="btn btn-primary mt-3 w-100"
                    onClick={() =>
                      dispatch(
                        addToCart({
                          id: product.id,
                          title: product.title,
                          price: product.price,
                          image: product.image,
                        })
                      )
                    }
                  >
                    Add to Cart
                  </button>
                  <div className="d-flex gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-50"
                      onClick={() => startEditing(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger w-50"
                      onClick={() => void handleDelete(product.id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Products State */}
      {filteredProducts.length === 0 && !productsLoading && !productsError && (
        <div className="alert alert-info" role="alert">
          No products found. Create one above to populate Firestore.
        </div>
      )}
    </div>
  );
}
