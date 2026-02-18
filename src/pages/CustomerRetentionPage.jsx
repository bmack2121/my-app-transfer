import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const CustomerRetentionPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const loadCustomers = async () => {
    const res = await axiosClient.get("/customers");
    setCustomers(res.data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-midnight mb-6">
        Customer Retention Management
      </h1>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="Search customers..."
          className="p-3 border rounded-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-midnight text-white">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Last Contact</th>
              <th className="p-4 text-left">Next Follow‑Up</th>
              <th className="p-4 text-left">Engagement</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr
                key={c._id}
                className="border-b hover:bg-softgray cursor-pointer"
                onClick={() => setSelected(c)}
              >
                <td className="p-4">{c.name}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4">
                  <span className="bg-electric text-white px-3 py-1 rounded-md">
                    {c.status || "New Lead"}
                  </span>
                </td>
                <td className="p-4">{c.lastContact || "—"}</td>
                <td className="p-4">{c.nextFollowUp || "—"}</td>
                <td className="p-4">
                  <div className="w-32 bg-softgray rounded-full h-2">
                    <div
                      className="bg-electric h-2 rounded-full"
                      style={{ width: `${c.engagement || 20}%` }}
                    ></div>
                  </div>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="bg-electric text-white px-3 py-1 rounded-md">
                    Call
                  </button>
                  <button className="bg-midnight text-white px-3 py-1 rounded-md">
                    Text
                  </button>
                  <button className="bg-carbon text-white px-3 py-1 rounded-md">
                    Email
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide‑Out Customer Detail Panel */}
      {selected && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl p-6 overflow-y-auto">
          <button
            className="text-midnight mb-4"
            onClick={() => setSelected(null)}
          >
            Close
          </button>

          <h2 className="font-heading text-2xl text-midnight mb-4">
            {selected.name}
          </h2>

          <p className="mb-2">
            <strong>Phone:</strong> {selected.phone}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {selected.email}
          </p>
          <p className="mb-2">
            <strong>Status:</strong> {selected.status || "New Lead"}
          </p>

          <hr className="my-4" />

          <h3 className="font-heading text-xl mb-2">Deal History</h3>
          <div className="space-y-3">
            {(selected.deals || []).map((deal) => (
              <div
                key={deal._id}
                className="p-3 border rounded-md bg-softgray"
              >
                <p>
                  <strong>Vehicle:</strong> {deal.vehicle}
                </p>
                <p>
                  <strong>Payment:</strong> ${deal.payment}
                </p>
                <p>
                  <strong>Date:</strong> {deal.date}
                </p>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <h3 className="font-heading text-xl mb-2">Notes</h3>
          <textarea
            className="w-full p-3 border rounded-md"
            rows="4"
            placeholder="Add notes about this customer..."
          ></textarea>

          <button className="bg-electric text-white px-6 py-2 rounded-md font-heading mt-4 w-full">
            Save Notes
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerRetentionPage;