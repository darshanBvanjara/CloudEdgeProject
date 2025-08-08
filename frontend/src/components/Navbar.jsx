import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="space-x-4">
        <Link to="/products" className="hover:underline">Products</Link>
        <Link to="/add-product" className="hover:underline">Add Product</Link>
      </div>
      <div>
        <Link to="/login" className="hover:underline mr-4">Login</Link>
        <Link to="/register" className="hover:underline">Register</Link>
      </div>
    </nav>
  );
}
