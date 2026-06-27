interface CatalogProduct {
  name: string;
  price: number;
  compare_price: number;
  short_description: string;
  images: string[];
  sku: string;
  is_active: boolean;
  category_name: string;
}

interface CatalogGroup {
  category: string;
  products: CatalogProduct[];
}

function groupByCategory(products: CatalogProduct[]): CatalogGroup[] {
  const map = new Map<string, CatalogProduct[]>();
  for (const p of products) {
    const cat = p.category_name || 'Uncategorized';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(p);
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    products: items,
  }));
}

function buildProductCard(p: CatalogProduct): string {
  const img = p.images?.[0]
    ? `<div class="img-wrapper"><img src="${p.images[0]}" class="product-img" /></div>`
    : `<div class="img-wrapper"><div class="product-img placeholder"></div></div>`;

  const discount = p.compare_price > p.price
    ? `<span class="compare-price">\u20B9${p.compare_price.toFixed(2)}</span>`
    : '';

  const desc = p.short_description
    ? `<p class="product-desc">${p.short_description.length > 100 ? p.short_description.slice(0, 100) + '...' : p.short_description}</p>`
    : '';

  return `
    <div class="product-card">
      ${img}
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        ${desc}
        <div class="price-row">
          <span class="product-price">\u20B9${p.price.toFixed(2)}</span>
          ${discount}
        </div>
        ${p.sku ? `<span class="product-sku">SKU: ${p.sku}</span>` : ''}
      </div>
    </div>`;
}

function buildCategorySection(group: CatalogGroup): string {
  const cards = group.products.map(buildProductCard).join('');
  return `
    <div class="category-section">
      <h2 class="category-title">${group.category}</h2>
      <div class="products-grid">${cards}</div>
    </div>`;
}

function buildCatalogHtml(groups: CatalogGroup[], title: string): string {
  const now = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const totalProducts = groups.reduce((s, g) => s + g.products.length, 0);
  const sections = groups.map(buildCategorySection).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      padding: 40px;
      font-size: 13px;
      line-height: 1.5;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #78350f;
      padding-bottom: 20px;
      margin-bottom: 32px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      color: #78350f;
      margin-bottom: 4px;
    }
    .header .subtitle {
      color: #6b7280;
      font-size: 13px;
    }
    .header .stats {
      margin-top: 8px;
      font-size: 12px;
      color: #9ca3af;
    }
    .category-section {
      margin-bottom: 40px;
    }
    .category-title {
      font-size: 20px;
      font-weight: 700;
      color: #78350f;
      padding: 10px 20px;
      background: #fffbeb;
      border-left: 4px solid #78350f;
      margin-bottom: 20px;
      border-radius: 0 6px 6px 0;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    .product-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      break-inside: avoid;
    }
    .img-wrapper {
      width: 100%;
      position: relative;
      padding-bottom: 100%;
      overflow: hidden;
      background: #f3f4f6;
    }
    .product-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .product-img.placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    }
    .product-info {
      padding: 14px 18px 16px;
    }
    .product-name {
      font-size: 15px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 5px;
      line-height: 1.3;
    }
    .product-desc {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 6px;
    }
    .product-price {
      font-size: 20px;
      font-weight: 800;
      color: #78350f;
    }
    .compare-price {
      font-size: 13px;
      color: #9ca3af;
      text-decoration: line-through;
    }
    .product-sku {
      font-size: 11px;
      color: #9ca3af;
      letter-spacing: 0.3px;
    }
    .footer {
      margin-top: 48px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      color: #9ca3af;
      font-size: 11px;
    }
    @media print {
      body { padding: 20px; }
      @page { margin: 12mm; size: A4; }
      .product-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p class="subtitle">Product Catalog</p>
    <p class="stats">${totalProducts} products &mdash; Generated on ${now}</p>
  </div>
  ${sections}
  <div class="footer">
    This catalog was auto-generated. Prices and availability are subject to change.
  </div>
</body>
</html>`;
}

export function downloadCatalog(
  products: CatalogProduct[],
  categoryFilter?: string
): void {
  const active = products.filter(p => p.is_active);
  const groups = groupByCategory(active);
  const title = categoryFilter || 'Product Catalog';
  const filename = `catalog-${(categoryFilter || 'all').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;

  const html = buildCatalogHtml(groups, title);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
