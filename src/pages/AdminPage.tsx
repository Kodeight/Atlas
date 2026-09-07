import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { AtlasLogo } from '../components/BrandElements';
import { LogOut, Menu, Download, Package, Pencil, Plus, ShoppingCart, Tag, Trash2, Users, LayoutDashboard, Settings, X } from 'lucide-react';
import { ProductForm, AdminProduct, ProductFormValue, CategoryOption } from '../components/admin/ProductForm';
import { adminText } from '../components/admin/adminText';
import { downloadOrdersCsv } from '../components/admin/ordersCsv';
import { SettingsForm } from '../components/admin/SettingsForm';
import { useCountUp } from '../components/admin/useCountUp';
import { SITE_TITLE } from '../pageMeta';

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
  shippingCompany?: string | null;
  deliveryType?: string;
  date: string;
  products?: { productId: string; name: string; quantity: number; price: number }[];
  items?: { productId: string; name: string; quantity: number; price: number }[];
}

interface ShippingCompany {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

interface AdminCategory {
  id: string;
  name: string;
  nameFr?: string | null;
  slug: string;
  description?: string | null;
  sortOrder: number;
  enabled: boolean;
  _count?: { products: number };
}

interface DashboardStats {
  products: number;
  orders: number;
  revenue: number;
}

type ActiveTab = 'dashboard' | 'products' | 'orders' | 'admins' | 'categories' | 'settings';

async function adminApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`/admin/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) throw new Error('__SESSION_EXPIRED__');
  if (!res.ok) throw new Error((data && data.message) || `Request failed (${res.status}).`);
  return data;
}

function friendlyError(t: { sessionExpired: string }, e: unknown, fallback: string): string {
  if (e instanceof Error && e.message === '__SESSION_EXPIRED__') return t.sessionExpired;
  if (e instanceof Error) return e.message;
  return fallback;
}

const AdminPage: React.FC = () => {
  const { navigate, language, setLanguage } = useShop();
  const t = adminText[language === 'fr' ? 'fr' : 'en'];
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);
  const [catForm, setCatForm] = useState({ id: '', name: '', nameFr: '', slug: '', description: '', enabled: true });
  const animatedProducts = useCountUp(products.length);
  const animatedOrders = useCountUp(orders.length);
  const animatedRevenue = useCountUp(stats?.revenue ?? 0);
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
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
    const [freshProducts, freshOrders, freshUsers, freshCompanies, freshSettings, freshStats, freshCategories] = await Promise.all([
      adminApi('/products').catch(() => []),
      adminApi('/orders').catch(() => []),
      adminApi('/users').catch(() => []),
      adminApi('/companies').catch(() => []),
      adminApi('/settings').catch(() => null),
      adminApi('/stats').catch(() => null),
      adminApi('/categories').catch(() => []),
    ]);
    setProducts(Array.isArray(freshProducts) ? freshProducts : []);
    setOrders(Array.isArray(freshOrders) ? freshOrders : []);
    setUsers(Array.isArray(freshUsers) ? freshUsers : []);
    setCompanies(Array.isArray(freshCompanies) ? freshCompanies : []);
    if (freshSettings && typeof freshSettings === 'object') setSettings(freshSettings);
    if (freshStats && typeof freshStats === 'object') setStats(freshStats as DashboardStats);
    setAdminCategories(Array.isArray(freshCategories) ? freshCategories : []);
  };

  const resetCatForm = () => setCatForm({ id: '', name: '', nameFr: '', slug: '', description: '', enabled: true });

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: catForm.name.trim(),
        nameFr: catForm.nameFr.trim() || undefined,
        slug: catForm.slug.trim().toLowerCase(),
        description: catForm.description.trim() || undefined,
        enabled: catForm.enabled,
      };
      if (catForm.id) {
        await adminApi(`/categories/${catForm.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminApi('/categories', { method: 'POST', body: JSON.stringify(payload) });
      }
      resetCatForm();
      await reload();
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : t.nErrCompany);
    }
  };

  const handleEditCategory = (c: AdminCategory) => {
    setCatForm({ id: c.id, name: c.name, nameFr: c.nameFr || '', slug: c.slug, description: c.description || '', enabled: c.enabled });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCategory = async (c: AdminCategory) => {
    try {
      await adminApi(`/categories/${c.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !c.enabled }) });
      await reload();
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : t.nErrCompany);
    }
  };

  const handleMoveCategory = async (c: AdminCategory, dir: -1 | 1) => {
    const ordered = [...adminCategories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = ordered.findIndex((x) => x.id === c.id);
    const other = ordered[idx + dir];
    if (!other) return;
    try {
      await adminApi(`/categories/${c.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: other.sortOrder }) });
      await adminApi(`/categories/${other.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: c.sortOrder }) });
      await reload();
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : t.nErrCompany);
    }
  };

  const handleDeleteCategory = async (c: AdminCategory) => {
    try {
      await adminApi(`/categories/${c.id}`, { method: 'DELETE' });
      if (catForm.id === c.id) resetCatForm();
      await reload();
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : t.nErrCompanyDelete);
    }
  };

  const handleSaveSettings = async (value: Record<string, any>) => {
    setSavingSettings(true);
    try {
      const updated = await adminApi('/settings', { method: 'PUT', body: JSON.stringify(value) });
      setSettings(updated);
      showNotice('success', t.sSaved);
    } catch (e) {
      showNotice('error', friendlyError(t, e, t.sLoadError));
    } finally {
      setSavingSettings(false);
    }
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
        showNotice('success', t.nProdUpdated);
      } else {
        await adminApi('/products', { method: 'POST', body: JSON.stringify(value) });
        showNotice('success', t.nProdAdded);
      }
      setFormOpen(false);
      setEditingProduct(null);
      await reload();
    } catch (e) {
      showNotice('error', friendlyError(t, e, t.nErrSave));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await adminApi(`/products/${id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      showNotice('success', t.nProdDeleted);
      await reload();
    } catch (e) {
      showNotice('error', friendlyError(t, e, t.nErrDelete));
    }
  };

  const handleOrderUpdate = async (id: string, patch: { status?: AdminOrder['status']; company?: string; deliveryType?: string }) => {
    try {
      await adminApi(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(patch) });
      showNotice('success', t.nOrderUpdated);
      await reload();
    } catch (e) {
      showNotice('error', friendlyError(t, e, t.nErrOrder));
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = companyName.trim();
    if (name.length < 2) return;
    try {
      await adminApi('/companies', { method: 'POST', body: JSON.stringify({ name }) });
      setCompanyName('');
      showNotice('success', t.nCompanyAdded);
      await reload();
    } catch (err) {
      showNotice('error', friendlyError(t, err, t.nErrCompany));
    }
  };

  const handleToggleCompany = async (company: ShippingCompany) => {
    try {
      await adminApi(`/companies/${company.id}`, { method: 'PATCH', body: JSON.stringify({ active: !company.active }) });
      showNotice('success', t.nCompanyUpdated);
      await reload();
    } catch (err) {
      showNotice('error', friendlyError(t, err, t.nErrCompany));
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await adminApi(`/companies/${id}`, { method: 'DELETE' });
      showNotice('success', t.nCompanyDeleted);
      await reload();
    } catch (err) {
      showNotice('error', friendlyError(t, err, t.nErrCompanyDelete));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi('/users', { method: 'POST', body: JSON.stringify(userForm) });
      setUserForm({ name: '', email: '', password: '' });
      showNotice('success', t.nAdminCreated);
      await reload();
    } catch (err) {
      showNotice('error', friendlyError(t, err, t.nErrUserCreate));
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await adminApi(`/users/${id}`, { method: 'DELETE' });
      showNotice('success', t.nAdminDeleted);
      await reload();
    } catch (err) {
      showNotice('error', friendlyError(t, err, t.nErrUserDelete));
    }
  };

  const handleLogout = async () => {
    await fetch('/admin/api/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  useEffect(() => {
    // Lock body scroll while the mobile drawer is open
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    // Tab-aware admin title; MainRouter leaves /admin* titles to this page.
    const tab =
      activeTab === 'dashboard'
        ? 'Dashboard'
        : activeTab === 'products'
          ? t.navProducts
          : activeTab === 'orders'
            ? t.navOrders
            : activeTab === 'categories'
              ? t.navCategories
              : activeTab === 'admins'
                ? 'Admins'
                : t.navSettings;
    document.title = `${tab} — Atlas`;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [activeTab, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] text-[#151515]">
        <div className="text-sm text-[#6D6D6D] font-sans-ui">{t.loading}</div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'products', label: t.navProducts, icon: Package },
    { id: 'orders', label: t.navOrders, icon: ShoppingCart },
    { id: 'categories', label: t.navCategories, icon: Tag },
    { id: 'admins', label: t.navAdmins, icon: Users },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ] as const;

  const categoryOptions: CategoryOption[] = adminCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameFr: c.nameFr,
  }));

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
        className={`fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] shrink-0 bg-[#1F5742] text-white flex flex-col transition-transform duration-300 md:sticky md:top-0 md:h-screen md:z-auto md:max-w-none md:translate-x-0 ${
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
              aria-label={t.closeMenu}
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
            {t.logout}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-2 text-xs text-white/60 hover:text-white text-left px-3"
          >
            ← {t.backToStorefront}
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
              aria-label={t.openMenu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-[#151515] font-sans-ui capitalize truncate">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center rounded-full border border-[#E7E3DA] p-0.5 text-[11px] font-semibold font-sans-ui">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-colors ${language !== 'fr' ? 'bg-[#1F5742] text-white' : 'text-[#6D6D6D]'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2.5 py-1 rounded-full transition-colors ${language === 'fr' ? 'bg-[#1F5742] text-white' : 'text-[#6D6D6D]'}`}
              >
                FR
              </button>
            </div>
            <div className="text-xs text-[#6D6D6D] hidden sm:block">Atlas Admin • {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</div>
          </div>
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
            <div className="grid gap-4 dashboard-enter">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <div className="text-xs font-medium text-[#6D6D6D] font-sans-ui">{t.cardProducts}</div>
                  <div className="text-2xl font-semibold text-[#151515] mt-1 font-sans-ui tabular-nums">
                    {Math.round(animatedProducts).toLocaleString()}
                  </div>
                  <div className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">{t.cardManaged}</div>
                </div>
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <div className="text-xs font-medium text-[#6D6D6D] font-sans-ui">{t.cardOrders}</div>
                  <div className="text-2xl font-semibold text-[#151515] mt-1 font-sans-ui tabular-nums">
                    {Math.round(animatedOrders).toLocaleString()}
                  </div>
                  <div className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">{t.cardCod}</div>
                </div>
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <div className="text-xs font-medium text-[#6D6D6D] font-sans-ui">{t.revReceived}</div>
                  <div className="text-2xl font-semibold text-[#1F5742] mt-1 font-sans-ui tabular-nums">
                    {Math.round(animatedRevenue).toLocaleString()} DA
                  </div>
                  <div className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">{t.revNote}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                <h3 className="text-sm font-semibold text-[#151515] mb-3 font-sans-ui">{t.recentOrders}</h3>
                {orders.length === 0 ? (
                  <div className="text-sm text-[#6D6D6D]">{t.noOrders}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA]">
                          <th className="text-left py-2 font-medium">{t.thOrder}</th>
                          <th className="text-left py-2 font-medium">{t.thCustomer}</th>
                          <th className="text-left py-2 font-medium">{t.thTotal}</th>
                          <th className="text-left py-2 font-medium">{t.thStatus}</th>
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
                <div className="text-sm text-[#6D6D6D] font-sans-ui">{t.productsSub}</div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F5742] text-white text-sm font-medium font-sans-ui hover:bg-[#164030] transition-colors"
                >
                  <Plus className="w-4 h-4" /> {t.addProduct}
                </button>
              </div>
              {formOpen && (
                <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                  <h3 className="text-sm font-semibold text-[#151515] font-sans-ui mb-4">
                    {editingProduct ? t.formEdit : t.formNew}
                  </h3>
                  <ProductForm
                    product={editingProduct}
                    lang={language === 'fr' ? 'fr' : 'en'}
                    categories={categoryOptions}
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
                  <h3 className="text-sm font-semibold font-sans-ui">{t.cardProducts} ({products.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA] bg-[#FCFBF7]">
                        <th className="text-left px-4 py-2 font-medium">{t.thProduct}</th>
                        <th className="text-left px-4 py-2 font-medium">{t.thPrice}</th>
                        <th className="text-left px-4 py-2 font-medium">{t.thStock}</th>
                        <th className="text-right px-4 py-2 font-medium">{t.thActions}</th>
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
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {p.flavor && <span className="text-xs text-[#6D6D6D] truncate">{p.flavor}</span>}
                                  {typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.price && (
                                    <span className="px-1.5 py-px rounded text-[10px] font-semibold bg-[#1F5742] text-white">{t.badgeSale}</span>
                                  )}
                                  {p.isNew === true && (
                                    <span className="px-1.5 py-px rounded text-[10px] font-semibold bg-[#E7E3DA] text-[#1F5742]">{t.badgeNew}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">{p.price} DA</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {p.stock <= 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">{t.outOfStock}</span>
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
                                <Pencil className="w-3.5 h-3.5" /> {t.edit}
                              </button>
                              {deleteTarget === p.id ? (
                                <>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                                  >
                                    {t.confirm}
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E7E3DA] text-xs font-medium text-[#151515] hover:bg-[#F7F3EA] transition-colors"
                                  >
                                    {t.keep}
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setDeleteTarget(p.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> {t.delete}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#6D6D6D]">
                            {t.productsEmpty}
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
              <div className="px-5 py-4 border-b border-[#E7E3DA] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold">{t.cardOrders} ({orders.length})</h3>
                <button
                  onClick={() => downloadOrdersCsv(orders, language === 'fr' ? 'fr' : 'en')}
                  disabled={orders.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#E7E3DA] text-xs font-medium font-sans-ui text-[#151515] hover:bg-[#F7F3EA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> {t.exportOrders}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA] bg-[#FCFBF7]">
                      <th className="text-left px-4 py-2 font-medium">{t.thOrder}</th>
                      <th className="text-left px-4 py-2 font-medium">{t.thCustomer}</th>
                      <th className="text-left px-4 py-2 font-medium">{t.thPhone}</th>
                      <th className="text-left px-4 py-2 font-medium">{t.thTotal}</th>
                      <th className="text-left px-4 py-2 font-medium">{t.thCompany}</th>
                      <th className="text-left px-4 py-2 font-medium">{t.thDelivery}</th>
                      <th className="text-left px-4 py-2 font-medium">{t.thStatus}</th>
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
                                value={o.shippingCompany || ''}
                                onChange={(e) => handleOrderUpdate(o.id, { company: e.target.value })}
                                className="pl-3 pr-6 py-1.5 rounded-full text-xs font-medium font-sans-ui border border-[#E7E3DA] bg-white text-[#151515] outline-none cursor-pointer max-w-[140px]"
                              >
                                <option value="">—</option>
                                {companies.filter((c) => c.active || c.name === o.shippingCompany).map((c) => (
                                  <option key={c.id} value={c.name}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={o.deliveryType === 'stopdesk' ? 'stopdesk' : 'home'}
                                onChange={(e) => handleOrderUpdate(o.id, { deliveryType: e.target.value })}
                                className="pl-3 pr-6 py-1.5 rounded-full text-xs font-medium font-sans-ui border border-[#E7E3DA] bg-white text-[#151515] outline-none cursor-pointer"
                              >
                                <option value="home">{t.homeDelivery}</option>
                                <option value="stopdesk">{t.stopDesk}</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderUpdate(o.id, { status: e.target.value as AdminOrder['status'] })}
                                className="pl-3 pr-8 py-1.5 rounded-full text-xs font-medium font-sans-ui bg-[#1F5742] text-white outline-none cursor-pointer capitalize"
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
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#6D6D6D]">
                            {t.ordersEmpty}
                          </td>
                        </tr>
                      )}
                    </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'categories' && (
            <div className="grid gap-4">
              <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                <h3 className="text-sm font-semibold text-[#151515] font-sans-ui">
                  {catForm.id ? t.catEdit : t.catAdd}
                </h3>
                <form onSubmit={handleSaveCategory} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    value={catForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCatForm((c) => ({
                        ...c,
                        name,
                        slug: c.slug || name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s]+/g, '-').replace(/-+/g, '-'),
                      }));
                    }}
                    required
                    minLength={2}
                    placeholder={t.catName}
                    className="px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <input
                    value={catForm.nameFr}
                    onChange={(e) => setCatForm({ ...catForm, nameFr: e.target.value })}
                    placeholder={t.catNameFr}
                    className="px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <input
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase() })}
                    required
                    placeholder={t.catSlug}
                    className="px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-mono outline-none focus:border-[#1F5742]"
                  />
                  <input
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    placeholder={t.catDesc}
                    className="px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <label className="flex items-center gap-3 text-sm font-medium text-[#151515] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catForm.enabled}
                      onChange={(e) => setCatForm({ ...catForm, enabled: e.target.checked })}
                      className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer"
                    />
                    {t.catEnabled}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium font-sans-ui hover:bg-[#164030] transition-colors"
                    >
                      {t.catSave}
                    </button>
                    {catForm.id && (
                      <button
                        type="button"
                        onClick={resetCatForm}
                        className="px-5 py-3 rounded-lg border border-[#E7E3DA] text-sm font-medium hover:bg-[#F7F3EA] transition-colors"
                      >
                        {t.fCancel}
                      </button>
                    )}
                  </div>
                </form>
                <p className="text-xs text-[#6D6D6D] mt-3 font-sans-ui">{t.catSub}</p>
              </div>
              <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E7E3DA]">
                  <h3 className="text-sm font-semibold font-sans-ui">{t.catTitle} ({adminCategories.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-[#6D6D6D] border-b border-[#E7E3DA] bg-[#FCFBF7]">
                        <th className="text-left px-4 py-2 font-medium">{t.catName}</th>
                        <th className="text-left px-4 py-2 font-medium">{t.catSlug}</th>
                        <th className="text-left px-4 py-2 font-medium">{t.catProducts}</th>
                        <th className="text-left px-4 py-2 font-medium">{t.catStatus}</th>
                        <th className="text-right px-4 py-2 font-medium">{t.catActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCategories.map((c, idx) => (
                        <tr key={c.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#F7F3EA]">
                          <td className="px-4 py-2 font-medium text-[#151515]">
                            {c.name}
                            {c.nameFr && <span className="block text-xs font-normal text-[#6D6D6D]">{c.nameFr}</span>}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs text-[#6D6D6D]">/category/{c.slug}</td>
                          <td className="px-4 py-2">{c._count?.products ?? '—'}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleToggleCategory(c)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                c.enabled ? 'bg-[#1F5742]/10 text-[#1F5742]' : 'bg-[#E7E3DA]/60 text-[#6D6D6D]'
                              }`}
                            >
                              {c.enabled ? t.catEnabled : t.catDisabled}
                            </button>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleMoveCategory(c, -1)}
                                disabled={idx === 0}
                                aria-label={t.moveUp}
                                className="px-2 py-1.5 rounded-lg border border-[#E7E3DA] text-xs text-[#6D6D6D] hover:bg-[#F7F3EA] disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMoveCategory(c, 1)}
                                disabled={idx === adminCategories.length - 1}
                                aria-label={t.moveDown}
                                className="px-2 py-1.5 rounded-lg border border-[#E7E3DA] text-xs text-[#6D6D6D] hover:bg-[#F7F3EA] disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => handleEditCategory(c)}
                                className="px-3 py-1.5 rounded-lg border border-[#E7E3DA] text-xs font-medium hover:bg-[#F7F3EA] transition-colors"
                              >
                                {t.edit}
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                              >
                                {t.catDelete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {adminCategories.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6D6D6D]">{t.catEmpty}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'admins' && (
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                <h3 className="text-sm font-semibold text-[#151515] font-sans-ui">{t.adminsTitle}</h3>
                <p className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">{t.adminsSub}</p>
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
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium font-sans-ui hover:bg-[#164030] transition-colors"
                  >
                    {t.adminsCreate}
                  </button>
                </form>
              </div>
              <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E7E3DA]">
                  <h3 className="text-sm font-semibold font-sans-ui">{t.adminsList} ({users.length})</h3>
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
                              <span className="text-xs text-[#6D6D6D]">{t.adminsCurrent}</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                              >
                                {t.delete}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-[#6D6D6D]">{t.adminsEmpty}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="grid gap-4">
              <SettingsForm value={settings} lang={language === 'fr' ? 'fr' : 'en'} saving={savingSettings} onSave={handleSaveSettings} />
              <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                <h3 className="text-sm font-semibold text-[#151515] font-sans-ui">{t.setSystem}</h3>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-sans-ui">
                  <div className="rounded-lg bg-[#F7F3EA] px-3 py-2">
                    <div className="text-xs text-[#6D6D6D]">{t.sysEnv}</div>
                    <div className="font-medium text-[#151515]">
                      {/^(localhost|127\.0\.0\.1)/.test(window.location.hostname) ? 'Development' : 'Production'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#F7F3EA] px-3 py-2">
                    <div className="text-xs text-[#6D6D6D]">{t.sysDb}</div>
                    <div className="font-medium text-[#151515]">PostgreSQL</div>
                  </div>
                  <div className="rounded-lg bg-[#F7F3EA] px-3 py-2">
                    <div className="text-xs text-[#6D6D6D]">{t.sysProducts}</div>
                    <div className="font-medium text-[#151515]">{products.length}</div>
                  </div>
                  <div className="rounded-lg bg-[#F7F3EA] px-3 py-2">
                    <div className="text-xs text-[#6D6D6D]">{t.sysOrders}</div>
                    <div className="font-medium text-[#151515]">{orders.length}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
                <h3 className="text-sm font-semibold text-[#151515] font-sans-ui">{t.shipTitle}</h3>
                <p className="text-xs text-[#6D6D6D] mt-1 font-sans-ui">{t.shipSub}</p>
                <form onSubmit={handleCreateCompany} className="mt-4 flex flex-col sm:flex-row gap-3">
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t.shipAddPh}
                    className="flex-1 px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm font-sans-ui outline-none focus:border-[#1F5742]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium font-sans-ui hover:bg-[#164030] transition-colors whitespace-nowrap"
                  >
                    {t.shipAdd}
                  </button>
                </form>
              </div>
              <div className="bg-white rounded-lg border border-[#E7E3DA] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {companies.map((c) => (
                        <tr key={c.id} className="border-b border-[#E7E3DA]/60 hover:bg-[#F7F3EA]">
                          <td className="px-4 py-3">
                            <div className="font-medium text-[#151515]">{c.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleCompany(c)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans-ui transition-colors ${
                                c.active
                                  ? 'bg-[#1F5742]/10 text-[#1F5742]'
                                  : 'bg-[#E7E3DA]/60 text-[#6D6D6D]'
                              }`}
                            >
                              {c.active ? t.shipActive : t.shipPaused}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteCompany(c.id)}
                              className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                            >
                              {t.delete}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {companies.length === 0 && (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-[#6D6D6D]">{t.shipEmpty}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
