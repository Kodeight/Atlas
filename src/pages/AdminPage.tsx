import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { AtlasLogo } from '../components/BrandElements';
import { LogOut, Package, ShoppingCart, Users, LayoutDashboard, Settings } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  pfp: string;
}

const AdminPage: React.FC = () => {
  const { navigate } = useShop();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/admin/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          navigate('/login');
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetch('/admin/api/products', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setProducts)
      .catch(() => {});
    fetch('/admin/api/orders', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await fetch('/admin/api/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] text-[#151515]">
        <div className="text-sm text-[#6D6D6D]">Loading admin...</div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex bg-[#F7F3EA] font-sans-ui">
      {/* Sidebar - Atlas Green #1F5742 with 25px radius on right */}
      <aside
        className="w-64 shrink-0 bg-[#1F5742] text-white flex flex-col"
        style={{
          borderTopRightRadius: '25px',
          borderBottomRightRadius: '25px',
        }}
      >
        <div className="p-6 border-b border-white/10">
          <AtlasLogo className="h-8 w-auto brightness-0 invert" />
          <div className="mt-4 text-xs text-white/70">
            <div className="font-medium text-white">{user.name}</div>
            <div className="truncate">{user.email}</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-2 text-xs text-white/60 hover:text-white text-left px-3"
          >
            ← Back to storefront
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#FCFBF7] border-b border-[#E7E3DA] px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#151515] font-sans-ui capitalize">{activeTab}</h1>
          <div className="text-xs text-[#6D6D6D]">Atlas Admin • {new Date().toLocaleDateString()}</div>
        </header>
        <main className="flex-1 p-6 bg-[#F7F3EA] overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <div className="text-xs font-medium text-[#6D6D6D] font-sans-ui">Products</div>
                  <div className="text-2xl font-semibold text-[#151515] mt-1 font-sans-ui">{products.length}</div>
                  <div className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">Managed in CMS</div>
                </div>
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <div className="text-xs font-medium text-[#6D6D6D] font-sans-ui">Orders</div>
                  <div className="text-2xl font-semibold text-[#151515] mt-1 font-sans-ui">{orders.length}</div>
                  <div className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">COD orders</div>
                </div>
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <div className="text-xs font-medium text-[#6D6D6D] font-sans-ui">Revenue</div>
                  <div className="text-2xl font-semibold text-[#1F5742] mt-1">
                    {orders.reduce((s: number, o: any) => s + (o.total || 0), 0).toLocaleString()} DA
                  </div>
                  <div className="text-xs text-[#6D6D6D] mt-1">Total sales</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                <h3 className="text-sm font-semibold text-[#151515] mb-3">Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="text-sm text-[#6D6D6D]">No orders yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA]">
                          <th className="text-left py-2 font-medium">Order</th>
                          <th className="text-left py-2 font-medium">Customer</th>
                          <th className="text-left py-2 font-medium">Total</th>
                          <th className="text-left py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((o: any) => (
                          <tr key={o.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#FCFBF7]">
                            <td className="py-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
                            <td className="py-2">{o.customerName}</td>
                            <td className="py-2 font-medium">{o.total} DA</td>
                            <td className="py-2">
                              <span className="px-2 py-0.5 rounded-full text-xs bg-[#1F5742] text-white">{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'products' && (
            <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7E3DA] flex items-center justify-between">
                <h3 className="text-sm font-semibold">Products ({products.length})</h3>
                <span className="text-xs text-[#6D6D6D]">Managed via CMS • changes appear on storefront</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA] bg-[#FCFBF7]">
                      <th className="text-left px-4 py-2 font-medium">Name</th>
                      <th className="text-left px-4 py-2 font-medium">Price</th>
                      <th className="text-left px-4 py-2 font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p: any) => (
                      <tr key={p.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#F7F3EA]">
                        <td className="px-4 py-2 font-medium text-[#151515]">{p.name}</td>
                        <td className="px-4 py-2">{p.price} DA</td>
                        <td className="px-4 py-2">{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7E3DA]">
                <h3 className="text-sm font-semibold">Orders ({orders.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA] bg-[#FCFBF7]">
                      <th className="text-left px-4 py-2 font-medium">Order</th>
                      <th className="text-left px-4 py-2 font-medium">Customer</th>
                      <th className="text-left px-4 py-2 font-medium">Phone</th>
                      <th className="text-left px-4 py-2 font-medium">Total</th>
                      <th className="text-left px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any) => (
                      <tr key={o.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#F7F3EA]">
                        <td className="px-4 py-2 font-mono text-xs">{o.id}</td>
                        <td className="px-4 py-2">{o.customerName}</td>
                        <td className="px-4 py-2">{o.phone}</td>
                        <td className="px-4 py-2 font-medium">{o.total} DA</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#1F5742] text-white capitalize">{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {(activeTab === 'customers' || activeTab === 'settings') && (
            <div className="bg-white rounded-lg border border-[#E7E3DA] p-10 text-center">
              <div className="text-sm font-medium text-[#151515] capitalize">{activeTab}</div>
              <div className="text-xs text-[#6D6D6D] mt-1">This section is managed via the existing CMS backend.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
