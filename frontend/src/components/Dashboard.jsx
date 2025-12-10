import React, { useState, useEffect } from 'react';
import API from '../api';
import SearchBar from './SearchBar';
import AddOrderForm from './AddOrderForm';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAddOrder, setShowAddOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await API.get('/orders/pending/all');
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  }

  async function onSelect(order) {
    try {
      const res = await API.get(`/orders/${order.id}`);
      setSelected(res.data.order);
    } catch (err) {
      console.error('Select order error:', err);
    }
  }

  async function changeStatus(id, newStatus) {
    try {
      await API.patch(`/orders/${id}/status`, { status: newStatus });
      fetchOrders();
      setSelected(null);
    } catch (err) {
      console.error('Update status error:', err);
    }
  }

  return (
    <div className="container mt-4">

      {/* Search + New Order Button */}
      <div className="row mb-4">
        <div className="col-8">
          <SearchBar onSelect={onSelect} />
        </div>
        <div className="col-4 text-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddOrder(true)}
          >
            + New Order
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="row">

        {/* Left side - Recent Orders */}
        <div className="col-8">
          <h5>Recent Orders</h5>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Order Code</th>
                <th>Tray Type</th>
                <th>S.No</th>
                <th>Make</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(o => (
                <tr
                  key={o.id}
                  onClick={() => onSelect(o)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{o.order_code}</td>
                  <td>{o.tray_type}</td>
                  <td>{o.serial_no}</td>
                  <td>{o.make}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td>{new Date(o.updated_at).toLocaleString()}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side - Order Details */}
        <div className="col-4">
          {selected ? (
            <div className="card p-3">

              <h6><strong>{selected.order_code}</strong></h6>

              <p><strong>Tray Type:</strong> {selected.tray_type}</p>
              <p><strong>S.No:</strong> {selected.serial_no}</p>
              <p><strong>Make:</strong> {selected.make}</p>
              <p><strong>Dimensions:</strong> {selected.dimensions}</p>
              <p><strong>Nos:</strong> {selected.nos}</p>
              <p><strong>Size:</strong> {selected.size}</p>

              <div className="mt-3">
                <strong>Status:</strong>
                <div className="btn-group mt-2">
                  {["CUTTING", "PERFORATED", "BENDING", "COMPLETED"].map(s => (
                    <button
                      key={s}
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => changeStatus(selected.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="card p-3">Select an order</div>
          )}
        </div>
      </div>

      {/* Add Order Popup */}
      {showAddOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <AddOrderForm
            onClose={() => setShowAddOrder(false)}
            onCreated={fetchOrders}
          />
        </div>
      )}

    </div>
  );
}
