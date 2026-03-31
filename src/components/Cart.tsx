import { useState } from 'react';
import type { User } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import type { RootState } from '../store/store';
import { createOrder } from '../services/orderService';

interface CartProps {
  user: User;
}

export default function Cart({ user }: CartProps) {
  const dispatch = useDispatch();
  const { items, totalItems, totalPrice } = useSelector((state: RootState) => state.cart);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  async function handleCheckout() {
    setCheckoutError('');
    setIsPlacingOrder(true);

    try {
      await createOrder({
        userId: user.uid,
        userEmail: user.email,
        items,
        totalItems,
        totalPrice,
      });

      dispatch(clearCart());
      setShowConfirm(false);
      setOrderPlaced(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to place order.';
      setCheckoutError(message);
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (orderPlaced) {
    return (
      <div className="container my-5 text-center">
        <div className="card shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
          <div className="card-body py-5">
            <div className="mb-4" style={{ fontSize: '4rem' }}>✅</div>
            <h2 className="card-title mb-3">Order Placed!</h2>
            <p className="text-muted mb-4">
              Thank you for your purchase. Your order has been successfully placed and is being processed.
            </p>
            <a href="/" className="btn btn-primary px-4">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container my-5">
        <h1 className="mb-4">Shopping Cart</h1>
        <div className="alert alert-info" role="alert">
          Your shopping cart is empty.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1 className="mb-4">Shopping Cart</h1>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="align-middle">
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ maxWidth: '60px', maxHeight: '60px', marginRight: '1rem' }}
                    />
                    <span>{item.title}</span>
                  </div>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>
                  <div className="input-group" style={{ width: '120px' }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="form-control text-center"
                      value={item.quantity}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="fw-bold">${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="row mt-4">
        <div className="col-md-8"></div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              {checkoutError && (
                <div className="alert alert-danger" role="alert">
                  {checkoutError}
                </div>
              )}

              <h5 className="card-title">Order Summary</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Total Items:</span>
                <span className="fw-bold">{totalItems}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Total Price:</span>
                <span className="fs-5 fw-bold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-primary w-100 mb-2"
                onClick={() => setShowConfirm(true)}
                disabled={isPlacingOrder}
              >
                Proceed to Checkout
              </button>
              <a href="/" className="btn btn-outline-secondary w-100">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Order</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowConfirm(false)}
                  />
                </div>
                <div className="modal-body">
                  <p>You are about to place an order for <strong>{totalItems} item{totalItems !== 1 ? 's' : ''}</strong> totalling <strong>${totalPrice.toFixed(2)}</strong>.</p>
                  <p className="text-muted mb-0">Do you want to proceed?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void handleCheckout()}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowConfirm(false)} />
        </>
      )}
    </div>
  );
}
