import { useState } from "react";
import API from "../api/client";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const nav = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.post("/product", { name, price });
      nav("/products");
    } catch (err) {
      alert(err.response?.data || "Error adding product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl mb-4">Add Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        className="w-full mb-3 p-2 border rounded"
        value={name} onChange={e => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        className="w-full mb-3 p-2 border rounded"
        value={price} onChange={e => setPrice(e.target.value)}
      />
      <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded">
        Create
      </button>
    </form>
  );
}
