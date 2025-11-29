import React, { useState, useEffect, useCallback } from "react";
import API from "../api";
import SearchBar from "../components/SearchBar";
import AddOrderForm from "../components/AddOrderForm";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAddOrder, setShowAddOrder] = useState(false);

  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();

  /* --------------------------------------------
      FETCH ORDERS BASED ON ACTIVE TAB
  --------------------------------------------- */
  const loadOrders = useCallback(async () => {
    try {
      let url = "/orders/pending/all";

      if (activeTab === "completed") url = "/orders/completed/all";
      if (activeTab === "deleted") url = "/orders/deleted/all";

      const res = await API.get(url);
      setOrders(res.data.orders);
      setSelected(null);
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin/login");
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);


  /* --------------------------------------------
      SELECT / UPDATE / DELETE ORDER
  --------------------------------------------- */
  const selectOrder = async (order) => {
    try {
      const res = await API.get(`/orders/${order.id}`);
      setSelected(res.data.order);
    } catch {
      alert("Failed to load order");
    }
  };

  const updateStatus = async (id, status) => {
    await API.patch(`/orders/${id}/status`, { status });
    loadOrders();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Move this order to Deleted list?")) return;

    await API.delete(`/orders/${id}`);
    loadOrders();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  /* --------------------------------------------
      RENDER
  --------------------------------------------- */
  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management Dashboard</h2>

        <div>
          <button className="btn btn-success me-2" onClick={() => setShowAddOrder(true)}>
            + New Order
          </button>

          <button className="btn btn-outline-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-3">
        <button
          className={`btn me-2 ${activeTab === "pending" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Orders
        </button>

        <button
          className={`btn me-2 ${activeTab === "completed" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed Orders
        </button>

        <button
          className={`btn ${activeTab === "deleted" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setActiveTab("deleted")}
        >
          Deleted Orders
        </button>
      </div>

      {/* SEARCH BOX */}
      {activeTab !== "deleted" && (
        <div className="mb-3 w-50">
          <SearchBar onSelect={selectOrder} />
        </div>
      )}

      <div className="row">

        {/* LEFT SIDE — TABLE */}
        <div className="col-md-8">
          <div className="card p-3">

            <h5>
              {activeTab === "pending" && "Pending Orders"}
              {activeTab === "completed" && "Completed Orders"}
              {activeTab === "deleted" && "Deleted Orders"}
            </h5>

            <table className="table table-striped mt-3">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Registered</th>
                  <th>Updated</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => selectOrder(o)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{o.order_code}</td>
                    <td>{o.product_name}</td>
                    <td>{o.customer_name}</td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td>{new Date(o.updated_at).toLocaleString()}</td>
                    <td>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>

        {/* RIGHT SIDE — DETAILS */}
        <div className="col-md-4">
          <div className="card p-3">

            {!selected && <p>Select an order</p>}

            {selected && (
              <>
                <h4>{selected.order_code}</h4>

                <p><strong>Product:</strong> {selected.product_name}</p>
                <p><strong>Customer:</strong> {selected.customer_name}</p>
                <p><strong>Registered:</strong> {new Date(selected.created_at).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> {new Date(selected.updated_at).toLocaleString()}</p>
                <p><strong>Status:</strong> {selected.status}</p>

                {/* Status Update only for pending & completed */}
                {activeTab !== "deleted" && (
                  <>
                    <h6>Update Status:</h6>
                    <div className="d-flex gap-2 mb-3">
                      {["registered", "processing", "completing", "completed"].map((s) => (
                        <button
                          key={s}
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateStatus(selected.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* DELETE BUTTON */}
                {activeTab !== "deleted" && (
                  <button
                    className="btn btn-danger w-100"
                    onClick={() => handleDelete(selected.id)}
                  >
                    Delete Order
                  </button>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* ADD ORDER POPUP */}
      {showAddOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
          <AddOrderForm
            onClose={() => setShowAddOrder(false)}
            onCreated={loadOrders}
          />
        </div>
      )}

    </div>
  );
}
