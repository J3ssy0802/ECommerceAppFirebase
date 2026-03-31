import type { User } from 'firebase/auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../services/orderService';

interface OrdersProps {
  user: User;
}

export default function Orders({ user }: OrdersProps) {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', user.uid],
    queryFn: () => getUserOrders(user.uid),
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          Failed to load your order history.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1 className="mb-4">Order History</h1>

      {!orders || orders.length === 0 ? (
        <div className="alert alert-info" role="alert">
          You have not placed any orders yet.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Cart ID</th>
                <th>Date</th>
                <th>Total Items</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="fw-semibold">{order.id}</td>
                  <td>{order.createdAt?.toDate().toLocaleString() ?? 'Pending timestamp'}</td>
                  <td>{order.totalItems}</td>
                  <td className="fw-semibold text-primary">${order.totalPrice.toFixed(2)}</td>
                  <td className="text-capitalize">{order.status}</td>
                  <td>
                    <Link className="btn btn-outline-primary btn-sm" to={`/orders/${order.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
