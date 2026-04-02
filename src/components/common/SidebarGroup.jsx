import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

function SidebarGroup({ title, items = [] }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // open group if current path matches any child
    const match = items.some((it) => location.pathname.startsWith(it.to));
    if (match) setOpen(true);
  }, [location.pathname, items]);

  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [open, items]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
      >
        <span className="font-medium text-gray-700">{title}</span>
        <span className={`text-gray-400 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}>
          <FaChevronDown />
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 mt-2"
        style={{ maxHeight }}
        ref={contentRef}
      >
        <ul className="space-y-1 pl-2">
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 text-sm border-l-4 border-transparent ${isActive ? 'bg-gray-50 font-semibold text-gray-900 border-primary-500' : ''}`
                }
              >
                {it.icon && <it.icon className="w-4 h-4 text-primary-600" />}
                <span>{it.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SidebarGroup;
