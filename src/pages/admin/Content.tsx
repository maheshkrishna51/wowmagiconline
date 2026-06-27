import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContentPage {
  id: string;
  page_key: string;
  title: string;
  content: string;
}

interface HeroContent {
  badge_text: string;
  heading_line1: string;
  heading_line2: string;
  subheading: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
}

export default function AdminContent() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('hero');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [heroContent, setHeroContent] = useState<HeroContent>({
    badge_text: '',
    heading_line1: '',
    heading_line2: '',
    subheading: '',
    primary_button_text: '',
    primary_button_url: '',
    secondary_button_text: '',
    secondary_button_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: pagesData } = await supabase
      .from('content_pages')
      .select('*')
      .order('page_key');

    const { data: heroData } = await supabase
      .from('cms_content')
      .select('metadata')
      .eq('key', 'hero_section')
      .maybeSingle();

    if (pagesData) {
      setPages(pagesData);
    }

    if (heroData?.metadata) {
      setHeroContent(heroData.metadata as any);
    }

    setLoading(false);
  };

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
    if (section !== 'hero') {
      const page = pages.find(p => p.id === section);
      if (page) {
        setTitle(page.title);
        setContent(page.content);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);

    if (selectedSection === 'hero') {
      await supabase
        .from('cms_content')
        .update({
          metadata: heroContent,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'hero_section');
    } else {
      await supabase
        .from('content_pages')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSection);
    }

    await loadData();
    setSaving(false);
    alert('Content updated successfully!');
  };

  const getPageLabel = (key: string) => {
    return key.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Section
            </label>
            <button
              onClick={() => handleSectionSelect('hero')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedSection === 'hero'
                  ? 'bg-amber-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hero Section
            </button>
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => handleSectionSelect(page.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedSection === page.id
                    ? 'bg-amber-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getPageLabel(page.page_key)}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedSection === 'hero' ? (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Hero Section Content</h2>
                  <p className="text-sm text-gray-600">Customize the main hero section on your homepage</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={heroContent.badge_text}
                      onChange={(e) => setHeroContent({...heroContent, badge_text: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                      placeholder="e.g., Premium Handcrafted Gifts"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heading Line 1
                    </label>
                    <input
                      type="text"
                      value={heroContent.heading_line1}
                      onChange={(e) => setHeroContent({...heroContent, heading_line1: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                      placeholder="e.g., Crafted With Love,"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heading Line 2
                    </label>
                    <input
                      type="text"
                      value={heroContent.heading_line2}
                      onChange={(e) => setHeroContent({...heroContent, heading_line2: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                      placeholder="e.g., Delivered With Care"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subheading
                    </label>
                    <textarea
                      value={heroContent.subheading}
                      onChange={(e) => setHeroContent({...heroContent, subheading: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                      placeholder="A brief description of your business"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={heroContent.primary_button_text}
                        onChange={(e) => setHeroContent({...heroContent, primary_button_text: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                        placeholder="e.g., Shop Now"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Button URL
                      </label>
                      <input
                        type="text"
                        value={heroContent.primary_button_url}
                        onChange={(e) => setHeroContent({...heroContent, primary_button_url: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                        placeholder="e.g., /shop"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={heroContent.secondary_button_text}
                        onChange={(e) => setHeroContent({...heroContent, secondary_button_text: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                        placeholder="e.g., View Our Works"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Button URL
                      </label>
                      <input
                        type="text"
                        value={heroContent.secondary_button_url}
                        onChange={(e) => setHeroContent({...heroContent, secondary_button_url: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                        placeholder="e.g., /our-works"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent font-mono text-sm"
                    placeholder="Enter HTML content here..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    You can use HTML tags to format the content.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}