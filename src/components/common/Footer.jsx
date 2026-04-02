function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <p className="text-sm">A production-ready Vite + Tailwind CSS frontend template.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} Vite + Tailwind App. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
