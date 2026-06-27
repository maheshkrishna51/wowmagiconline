import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    hours: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: siteSettings } = await supabase
      .from('site_settings')
      .select('key, value');

    const { data: contact } = await supabase
      .from('cms_content')
      .select('metadata')
      .eq('key', 'contact_info')
      .maybeSingle();

    const { data: social } = await supabase
      .from('cms_content')
      .select('metadata')
      .eq('key', 'social_media_links')
      .maybeSingle();

    if (siteSettings) {
      const settingsMap: Record<string, string> = {};
      siteSettings.forEach(s => settingsMap[s.key] = s.value);
      setSettings(settingsMap);
    }

    if (contact?.metadata) {
      setContactInfo(contact.metadata as any);
    }

    if (social?.metadata) {
      setSocialLinks(social.metadata as any);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const updates = Object.entries(settings).map(([key, value]) =>
      supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
    );

    await Promise.all(updates);

    await supabase
      .from('cms_content')
      .update({
        metadata: contactInfo,
        updated_at: new Date().toISOString(),
      })
      .eq('key', 'contact_info');

    await supabase
      .from('cms_content')
      .update({
        metadata: socialLinks,
        updated_at: new Date().toISOString(),
      })
      .eq('key', 'social_media_links');

    setSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-amber-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition disabled:opacity-50"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Site Name</label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Logo URL</label>
              <input
                type="text"
                value={settings.logo_url || ''}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                placeholder="/logo-wowmagic.png or https://example.com/logo.png"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recommended resolution: 200x60px (transparent PNG). Default: /logo-wowmagic.png
              </p>
              {settings.logo_url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                  <img
                    src={settings.logo_url}
                    alt="Logo preview"
                    className="h-12 w-auto border border-gray-200 rounded p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">WhatsApp Business Number</label>
              <input
                type="tel"
                value={settings.whatsapp_business_number || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp_business_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Hero Image URL</label>
              <input
                type="text"
                value={settings.hero_image_url || ''}
                onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                placeholder="https://images.pexels.com/photos/1090979/pexels-photo-1090979.jpeg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recommended resolution: 1920x1080px or higher (16:9 aspect ratio) for hero section
              </p>
              {settings.hero_image_url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Hero Image Preview:</p>
                  <img
                    src={settings.hero_image_url}
                    alt="Hero preview"
                    className="w-full max-w-md h-32 object-cover border border-gray-200 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Address</label>
              <textarea
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 h-24"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Business Hours</label>
              <textarea
                value={contactInfo.hours}
                onChange={(e) => setContactInfo({ ...contactInfo, hours: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 h-24"
                placeholder="Monday - Friday: 9am - 6pm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Social Media Links</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Facebook URL</label>
              <input
                type="url"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Instagram URL</label>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">YouTube URL</label>
              <input
                type="url"
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">SEO Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Meta Title</label>
              <input
                type="text"
                value={settings.meta_title || ''}
                onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Meta Description</label>
              <textarea
                value={settings.meta_description || ''}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 h-24"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Meta Keywords</label>
              <input
                type="text"
                value={settings.meta_keywords || ''}
                onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                placeholder="chocolate, gifts, hampers"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}