import type { User } from 'firebase/auth';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../services/orderService';

interface OrderDetailProps {
  user: User;
}

export default function OrderDetail({ user }: OrderDetailProps) {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', user.uid, orderId],
    queryFn: () => getOrderById(orderId ?? '', user.uid),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          Failed to load order details.
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning" role="alert">
          Order not found.
        </div>
        <Link to="/orders" className="btn btn-outline-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Order Details</h1>
        <Link to="/orders" className="btn btn-outline-primary">
          Back to Orders
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="text-muted">Cart ID</div>
              <div className="fw-semibold">{order.id}</div>
            </div>
            <div className="col-md-6">
              <div className="text-muted">Created</div>
              <div>{order.createdAt?.toDate().toLocaleString() ?? 'Pending timestamp'}</div>
            </div>
            <div className="col-md-6">
              <div className="text-muted">Status</div>
              <div className="text-capitalize">{order.status}</div>
            </div>
            <div className="col-md-6">
              <div className="text-muted">Total Price</div>
              <div className="fw-semibold text-primary fs-5">${order.totalPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="h4 mb-3">Products in Order</h2>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ maxWidth: '56px', maxHeight: '56px', marginRight: '0.75rem' }}
                    />
                    <span>{item.title}</span>
                  </div>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td className="fw-semibold">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
