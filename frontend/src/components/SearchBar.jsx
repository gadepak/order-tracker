import React, { useState, useEffect } from 'react';
import API from '../api';

export default function SearchBar({ onSelect }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!q || q.length < 1) return setSuggestions([]);

    const t = setTimeout(async () => {
      try {
        const res = await API.get('/search', { params: { q } });
        setSuggestions(res.data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="form-control"
        placeholder="Search by order code, tray type, make, dimensions..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {suggestions.length > 0 && (
        <ul
          className="list-group mt-1"
          style={{ position: 'absolute', width: '100%', zIndex: 999 }}
        >
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="list-group-item list-group-item-action"
              onClick={() => onSelect(s)}
              style={{ cursor: "pointer" }}
            >
              <strong>{s.order_code}</strong>

              <div className="small text-muted">
                {s.tray_type && <>Tray: {s.tray_type}</>}
              </div>

              <div className="small text-muted">
                {s.make && <>Make: {s.make}</>}
              </div>

              <div className="small text-muted">
                {s.dimensions && <>Dim: {s.dimensions}</>}
              </div>

              <div className="small">
                Status: <strong>{s.status}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
