import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import OurWorks from './pages/OurWorks';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import RefundPolicy from './pages/RefundPolicy';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';
import AdminPortfolio from './pages/admin/Portfolio';
import AdminSettings from './pages/admin/Settings';
import AdminContent from './pages/admin/Content';
import AdminReports from './pages/admin/Reports';
import AdminPOS from './pages/admin/POS';
import AdminLayout from './components/AdminLayout';

function Router() {
  const [path, setPath] = useState(window.location.pathname);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const newPath = new URL(anchor.href).pathname;
        window.history.pushState({}, '', newPath);
        setPath(newPath);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const isAdminRoute = path.startsWith('/admin');
  const isAdminLogin = path === '/admin/login';

  if (isAdminRoute && !isAdminLogin) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900" />
        </div>
      );
    }

    if (!user) {
      window.location.href = '/admin/login';
      return null;
    }

    const handleProductFormBack = () => {
      window.history.pushState({}, '', '/admin/products');
      setPath('/admin/products');
    };

    const productIdMatch = path.match(/\/admin\/products\/edit\/(.*)/);
    const productId = productIdMatch ? productIdMatch[1] : null;

    return (
      <AdminLayout>
        {path === '/admin' && <AdminDashboard />}
        {path === '/admin/products' && <AdminProducts />}
        {path === '/admin/products/new' && <AdminProductForm onBack={handleProductFormBack} />}
        {productId && <AdminProductForm productId={productId} onBack={handleProductFormBack} />}
        {path === '/admin/orders' && <AdminOrders />}
        {path === '/admin/customers' && <AdminCustomers />}
        {path === '/admin/portfolio' && <AdminPortfolio />}
        {path === '/admin/reports' && <AdminReports />}
        {path === '/admin/pos' && <AdminPOS />}
        {path === '/admin/content' && <AdminContent />}
        {path === '/admin/settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  if (isAdminLogin) {
    return <AdminLogin />;
  }


  const productSlugMatch = path.match(/^\/product\/(.+)$/);
  const productSlug = productSlugMatch ? productSlugMatch[1] : null;

  return (
    <>
      <Header />

      <main>
        {path === '/' && <Home />}
        {path === '/shop' && <Shop />}
        {productSlug && <ProductDetail slug={productSlug} />}
        {path === '/about' && <About />}
        {path === '/our-works' && <OurWorks />}
        {path === '/contact' && <Contact />}
        {path === '/checkout' && <Checkout />}
        {path === '/privacy-policy' && <PrivacyPolicy />}
        {path === '/shipping-policy' && <ShippingPolicy />}
        {path === '/refund-policy' && <RefundPolicy />}
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
