interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface InventoryItem {
  name: string;
  image_url: string;
  category: string;
  stock: number;
  cost_price: number;
  price: number;
  cost_value: number;
  sales_value: number;
  is_low_stock: boolean;
}

interface SalesReportData {
  type: 'sales';
  dateRange: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  salesData: SalesData[];
}

interface InventoryReportData {
  type: 'inventory';
  categoryName: string;
  totalCostValue: number;
  totalSalesValue: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  items: InventoryItem[];
}

type ReportData = SalesReportData | InventoryReportData;

function getDateRangeLabel(range: string): string {
  switch (range) {
    case '7days': return 'Last 7 Days';
    case '30days': return 'Last 30 Days';
    case '90days': return 'Last 90 Days';
    case 'year': return 'Last Year';
    default: return range;
  }
}

function buildSalesHtml(data: SalesReportData): string {
  const dateLabel = getDateRangeLabel(data.dateRange);
  const now = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const summaryCards = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="card-label">Total Revenue</div>
        <div class="card-value">${'\u20B9'}${data.totalRevenue.toFixed(2)}</div>
        ${data.revenueGrowth !== 0 ? `<div class="card-change ${data.revenueGrowth > 0 ? 'positive' : 'negative'}">${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}% vs previous period</div>` : ''}
      </div>
      <div class="summary-card">
        <div class="card-label">Total Orders</div>
        <div class="card-value">${data.totalOrders}</div>
        ${data.ordersGrowth !== 0 ? `<div class="card-change ${data.ordersGrowth > 0 ? 'positive' : 'negative'}">${data.ordersGrowth > 0 ? '+' : ''}${data.ordersGrowth.toFixed(1)}% vs previous period</div>` : ''}
      </div>
      <div class="summary-card">
        <div class="card-label">Total Customers</div>
        <div class="card-value">${data.totalCustomers}</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Total Products</div>
        <div class="card-value">${data.totalProducts}</div>
      </div>
    </div>
  `;

  const tableRows = data.salesData.map(d => `
    <tr>
      <td>${new Date(d.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
      <td class="text-right">${d.orders}</td>
      <td class="text-right">${'\u20B9'}${d.revenue.toFixed(2)}</td>
      <td class="text-right">${'\u20B9'}${(d.revenue / d.orders).toFixed(2)}</td>
    </tr>
  `).join('');

  const totalRevenue = data.salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.salesData.reduce((s, d) => s + d.orders, 0);

  return `
    <div class="header">
      <h1>Sales Report</h1>
      <p class="subtitle">${dateLabel} &mdash; Generated on ${now}</p>
    </div>
    ${summaryCards}
    <h2>Daily Sales Breakdown</h2>
    ${data.salesData.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th class="text-right">Orders</th>
          <th class="text-right">Revenue</th>
          <th class="text-right">Avg Order Value</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td class="text-right"><strong>${totalOrders}</strong></td>
          <td class="text-right"><strong>${'\u20B9'}${totalRevenue.toFixed(2)}</strong></td>
          <td class="text-right"><strong>${totalOrders > 0 ? `${'\u20B9'}${(totalRevenue / totalOrders).toFixed(2)}` : '-'}</strong></td>
        </tr>
      </tfoot>
    </table>
    ` : '<p class="empty-msg">No sales data available for this period.</p>'}
  `;
}

function buildInventoryHtml(data: InventoryReportData): string {
  const now = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const margin = data.totalCostValue > 0
    ? ((data.potentialProfit / data.totalCostValue) * 100).toFixed(1) + '% margin'
    : 'N/A';

  const summaryCards = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="card-label">Cost Value</div>
        <div class="card-value">${'\u20B9'}${data.totalCostValue.toFixed(2)}</div>
        <div class="card-note">Inventory at cost</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Sales Value</div>
        <div class="card-value">${'\u20B9'}${data.totalSalesValue.toFixed(2)}</div>
        <div class="card-note">Potential revenue</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Potential Profit</div>
        <div class="card-value">${'\u20B9'}${data.potentialProfit.toFixed(2)}</div>
        <div class="card-note">${margin}</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Stock Alerts</div>
        <div class="card-value">${data.lowStockCount + data.outOfStockCount}</div>
        <div class="card-note">${data.outOfStockCount} out of stock, ${data.lowStockCount} low</div>
      </div>
    </div>
  `;

  const tableRows = data.items.map(item => {
    const statusClass = item.stock === 0 ? 'status-danger' : item.is_low_stock ? 'status-warning' : 'status-good';
    const statusLabel = item.stock === 0 ? 'Out of Stock' : item.is_low_stock ? 'Low Stock' : 'In Stock';
    const imgHtml = item.image_url
      ? `<img src="${item.image_url}" class="product-img" />`
      : `<div class="product-img-placeholder"></div>`;
    return `
    <tr>
      <td class="img-cell">${imgHtml}</td>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td class="text-right">${item.stock}</td>
      <td class="text-right">${'\u20B9'}${item.cost_price.toFixed(2)}</td>
      <td class="text-right">${'\u20B9'}${item.price.toFixed(2)}</td>
      <td class="text-right">${'\u20B9'}${item.cost_value.toFixed(2)}</td>
      <td class="text-right">${'\u20B9'}${item.sales_value.toFixed(2)}</td>
      <td class="text-center"><span class="status ${statusClass}">${statusLabel}</span></td>
    </tr>`;
  }).join('');

  return `
    <div class="header">
      <h1>Inventory Report</h1>
      <p class="subtitle">${data.categoryName !== 'All Categories' ? `Category: ${data.categoryName} &mdash; ` : ''}Generated on ${now}</p>
    </div>
    ${summaryCards}
    <h2>Detailed Inventory</h2>
    <table class="inventory-table">
      <thead>
        <tr>
          <th class="img-col">Image</th>
          <th>Product</th>
          <th>Category</th>
          <th class="text-right">Stock</th>
          <th class="text-right">Cost Price</th>
          <th class="text-right">Selling Price</th>
          <th class="text-right">Cost Value</th>
          <th class="text-right">Sales Value</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="6"><strong>Totals</strong></td>
          <td class="text-right"><strong>${'\u20B9'}${data.totalCostValue.toFixed(2)}</strong></td>
          <td class="text-right"><strong>${'\u20B9'}${data.totalSalesValue.toFixed(2)}</strong></td>
          <td></td>
        </tr>
        <tr class="profit-row">
          <td colspan="6"><strong>Potential Profit</strong></td>
          <td colspan="2" class="text-right"><strong>${'\u20B9'}${data.potentialProfit.toFixed(2)}</strong></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;
}

function buildFullHtml(body: string, title: string): string {
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
      font-size: 12px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #78350f;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 800;
      color: #78350f;
      margin-bottom: 4px;
    }
    .subtitle {
      color: #6b7280;
      font-size: 13px;
    }
    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin: 24px 0 12px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      background: #fafafa;
    }
    .card-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-value {
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin-top: 4px;
    }
    .card-change {
      font-size: 11px;
      margin-top: 4px;
    }
    .card-change.positive { color: #16a34a; }
    .card-change.negative { color: #dc2626; }
    .card-note {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #f9fafb;
      font-weight: 700;
      color: #374151;
      padding: 10px 12px;
      border-bottom: 2px solid #e5e7eb;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
    }
    tbody tr:hover { background: #f9fafb; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row {
      background: #f3f4f6;
    }
    .total-row td {
      border-top: 2px solid #d1d5db;
      padding: 10px 12px;
    }
    .profit-row {
      background: #fffbeb;
    }
    .profit-row td {
      color: #78350f;
      font-size: 14px;
      padding: 10px 12px;
    }
    .status {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
    }
    .status-good { background: #dcfce7; color: #166534; }
    .status-warning { background: #fef9c3; color: #854d0e; }
    .status-danger { background: #fee2e2; color: #991b1b; }
    .empty-msg {
      text-align: center;
      color: #9ca3af;
      padding: 32px 0;
    }
    .inventory-table th, .inventory-table td {
      font-size: 11px;
      padding: 6px 8px;
      vertical-align: middle;
    }
    .img-col {
      width: 50px;
    }
    .img-cell {
      width: 50px;
      padding: 4px 8px;
    }
    .product-img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
      display: block;
    }
    .product-img-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
    }
    @media print {
      body { padding: 20px; }
      @page { margin: 15mm; size: A4 landscape; }
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

export function downloadReportPdf(data: ReportData): void {
  let body: string;
  let title: string;
  let filename: string;

  if (data.type === 'sales') {
    body = buildSalesHtml(data);
    title = `Sales Report - ${getDateRangeLabel(data.dateRange)}`;
    filename = `sales-report-${data.dateRange}-${new Date().toISOString().split('T')[0]}.html`;
  } else {
    body = buildInventoryHtml(data);
    title = `Inventory Report - ${data.categoryName}`;
    filename = `inventory-report-${new Date().toISOString().split('T')[0]}.html`;
  }

  const html = buildFullHtml(body, title);
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
