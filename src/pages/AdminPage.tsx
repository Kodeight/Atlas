import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { AtlasLogo } from '../components/BrandElements';
import { LogOut, Menu, Package, Pencil, Plus, ShoppingCart, Trash2, Users, LayoutDashboard, Settings, X } from 'lucide-react';
import { ProductForm, AdminProduct, ProductFormValue } from '../components/admin/ProductForm';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  pfp: string;
}

interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  status: 'pending' | 'processing' | 'delivered';
  date: string;
  products?: { productId: string; name: string; quantity: number; price: number }[];
  items?: { productId: string; name: string; quantity: number; price: number }[];
}

type ActiveTab = 'dashboard' | 'products' | 'orders' | 'admins' | 'settings';

async function adminApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`/admin/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.message) || `Request failed (${res.status}).`);
  return data;
}

const AdminPage: React.FC = () => {
  const { navigate } = useShop();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });

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

  const showNotice = (type: 'success' | 'error', text: string) => setNotice({ type, text });

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const reload = async () => {
    const [freshProducts, freshOrders, freshUsers] = await Promise.all([
      adminApi('/products').catch(() => []),
      adminApi('/orders').catch(() => []),
      adminApi('/users').catch(() => []),
    ]);
    setProducts(Array.isArray(freshProducts) ? freshProducts : []);
    setOrders(Array.isArray(freshOrders) ? freshOrders : []);
    setUsers(Array.isArray(freshUsers) ? freshUsers : []);
  };

  useEffect(() => {
    if (!user) return;
    reload().catch(() => {});
  }, [user]);

  const handleProductSubmit = async (value: ProductFormValue) => {
    setSaving(true);
    try {
      if (editingProduct) {
        await adminApi(`/products/${editingProduct.id}`, { method: 'PUT', body: JSON.stringify(value) });
        showNotice('success', 'Product updated.');
      } else {
        await adminApi('/products', { method: 'POST', body: JSON.stringify(value) });
        showNotice('success', 'Product added.');
      }
      setFormOpen(false);
      setEditingProduct(null);
      await reload();
    } catch (e) {
      showNotice('error', e instanceof Error ? e.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await adminApi(`/products/${id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      showNotice('success', 'Product deleted.');
      await reload();
    } catch (e) {
      showNotice('error', e instanceof Error ? e.message : 'Could not delete product.');
    }
  };

  const handleOrderStatus = async (id: string, status: AdminOrder['status']) => {
    try {
      await adminApi(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showNotice('success', 'Order status updated.');
      await reload();
    } catch (e) {
      showNotice('error', e instanceof Error ? e.message : 'Could not update order status.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi('/users', { method: 'POST', body: JSON.stringify(userForm) });
      setUserForm({ name: '', email: '', password: '' });
      showNotice('success', 'Admin user created.');
      await reload();
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Could not create admin user.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await adminApi(`/users/${id}`, { method: 'DELETE' });
      showNotice('success', 'Admin user deleted.');
      await reload();
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Could not delete admin user.');
    }
  };

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
    { id: 'admins', label: 'Admins', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  useEffect(() => {
    // Lock body scroll while the mobile drawer is open
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex bg-[#F7F3EA] font-sans-ui">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Sidebar - Atlas Green #1F5742 with 25px radius on right; drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] shrink-0 bg-[#1F5742] text-white flex flex-col transition-transform duration-300 md:static md:z-auto md:max-w-none md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          borderTopRightRadius: '25px',
          borderBottomRightRadius: '25px',
        }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <AtlasLogo className="h-8 w-auto brightness-0 invert" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 text-xs text-white/70">
            <div className="font-medium text-white">{user.name}</div>
            <div className="truncate">{user.email}</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
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
        <header className="bg-[#FCFBF7] border-b border-[#E7E3DA] px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-[#1F5742] hover:bg-[#F7F3EA]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-[#151515] font-sans-ui capitalize truncate">{activeTab}</h1>
          </div>
          <div className="text-xs text-[#6D6D6D] shrink-0">Atlas Admin • {new Date().toLocaleDateString()}</div>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-[#F7F3EA] overflow-auto">
          {notice && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm font-sans-ui border ${
                notice.type === 'success'
                  ? 'bg-[#1F5742]/10 border-[#1F5742]/30 text-[#1F5742]'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {notice.text}
            </div>
          )}
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
                <h3 className="text-sm font-semibold text-[#151515] mb-3 font-sans-ui">Recent Orders</h3>
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
            <div className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[#6D6D6D] font-sans-ui">Managed via CMS • changes appear on storefront</div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F5742] text-white text-sm font-medium font-sans-ui hover:bg-[#164030] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add product
                </button>
              </div>
              {formOpen && (
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <h3 className="text-sm font-semibold text-[#151515] font-sans-ui mb-4">
                    {editingProduct ? 'Update product' : 'Add new product'}
                  </h3>
                  <ProductForm
                    product={editingProduct}
                    saving={saving}
                    onCancel={() => {
                      setFormOpen(false);
                      setEditingProduct(null);
                    }}
                    onSubmit={handleProductSubmit}
                  />
                </div>
              )}
              <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E7E3DA]">
                  <h3 className="text-sm font-semibold font-sans-ui">Products ({products.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA] bg-[#FCFBF7]">
                        <th className="text-left px-4 py-2 font-medium">Product</th>
                        <th className="text-left px-4 py-2 font-medium">Price</th>
                        <th className="text-left px-4 py-2 font-medium">Stock</th>
                        <th className="text-right px-4 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#F7F3EA]">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-11 w-11 rounded-lg object-cover border border-[#E7E3DA] shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-[#151515] truncate">{p.name}</div>
                                {p.flavor && <div className="text-xs text-[#6D6D6D] truncate">{p.flavor}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">{p.price} DA</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {p.stock <= 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Out of stock</span>
                            ) : (
                              p.stock
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setFormOpen(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7E3DA] text-xs font-medium text-[#151515] hover:bg-[#F7F3EA] transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              {deleteTarget === p.id ? (
                                <>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E7E3DA] text-xs font-medium text-[#151515] hover:bg-[#F7F3EA] transition-colors"
                                  >
                                    Keep
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setDeleteTarget(p.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#6D6D6D]">
                            No products yet. Add the first one to populate the storefront.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7E3DA]">
                <h3 className="text-sm font-semibold font-sans-ui">Orders ({orders.length})</h3>
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
                      {orders.map((o) => {
                        const items = o.products ?? o.items ?? [];
                        return (
                          <tr key={o.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#F7F3EA]">
                            <td className="px-4 py-2">
                              <div className="font-mono text-xs">{o.id.slice(0, 12)}</div>
                              {items.length > 0 && (
                                <div className="text-xs text-[#6D6D6D] mt-1">
                                  {items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2">{o.customerName}</td>
                            <td className="px-4 py-2">{o.phone}</td>
                            <td className="px-4 py-2 font-medium whitespace-nowrap">{o.total} DA</td>
                            <td className="px-4 py-2">
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderStatus(o.id, e.target.value as AdminOrder['status'])}
                                className="px-3 py-1.5 rounded-full text-xs font-medium font-sans-ui bg-[#1F5742] text-white outline-none cursor-pointer capitalize"
                              >
                                {(['pending', 'processing', 'delivered'] as const).map((s) => (
                                  <option key={s} value={s} className="text-black bg-white capitalize">
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6D6D6D]">
                            No orders yet. Orders will appear here once customers check out.
                          </td>
                        </tr>
                      )}
                    </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'admins' && (
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                <h3 className="text-sm font-semibold text-[#151515] font-sans-ui">Create admin user</h3>
                <p className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">Add a new admin with email and password.</p>
                <form onSubmit={handleCreateUser} className="mt-4 space-y-3">
                  <input
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                    minLength={3}
                    autoComplete="off"
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                    autoComplete="off"
                    placeholder="admin@atlas.dz"
                    className="w-full px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Password (min 8 chars, 1 number)"
                    className="w-full px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium font-sans-ui hover:bg-[#164030] transition-colors"
                  >
                    Create admin
                  </button>
                </form>
              </div>
              <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E7E3DA]">
                  <h3 className="text-sm font-semibold font-sans-ui">Admin users ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#F7F3EA]">
                          <td className="px-4 py-3">
                            <div className="font-medium text-[#151515]">{u.name}</div>
                            <div className="text-xs text-[#6D6D6D]">{u.email}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {u.id === user?.id ? (
                              <span className="text-xs text-[#6D6D6D]">Current session</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-[#6D6D6D]">No admin users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg border border-[#E7E3DA] p-10 text-center">
              <div className="text-sm font-medium text-[#151515] capitalize">Settings</div>
              <div className="text-xs text-[#6D6D6D] mt-1">This section is managed via the existing CMS backend.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
