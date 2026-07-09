import { Link } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];

const HELP_LINKS = [
  { label: 'Track Your Order', to: '/orders' },
  { label: 'Returns & Refunds', to: '#' },
  { label: 'Shipping Info', to: '#' },
  { label: 'Contact Us', to: '#' },
  { label: 'FAQs', to: '#' },
];

const COMPANY_LINKS = [
  { label: 'About ShopForge', to: '#' },
  { label: 'Careers', to: '#' },
  { label: 'Press & Media', to: '#' },
  { label: 'Sell on ShopForge', to: '#' },
  { label: 'Advertise', to: '#' },
];

const POLICY_LINKS = [
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms of Use', to: '#' },
  { label: 'Cookie Policy', to: '#' },
  { label: 'Grievance Redressal', to: '#' },
];

const PaymentLogos = () => (
  <div className="flex flex-wrap gap-2 items-center mt-3">
    {['Visa', 'Mastercard', 'UPI', 'Net Banking', 'COD'].map((method) => (
      <span key={method} className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-600">
        {method}
      </span>
    ))}
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-gray-400 mt-12">

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#FF6B00" />
                <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="23" cy="22" r="3" fill="white" />
              </svg>
              <span className="text-white font-bold text-base">ShopForge</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 mb-4">
              India's trusted online marketplace. Shop from 10,000+ products across 14 categories with fast, reliable delivery.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>CIN: L74999MH2023PLC000001</p>
              <p>GSTIN: 27AABCS1429B1ZB</p>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Shop by Category</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="text-xs text-gray-400 hover:text-orange-400 no-underline transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="text-xs text-orange-400 hover:text-orange-300 no-underline transition-colors font-medium">
                  View all categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Customer Service</h4>
            <ul className="space-y-2">
              {HELP_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-xs text-gray-400 hover:text-orange-400 no-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Company</h4>
            <ul className="space-y-2 mb-6">
              {COMPANY_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-xs text-gray-400 hover:text-orange-400 no-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white text-xs font-semibold mb-2 uppercase tracking-wide">Accepted Payments</h4>
            <PaymentLogos />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600 order-2 sm:order-1">
            © {new Date().getFullYear()} ShopForge Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 order-1 sm:order-2">
            {POLICY_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className="text-xs text-gray-600 hover:text-gray-400 no-underline transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
