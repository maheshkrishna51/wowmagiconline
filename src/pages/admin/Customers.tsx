import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, ShoppingBag, Search, Users, Pencil, X, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Customer {
  id: string;
  name: string;
  email: string;
  whatsapp_number: string;
  addresses: string[];
  total_orders: number;
  total_spent: number;
  created_at: string;
}

interface EditForm {
  name: string;
  email: string;
  whatsapp_number: string;
  addresses: string[];
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', email: '', whatsapp_number: '', addresses: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setCustomers(data);
    }
    setLoading(false);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      whatsapp_number: customer.whatsapp_number || '',
      addresses: customer.addresses && customer.addresses.length > 0 ? [...customer.addresses] : [''],
    });
  };

  const closeEdit = () => {
    setEditingCustomer(null);
    setEditForm({ name: '', email: '', whatsapp_number: '', addresses: [] });
  };

  const handleSave = async () => {
    if (!editingCustomer) return;
    setSaving(true);

    const cleanAddresses = editForm.addresses.filter(a => a.trim() !== '');

    const { error } = await supabase
      .from('customers')
      .update({
        name: editForm.name,
        email: editForm.email,
        whatsapp_number: editForm.whatsapp_number,
        addresses: cleanAddresses,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingCustomer.id);

    if (!error) {
      await loadCustomers();
      closeEdit();
    } else {
      alert('Failed to update customer. Please try again.');
    }
    setSaving(false);
  };

  const addAddress = () => {
    setEditForm(prev => ({ ...prev, addresses: [...prev.addresses, ''] }));
  };

  const updateAddress = (index: number, value: string) => {
    setEditForm(prev => {
      const updated = [...prev.addresses];
      updated[index] = value;
      return { ...prev, addresses: updated };
    });
  };

  const removeAddress = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-1">
                        {customer.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail size={14} />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.whatsapp_number && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone size={14} />
                            <span>{customer.whatsapp_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {customer.addresses && customer.addresses.length > 0 ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span className="line-clamp-1">{customer.addresses[0]}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not provided</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {customer.total_orders || 0}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({'₹'}{parseFloat(String(customer.total_spent || 0)).toFixed(2)})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openEdit(customer)}
                        className="p-2 hover:bg-amber-50 rounded-lg transition text-amber-900"
                        title="Edit customer"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
              <button
                onClick={closeEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={editForm.whatsapp_number}
                  onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Addresses</label>
                  <button
                    type="button"
                    onClick={addAddress}
                    className="text-sm text-amber-900 hover:text-amber-700 font-medium transition"
                  >
                    + Add address
                  </button>
                </div>
                <div className="space-y-2">
                  {editForm.addresses.map((address, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <textarea
                        value={address}
                        onChange={(e) => updateAddress(index, e.target.value)}
                        rows={2}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 resize-none transition"
                        placeholder="Enter address..."
                      />
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="p-2 mt-1 hover:bg-red-50 rounded-lg text-red-500 transition"
                        title="Remove address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {editForm.addresses.length === 0 && (
                    <p className="text-sm text-gray-400">No addresses added</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Total Orders</label>
                  <p className="font-semibold text-gray-900">{editingCustomer.total_orders || 0}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Total Spent</label>
                  <p className="font-semibold text-gray-900">{'₹'}{parseFloat(String(editingCustomer.total_spent || 0)).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeEdit}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editForm.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-900 text-white rounded-lg hover:bg-amber-800 font-medium transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
