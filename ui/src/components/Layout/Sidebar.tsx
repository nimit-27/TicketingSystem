import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => (
  <div className="bg-light p-3" style={{ minWidth: '200px' }}>
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link to="/tickets" className="nav-link">My Tickets</Link>
      </li>
      <li className="nav-item">
        <Link to="/create-ticket" className="nav-link">Raise Ticket</Link>
      </li>
      <li className="nav-item">
        <Link to="/knowledge-base" className="nav-link">Knowledge Base</Link>
      </li>
    </ul>
  </div>
);

export default Sidebar;
