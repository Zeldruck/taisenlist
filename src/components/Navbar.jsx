import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkStyle = ({ isActive }) =>
    `px-4 py-2 rounded ${isActive ? "bg-blue-500 text-white" : "bg-gray-200"}`;

  return (
    <nav className="flex gap-2 p-4 bg-white shadow">
      <NavLink to="/" className={linkStyle}>Home</NavLink>
      <NavLink to="/stats" className={linkStyle}>Stats</NavLink>
    </nav>
  );
}
