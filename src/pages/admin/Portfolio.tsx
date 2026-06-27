import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [] as string[],
    category: '',
    display_order: 0,
  });
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('display_order');

    if (data) {
      setPortfolioItems(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('portfolio_items')
        .update(formData)
        .eq('id', editingId);

      if (!error) {
        alert('Portfolio item updated successfully!');
      }
    } else {
      const { error } = await supabase
        .from('portfolio_items')
        .insert([formData]);

      if (!error) {
        alert('Portfolio item created successfully!');
      }
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      images: [],
      category: '',
      display_order: 0,
    });
    loadPortfolio();
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      images: Array.isArray(item.images) ? item.images : [],
      category: item.category || '',
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Portfolio item deleted successfully!');
      loadPortfolio();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('portfolio_items')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      loadPortfolio();
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              images: [],
              category: '',
              display_order: portfolioItems.length,
            });
          }}
          className="flex items-center space-x-2 bg-amber-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
        >
          <Plus size={20} />
          <span>Add Portfolio Item</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Images
              </label>
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition"
                  >
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Recommended resolution: 1200x800px (3:2 aspect ratio) for portfolio display
                </p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Wedding, Corporate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                />
              </div>
            </div>


            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-amber-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-800 transition"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        {portfolioItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No portfolio items yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-amber-900 font-semibold hover:underline"
            >
              Add your first portfolio item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <div key={item.id} className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                <img
                  src={Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : 'https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition flex space-x-2">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className="p-3 bg-white rounded-full hover:bg-gray-100 transition"
                      title={item.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {item.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-3 bg-white rounded-full hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-3 bg-white rounded-full hover:bg-red-100 transition text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    {!item.is_active && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {item.category && (
                    <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}