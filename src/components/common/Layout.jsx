import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-h-0">
          <Header onOpenMobile={() => setMobileOpen(true)} />

          <main className="flex-1 overflow-auto py-6">
            <div className="px-20">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
