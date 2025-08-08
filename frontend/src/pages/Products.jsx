import { useEffect, useState } from "react";
import API from "../api/client";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("/products").then(res => setProducts(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(p => (
        <div key={p._id} className="border p-4 rounded shadow">
          <h3 className="font-semibold">{p.name}</h3>
          <p>Price: ₹{p.price}</p>
        </div>
      ))}
    </div>
  );
}
