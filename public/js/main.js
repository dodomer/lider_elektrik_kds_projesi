/**
 * Lider Elektrik - Karar Destek Sistemi (KDS)
 * Main Frontend JavaScript
 * 
 * This module handles:
 * - Navigation (scroll to sections)
 * - Analysis button interaction
 * - Future: Dynamic data loading from API
 */

// ======================
// Configuration
// ======================

const API_BASE_URL = '/api';

// ======================
// DOM Elements
// ======================

const elements = {
    logoHomeBtn: document.getElementById('logo-home-btn'),
    runAnalysisBtn: document.getElementById('run-analysis-btn'),
    btnProductAnalytics: document.getElementById('btn-product-analytics'),
    btnAllProducts: document.getElementById('btn-all-products'),
    overviewSection: document.getElementById('overview-section'),
    analysisSection: document.getElementById('analysis-section'),
    productsSection: document.getElementById('products-section'),
    backToOverviewBtn: document.getElementById('back-to-overview-btn'),
    backToOverviewFromProductsBtn: document.getElementById('back-to-overview-from-products-btn'),
    // Products section elements
    productsTableContainer: document.getElementById('products-table-container'),
    productsTableBody: document.getElementById('products-table-body'),
    productsCount: document.getElementById('products-count'),
    btnAddProduct: document.getElementById('btn-add-product'),
    // Sales Details Section elements
    salesDetailsSection: document.getElementById('sales-details-section'),
    salesDetailsMonthSelect: document.getElementById('sales-details-month-select'),
    backToOverviewFromSalesDetailsBtn: document.getElementById('back-to-overview-from-sales-details-btn'),
    // Sales Chart elements
    salesChartContainer: document.getElementById('sales-chart-container'),
    salesChartLoading: document.getElementById('sales-chart-loading'),
    salesChartNoData: document.getElementById('sales-chart-no-data'),
    salesRevenueChart: document.getElementById('sales-revenue-chart'),
    // Chart mode toggle buttons
    chartModeRevenue: document.getElementById('chart-mode-revenue'),
    chartModeQuantity: document.getElementById('chart-mode-quantity'),
    // Monthly total ciro element
    monthlyCiroValue: document.getElementById('monthly-ciro-value'),
    // Sales insights elements
    insightsLoading: document.getElementById('insights-loading'),
    insightsContent: document.getElementById('insights-content'),
    insightsNoData: document.getElementById('insights-no-data'),
    // AI advice elements
    aiAdviceInitial: document.getElementById('ai-advice-initial'),
    aiAdviceLoading: document.getElementById('ai-advice-loading'),
    aiAdviceError: document.getElementById('ai-advice-error'),
    aiAdviceResult: document.getElementById('ai-advice-result'),
    aiAdviceContent: document.getElementById('ai-advice-content'),
    aiErrorMessage: document.querySelector('.ai-error-message'),
    btnGetAiAdvice: document.getElementById('btn-get-ai-advice'),
    btnRetryAiAdvice: document.getElementById('btn-retry-ai-advice'),
    btnRefreshAiAdvice: document.getElementById('btn-refresh-ai-advice'),
    // Store utilization elements (main dashboard)
    utilizationLoading: document.getElementById('utilization-loading'),
    utilizationDisplay: document.getElementById('utilization-display'),
    utilizationNoData: document.getElementById('utilization-no-data'),
    utilizationPercent: document.getElementById('utilization-percent'),
    utilizationCircleProgress: document.getElementById('utilization-circle-progress'),
    utilizationUsed: document.getElementById('utilization-used'),
    utilizationCapacity: document.getElementById('utilization-capacity'),
    utilizationFree: document.getElementById('utilization-free'),
    utilizationWarning: document.getElementById('utilization-warning'),
    utilizationWarningText: document.getElementById('utilization-warning-text'),
    utilizationHelperText: document.getElementById('utilization-helper-text'),
    // Depo decision card
    depoDecisionCard: document.getElementById('depo-decision-card'),
    depoDecisionBadge: document.getElementById('depo-decision-badge'),
    depoDecisionText: document.getElementById('depo-decision-text'),
    metricCurrentUtil: document.getElementById('metric-current-util'),
    metricAverage6m: document.getElementById('metric-average-6m'),
    metricForecast3m: document.getElementById('metric-forecast-3m'),
    metricExtraCost: document.getElementById('metric-extra-cost'),
    depoDecisionSummary: document.getElementById('depo-decision-summary'),
    // Store utilization elements (analysis section)
    analysisUtilizationLoading: document.getElementById('analysis-utilization-loading'),
    analysisUtilizationDisplay: document.getElementById('analysis-utilization-display'),
    analysisUtilizationNoData: document.getElementById('analysis-utilization-no-data'),
    analysisUtilizationPercent: document.getElementById('analysis-utilization-percent'),
    analysisUtilizationCircleProgress: document.getElementById('analysis-utilization-circle-progress'),
    analysisUtilizationUsed: document.getElementById('analysis-utilization-used'),
    analysisUtilizationCapacity: document.getElementById('analysis-utilization-capacity'),
    analysisUtilizationFree: document.getElementById('analysis-utilization-free'),
    analysisUtilizationWarning: document.getElementById('analysis-utilization-warning'),
    analysisUtilizationWarningText: document.getElementById('analysis-utilization-warning-text'),
    analysisUtilizationHelperText: document.getElementById('analysis-utilization-helper-text'),
    // Inflation & stock strategy
    tuikAnnual: document.getElementById('tuik-annual'),
    tuikMonthly: document.getElementById('tuik-monthly'),
    calcInflationBtn: document.getElementById('btn-calc-inflation'),
    calcInflationValue: document.getElementById('calc-inflation-value'),
    stockDecisionMessage: document.getElementById('stock-decision-message'),
    inflationRows: document.querySelectorAll('.inflation-calc-row'),
    // Modal elements
    addProductModal: document.getElementById('add-product-modal'),
    addProductForm: document.getElementById('add-product-form'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalSaveBtn: document.getElementById('modal-save-btn'),
    productNameInput: document.getElementById('product-name'),
    productCategorySelect: document.getElementById('product-category'),
    productHacimInput: document.getElementById('product-hacim'),
    productPriceInput: document.getElementById('product-price'),
    productAdetInput: document.getElementById('product-adet'),
    productLokasyonSelect: document.getElementById('product-lokasyon'),
    stockPreviewGroup: document.getElementById('stock-preview-group'),
    previewSpaceDb: document.getElementById('preview-space-db'),
    previewOccupancyPercent: document.getElementById('preview-occupancy-percent'),
    previewTotalOccupancyPercent: document.getElementById('preview-total-occupancy-percent'),
    stockPreviewTotalOccupancy: document.getElementById('stock-preview-total-occupancy'),
    lokasyonErrorMessage: document.getElementById('lokasyon-error-message'),
    formErrorMessage: document.getElementById('form-error-message'),
    formSuccessMessage: document.getElementById('form-success-message'),
    // DB Examples panel elements
    btnToggleDbExamples: document.getElementById('btn-toggle-db-examples'),
    dbExamplesPanel: document.getElementById('db-examples-panel'),
    // Edit Product Modal elements
    editProductModal: document.getElementById('edit-product-modal'),
    editProductForm: document.getElementById('edit-product-form'),
    editModalCloseBtn: document.getElementById('edit-modal-close-btn'),
    editModalCancelBtn: document.getElementById('edit-modal-cancel-btn'),
    editModalSaveBtn: document.getElementById('edit-modal-save-btn'),
    editModalDeleteBtn: document.getElementById('edit-modal-delete-btn'),
    editModalBackdrop: document.getElementById('edit-modal-backdrop'),
    editProductId: document.getElementById('edit-product-id'),
    editProductName: document.getElementById('edit-product-name'),
    editProductCategory: document.getElementById('edit-product-category'),
    editProductHacim: document.getElementById('edit-product-hacim'),
    editProductPrice: document.getElementById('edit-product-price'),
    editFormError: document.getElementById('edit-form-error-message'),
    editFormSuccess: document.getElementById('edit-form-success-message'),
    // Delete Confirmation Modal elements
    deleteConfirmModal: document.getElementById('delete-confirm-modal'),
    deleteModalCloseBtn: document.getElementById('delete-modal-close-btn'),
    deleteModalCancelBtn: document.getElementById('delete-modal-cancel-btn'),
    deleteModalConfirmBtn: document.getElementById('delete-modal-confirm-btn'),
    deleteModalBackdrop: document.getElementById('delete-modal-backdrop'),
    deleteProductName: document.getElementById('delete-product-name')
};

// Track if products have been loaded
let productsLoaded = false;

// Track if categories have been loaded
let categoriesLoaded = false;
let categoriesData = [];

// Track if locations have been loaded
let locationsLoaded = false;
let locationsData = [];

// Track product being edited/deleted
let currentEditProductId = null;
let currentEditProductName = '';

// Chart.js instance for sales revenue chart
let salesRevenueChartInstance = null;

// Chart.js instances for Decision Panel
let revenueTrendChartInstance = null;
let topProductsSpaceChartInstance = null;
let capacityForecastChartInstance = null;

// Revenue trend chart state
let revenueTrendViewMode = 'real'; // 'real' or 'forecast'
const REVENUE_TREND_ORIGINAL_LABELS = ['Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım'];
const REVENUE_TREND_ORIGINAL_DATA = [150000, 180000, 165000, 210000, 195000, 192830];

// Sales chart mode: 'revenue' or 'quantity'
let salesChartMode = 'revenue';

// Raw sales data from API (to allow re-sorting without refetching)
let salesChartRawData = [];

// Cached utilization data (to share between dashboard and analysis section)
let cachedUtilizationData = null;

// ======================
// Navigation Functions
// ======================

/**
 * Hide all main sections
 */
function hideAllSections() {
    if (elements.overviewSection) elements.overviewSection.classList.add('hidden');
    if (elements.analysisSection) elements.analysisSection.classList.add('hidden');
    if (elements.productsSection) elements.productsSection.classList.add('hidden');
    if (elements.salesDetailsSection) elements.salesDetailsSection.classList.add('hidden');
}

/**
 * Show the overview section and hide all others
 */
function showOverviewSection() {
    hideAllSections();
    if (elements.overviewSection) {
        elements.overviewSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Show the analysis section and hide all others
 */
function showAnalysisSection() {
    hideAllSections();
    if (elements.analysisSection) {
        elements.analysisSection.classList.remove('hidden');
        
        // Load utilization for the analysis section
        loadStoreUtilization('analysis');
        
        // Load depots table
        if (typeof loadDepotsTable === 'function') {
            loadDepotsTable();
        }
        
        // Initialize map if not initialized, then refresh and load markers
        setTimeout(() => {
            // Initialize map if it exists and is not initialized
            if (typeof initDepoMap === 'function') {
                initDepoMap();
            }
            
            // Refresh map size after DOM layout is ready
            if (typeof depoMap !== 'undefined' && depoMap && typeof depoMap.invalidateSize === 'function') {
                depoMap.invalidateSize();
            }
            
            // Load markers for the map
            if (typeof loadDepotsForMap === 'function') {
                loadDepotsForMap();
            }
        }, 50);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Show the products section and hide all others
 * Also loads products from API if not already loaded
 */
function showProductsSection() {
    hideAllSections();
    if (elements.productsSection) {
        elements.productsSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load products if not already loaded
        if (!productsLoaded) {
            loadProducts();
        }
    }
}

/**
 * Run depot analysis (Demo version)
 * Switches to the analysis section view
 */
function runAnalysis() {
    showAnalysisSection();
}

// ======================
// Products API Functions
// ======================

/**
 * Update products count display
 * @param {string} text - Text to display
 */
function updateProductsCount(text) {
    if (elements.productsCount) {
        elements.productsCount.textContent = text;
    }
}

/**
 * Render products in the table
 * @param {Array} products - Array of product objects from API
 */
function renderProducts(products) {
    if (!elements.productsTableBody) return;
    
    // Clear existing rows
    elements.productsTableBody.innerHTML = '';
    
    if (products.length === 0) {
        elements.productsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    Henüz ürün bulunmamaktadır.
                </td>
            </tr>
        `;
        updateProductsCount('Ürün bulunamadı');
        return;
    }
    
    // Create rows for each product
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Format price with Turkish locale
        const formattedPrice = new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(product.birim_fiyat);
        
        // Format volume using custom DB formatter
        const formattedVolume = formatDbValue(product.hacim_db);
        
        row.innerHTML = `
            <td class="product-name">${escapeHtml(product.ad)}</td>
            <td><span class="category-tag">${escapeHtml(product.kategori_ad || 'Kategorisiz')}</span></td>
            <td>${formattedPrice} ₺</td>
            <td>${formattedVolume}</td>
            <td class="td-actions">
                <button class="btn-edit" 
                        data-id="${product.urun_id}"
                        data-name="${escapeHtml(product.ad)}"
                        data-category="${product.kategori_ad || ''}"
                        data-price="${product.birim_fiyat}"
                        data-hacim="${product.hacim_db || 0}"
                        onclick="openEditProductModal(this)">
                    ✏️ Düzenle
                </button>
            </td>
        `;
        
        elements.productsTableBody.appendChild(row);
    });
    
    // Update count
    updateProductsCount(`Toplam ${products.length} ürün listeleniyor`);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Load products from API
 */
async function loadProducts() {
    updateProductsCount('Ürünler yükleniyor...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/urunler`);
        
        // Check Content-Type header to ensure we're getting JSON
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
            // Server returned HTML or other non-JSON response
            const textResponse = await response.text();
            console.error('Non-JSON response received:', textResponse.substring(0, 200));
            throw new Error('API bağlantı hatası');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || `API hatası: ${response.status}`);
        }
        
        if (data.success && data.data) {
            renderProducts(data.data);
            productsLoaded = true;
        } else {
            throw new Error(data.error || 'Beklenmeyen API yanıtı');
        }
    } catch (error) {
        console.error('❌ Products loading error:', error);
        // Show error inline in the table instead of big error panel
        if (elements.productsTableBody) {
            elements.productsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-danger);">
                        Ürünler yüklenirken hata oluştu. Sayfayı yenileyerek tekrar deneyin.
                    </td>
                </tr>
            `;
        }
        updateProductsCount('Yükleme hatası');
        productsLoaded = false;
    }
}

// ======================
// Store Utilization Functions
// ======================

/**
 * Load and display store utilization data
 */
async function loadStoreUtilization(target = 'dashboard') {
    // Determine which elements to use based on target
    const els = target === 'analysis' ? {
        loading: elements.analysisUtilizationLoading,
        display: elements.analysisUtilizationDisplay,
        noData: elements.analysisUtilizationNoData,
        warning: elements.analysisUtilizationWarning,
        helperText: elements.analysisUtilizationHelperText,
        percent: elements.analysisUtilizationPercent,
        circleProgress: elements.analysisUtilizationCircleProgress,
        used: elements.analysisUtilizationUsed,
        capacity: elements.analysisUtilizationCapacity,
        free: elements.analysisUtilizationFree,
        warningText: elements.analysisUtilizationWarningText
    } : {
        loading: elements.utilizationLoading,
        display: elements.utilizationDisplay,
        noData: elements.utilizationNoData,
        warning: elements.utilizationWarning,
        helperText: elements.utilizationHelperText,
        percent: elements.utilizationPercent,
        circleProgress: elements.utilizationCircleProgress,
        used: elements.utilizationUsed,
        capacity: elements.utilizationCapacity,
        free: elements.utilizationFree,
        warningText: elements.utilizationWarningText
    };
    
    // Show loading state
    if (els.loading) els.loading.classList.remove('hidden');
    if (els.display) els.display.classList.add('hidden');
    if (els.noData) els.noData.classList.add('hidden');
    if (els.warning) els.warning.classList.add('hidden');
    if (els.helperText) els.helperText.classList.add('hidden');
    
    try {
        // Use cached data if available, otherwise fetch
        let data = cachedUtilizationData;
        
        if (!data) {
            const response = await fetch(`${API_BASE_URL}/store/utilization`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                data = result.data;
                cachedUtilizationData = data; // Cache for reuse
            }
        }
        
        if (data) {
            renderUtilization(data, els);
        } else {
            showUtilizationNoData(els);
        }
    } catch (error) {
        console.error('❌ Error loading store utilization:', error);
        showUtilizationNoData(els);
    }
}

/**
 * Show no data state for utilization
 * @param {Object} els - Element references
 */
function showUtilizationNoData(els) {
    if (!els) {
        els = {
            loading: elements.utilizationLoading,
            display: elements.utilizationDisplay,
            noData: elements.utilizationNoData,
            warning: elements.utilizationWarning,
            helperText: elements.utilizationHelperText
        };
    }
    if (els.loading) els.loading.classList.add('hidden');
    if (els.display) els.display.classList.add('hidden');
    if (els.noData) els.noData.classList.remove('hidden');
    if (els.warning) els.warning.classList.add('hidden');
    if (els.helperText) els.helperText.classList.add('hidden');
    
    // Reset decision card when dashboard data is missing
    if (els.percent === elements.utilizationPercent) {
        updateDepoDecision(null);
    }
}

/**
 * Render utilization data to the DOM
 * @param {Object} data - Utilization data from API
 */
/**
 * Render utilization data to the DOM
 * @param {Object} data - Utilization data from API
 * @param {Object} els - Element references (optional, defaults to dashboard elements)
 */
function renderUtilization(data, els) {
    // Default to dashboard elements if not specified
    if (!els) {
        els = {
            loading: elements.utilizationLoading,
            display: elements.utilizationDisplay,
            noData: elements.utilizationNoData,
            warning: elements.utilizationWarning,
            helperText: elements.utilizationHelperText,
            percent: elements.utilizationPercent,
            circleProgress: elements.utilizationCircleProgress,
            used: elements.utilizationUsed,
            capacity: elements.utilizationCapacity,
            free: elements.utilizationFree,
            warningText: elements.utilizationWarningText
        };
    }
    
    if (els.loading) els.loading.classList.add('hidden');
    if (els.noData) els.noData.classList.add('hidden');
    if (els.display) els.display.classList.remove('hidden');
    if (els.helperText) els.helperText.classList.remove('hidden');
    
    const { usedDB, capacityDB, freeDB, utilizationPercent } = data;
    
    // Update percentage text
    if (els.percent) {
        els.percent.textContent = utilizationPercent;
    }
    
    // Update circle progress
    if (els.circleProgress) {
        // Circle circumference is 264 (2 * PI * 42)
        const circumference = 264;
        const offset = circumference - (circumference * utilizationPercent / 100);
        els.circleProgress.style.strokeDashoffset = offset;
        
        // Change color based on utilization
        if (utilizationPercent >= 80) {
            els.circleProgress.style.stroke = 'var(--color-danger)';
        } else if (utilizationPercent >= 60) {
            els.circleProgress.style.stroke = 'var(--color-warning)';
        } else {
            els.circleProgress.style.stroke = 'var(--color-success)';
        }
    }
    
    // Update detail values
    if (els.used) {
        els.used.textContent = `${formatDbValue(usedDB)} DB`;
    }
    if (els.capacity) {
        els.capacity.textContent = `${formatDbValue(capacityDB)} DB`;
    }
    if (els.free) {
        els.free.textContent = `${formatDbValue(freeDB)} DB`;
    }
    
    // Show warning if utilization is high
    if (utilizationPercent >= 80 && els.warning) {
        els.warning.classList.remove('hidden');
        if (els.warningText) {
            if (utilizationPercent >= 90) {
                els.warningText.textContent = 'Doluluk oranı kritik seviyede! Acil depo ihtiyacı değerlendirilmeli.';
            } else {
                els.warningText.textContent = 'Doluluk oranı %80\'in üzerinde. Depo ihtiyacı değerlendirilmeli.';
            }
        }
    }
    
    // Update decision card only for dashboard card
    if (els.percent === elements.utilizationPercent) {
        updateDepoDecision(data);
    }
}

/**
 * Update the Depo Karar Önerisi card based on utilization data.
 * @param {Object|null} data - Utilization data {utilizationPercent, capacityDB, usedDB}
 */
function updateDepoDecision(data) {
    const badge = elements.depoDecisionBadge;
    const text = elements.depoDecisionText;
    const summary = elements.depoDecisionSummary;
    const metricCurrent = elements.metricCurrentUtil;
    const metricAverage = elements.metricAverage6m;
    const metricForecast = elements.metricForecast3m;
    const metricCost = elements.metricExtraCost;
    
    if (!badge || !text || !summary) return;
    
    const resetStateClasses = () => {
        badge.classList.remove('decision-state--positive', 'decision-state--warning', 'decision-state--critical');
    };
    
    if (!data) {
        resetStateClasses();
        badge.textContent = '—';
        text.textContent = 'Veri bekleniyor';
        summary.textContent = 'Doluluk verileri alınamadı; karar önerisi oluşturulamadı.';
        if (metricCurrent) metricCurrent.textContent = '- %';
        if (metricAverage) metricAverage.textContent = '- %';
        if (metricForecast) metricForecast.textContent = '- %';
        if (metricCost) metricCost.textContent = '~45.000 TL';
        return;
    }
    
    const currentUtil = Math.max(0, Math.min(100, Number(data.utilizationPercent) || 0));
    const avgLast6m = Math.max(0, Math.min(100, Math.round(currentUtil - 6)));
    const forecast3m = Math.max(0, Math.min(110, Math.round(currentUtil + 8)));
    
    if (metricCurrent) metricCurrent.textContent = `${currentUtil.toFixed(0)} %`;
    if (metricAverage) metricAverage.textContent = `${avgLast6m.toFixed(0)} %`;
    if (metricForecast) metricForecast.textContent = `${forecast3m.toFixed(0)} %`;
    if (metricCost && !metricCost.textContent.trim()) {
        metricCost.textContent = '~45.000 TL';
    }
    
    let decisionText = 'Şimdilik mevcut depo yeterli';
    let summaryText = 'Doluluk oranı ve satış trendlerine göre mevcut depo kapasitesi kısa vadede yeterli görünmektedir.';
    let stateClass = 'decision-state--positive';
    let badgeLabel = 'Uygun';
    
    const exceedsCapacity = forecast3m > 100;
    
    if (currentUtil < 70 && forecast3m < 85) {
        stateClass = 'decision-state--positive';
        decisionText = 'Şimdilik mevcut depo yeterli';
        summaryText = 'Doluluk oranı ve trendler, mevcut deponun yakın vadede yeterli olacağını gösteriyor.';
        badgeLabel = 'Uygun';
    } else if (currentUtil >= 90 || exceedsCapacity) {
        stateClass = 'decision-state--critical';
        decisionText = 'Ek depo şiddetle önerilir';
        summaryText = 'Artan satış hacmi ve yüksek doluluk nedeniyle arka deponun kısa sürede devreye alınması önerilmektedir.';
        badgeLabel = 'Kritik';
    } else {
        stateClass = 'decision-state--warning';
        decisionText = 'Yakında ek depo gerekebilir';
        summaryText = 'Doluluk oranı artış eğiliminde. Önümüzdeki dönem için arka depo planlaması yapılmalıdır.';
        badgeLabel = 'Uyarı';
    }
    
    resetStateClasses();
    badge.classList.add(stateClass);
    badge.textContent = badgeLabel;
    text.textContent = decisionText;
    summary.textContent = summaryText;
}

// ======================
// Month Utility Functions
// ======================

// Turkish month names
const TURKISH_MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * Get the last 6 months including current month
 * @returns {Array} Array of {value: 'YYYY-MM', label: 'Turkish Month Year'}
 */
function getLast6Months() {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const value = `${year}-${String(month + 1).padStart(2, '0')}`;
        const label = `${TURKISH_MONTHS[month]} ${year}`;
        months.push({ value, label });
    }
    
    return months;
}

/**
 * Show the Sales Details section (full page view)
 * @param {string} month - Optional month in YYYY-MM format to pre-select
 */
function showSalesDetailsSection(month) {
    // Default to current month if no month provided
    if (!month) {
        const now = new Date();
        month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    hideAllSections();
    
    if (elements.salesDetailsSection) {
        elements.salesDetailsSection.classList.remove('hidden');
        
        // Populate month selector on details page
        populateSalesDetailsMonthSelector(month);
        
        // Load chart data for the selected month
        loadSalesDetailsChart(month);
        
        // Load sales insights (6-month trends)
        loadSalesInsights();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Populate the month selector on the Sales Details page
 * @param {string} selectedMonth - Month to pre-select in YYYY-MM format
 */
function populateSalesDetailsMonthSelector(selectedMonth) {
    if (!elements.salesDetailsMonthSelect) return;
    
    const months = getLast6Months();
    elements.salesDetailsMonthSelect.innerHTML = months.map(m => 
        `<option value="${m.value}"${m.value === selectedMonth ? ' selected' : ''}>${m.label}</option>`
    ).join('');
}

/**
 * Handle month change on Sales Details page
 */
function onSalesDetailsMonthChange() {
    const selectedMonth = elements.salesDetailsMonthSelect?.value;
    if (selectedMonth) {
        loadSalesDetailsChart(selectedMonth);
        
        // Reset AI advice when month changes
        resetAiAdviceOnMonthChange();
    }
}

/**
 * Load sales details chart data from API
 * @param {string} month - Month in YYYY-MM format
 */
async function loadSalesDetailsChart(month) {
    if (!month) {
        const now = new Date();
        month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    // Show loading state
    showChartLoading();
    updateMonthlyCiro(null, true); // Show loading for ciro
    
    try {
        // Fetch chart data (Top-10 products) and monthly revenue (full total) in parallel
        const [chartResponse, revenueResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/sales-details?month=${month}`),
            fetch(`${API_BASE_URL}/monthly-revenue?month=${month}`)
        ]);
        
        if (!chartResponse.ok) {
            throw new Error(`HTTP error! status: ${chartResponse.status}`);
        }
        
        const chartData = await chartResponse.json();
        
        // Handle chart data
        if (chartData.success && chartData.items && chartData.items.length > 0) {
            // Store raw data for re-sorting when mode changes
            salesChartRawData = chartData.items;
            renderSalesChart();
        } else {
            salesChartRawData = [];
            showChartNoData();
        }
        
        // Handle monthly revenue (full total from dedicated endpoint)
        if (revenueResponse.ok) {
            const revenueData = await revenueResponse.json();
            if (revenueData.success && revenueData.monthly_total !== undefined) {
                updateMonthlyCiro(revenueData.monthly_total);
            } else {
                updateMonthlyCiro(0);
            }
        } else {
            console.warn('⚠️ Monthly revenue endpoint failed, falling back to chart total');
            // Fallback: calculate from chart data if revenue endpoint fails
            const fallbackTotal = salesChartRawData.reduce((sum, item) => sum + parseFloat(item.toplam_tutar || 0), 0);
            updateMonthlyCiro(fallbackTotal);
        }
    } catch (error) {
        console.error('❌ Error loading sales details:', error);
        salesChartRawData = [];
        showChartNoData();
        updateMonthlyCiro(0);
    }
}

/**
 * Update the monthly total ciro display
 * @param {number|null} amount - Total ciro amount, or null for loading state
 * @param {boolean} isLoading - Whether to show loading state
 */
function updateMonthlyCiro(amount, isLoading = false) {
    if (!elements.monthlyCiroValue) return;
    
    if (isLoading) {
        elements.monthlyCiroValue.innerHTML = '<span class="ciro-loading">Yükleniyor...</span>';
    } else if (amount === null || amount === undefined) {
        elements.monthlyCiroValue.textContent = '0 ₺';
    } else {
        elements.monthlyCiroValue.textContent = formatCurrencyTL(amount);
    }
}

/**
 * Sort and get top 10 items based on current mode
 * @returns {Array} Sorted top 10 items
 */
function getSortedChartData() {
    if (!salesChartRawData || salesChartRawData.length === 0) {
        return [];
    }
    
    // Create a copy to avoid mutating original data
    const sorted = [...salesChartRawData];
    
    if (salesChartMode === 'revenue') {
        // Sort by toplam_tutar descending
        sorted.sort((a, b) => parseFloat(b.toplam_tutar) - parseFloat(a.toplam_tutar));
    } else {
        // Sort by toplam_adet descending
        sorted.sort((a, b) => parseInt(b.toplam_adet) - parseInt(a.toplam_adet));
    }
    
    // Return top 10
    return sorted.slice(0, 10);
}

/**
 * Render the sales chart with current mode
 */
function renderSalesChart() {
    const items = getSortedChartData();
    
    if (items.length === 0) {
        showChartNoData();
        return;
    }
    
    renderSalesRevenueChart(items);
}

/**
 * Switch chart mode and re-render
 * @param {string} mode - 'revenue' or 'quantity'
 */
function switchChartMode(mode) {
    if (mode === salesChartMode) return;
    
    salesChartMode = mode;
    
    // Update button states
    if (elements.chartModeRevenue) {
        elements.chartModeRevenue.classList.toggle('active', mode === 'revenue');
    }
    if (elements.chartModeQuantity) {
        elements.chartModeQuantity.classList.toggle('active', mode === 'quantity');
    }
    
    // Re-render chart with new mode
    if (salesChartRawData.length > 0) {
        renderSalesChart();
    }
}

// ======================
// Sales Insights Functions
// ======================

/**
 * Load and display sales trend insights
 */
async function loadSalesInsights() {
    // Show loading state
    if (elements.insightsLoading) elements.insightsLoading.classList.remove('hidden');
    if (elements.insightsContent) elements.insightsContent.classList.add('hidden');
    if (elements.insightsNoData) elements.insightsNoData.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/sales-trends`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.products && data.products.length > 0) {
            const insights = analyzeSalesTrends(data.months, data.products);
            renderInsights(insights);
        } else {
            showInsightsNoData();
        }
    } catch (error) {
        console.error('❌ Error loading sales insights:', error);
        showInsightsNoData();
    }
}

/**
 * Show no data state for insights
 */
function showInsightsNoData() {
    if (elements.insightsLoading) elements.insightsLoading.classList.add('hidden');
    if (elements.insightsContent) elements.insightsContent.classList.add('hidden');
    if (elements.insightsNoData) elements.insightsNoData.classList.remove('hidden');
}

/**
 * Analyze sales trends and generate insights
 * @param {Array} months - Array of month strings
 * @param {Array} products - Array of product data with monthly sales
 * @returns {Object} Insights object
 */
function analyzeSalesTrends(months, products) {
    const insights = {
        increasing: [],
        decreasing: [],
        stable: [],
        topGrowth: null,
        topDrop: null,
        mostStable: null
    };
    
    products.forEach(product => {
        const monthly = product.monthly.map(m => m.adet);
        const analysis = analyzeProductTrend(product.urun_adi, monthly, months);
        
        if (analysis) {
            if (analysis.trend === 'increasing') {
                insights.increasing.push(analysis);
            } else if (analysis.trend === 'decreasing') {
                insights.decreasing.push(analysis);
            } else {
                insights.stable.push(analysis);
            }
        }
    });
    
    // Sort to find top performers
    insights.increasing.sort((a, b) => b.percentChange - a.percentChange);
    insights.decreasing.sort((a, b) => a.percentChange - b.percentChange);
    insights.stable.sort((a, b) => a.variance - b.variance);
    
    // Set highlights
    if (insights.increasing.length > 0) {
        insights.topGrowth = insights.increasing[0];
    }
    if (insights.decreasing.length > 0) {
        insights.topDrop = insights.decreasing[0];
    }
    if (insights.stable.length > 0) {
        insights.mostStable = insights.stable[0];
    }
    
    return insights;
}

/**
 * Analyze a single product's sales trend
 * @param {string} name - Product name
 * @param {Array} monthly - Array of monthly sales quantities
 * @param {Array} months - Array of month strings
 * @returns {Object|null} Analysis result or null if insufficient data
 */
function analyzeProductTrend(name, monthly, months) {
    // Need at least 2 months with sales
    const nonZeroMonths = monthly.filter(m => m > 0).length;
    if (nonZeroMonths < 2) return null;
    
    const total = monthly.reduce((sum, m) => sum + m, 0);
    const average = total / monthly.length;
    
    // Calculate variance for stability
    const variance = monthly.reduce((sum, m) => sum + Math.pow(m - average, 2), 0) / monthly.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = average > 0 ? (stdDev / average) * 100 : 0;
    
    // Compare first half vs second half for trend
    const firstHalf = monthly.slice(0, 3);
    const secondHalf = monthly.slice(3, 6);
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / 3;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / 3;
    
    // Calculate percent change (first to last non-zero comparison)
    const firstNonZero = monthly.find(m => m > 0) || 0;
    const lastNonZero = [...monthly].reverse().find(m => m > 0) || 0;
    let percentChange = 0;
    if (firstNonZero > 0) {
        percentChange = ((lastNonZero - firstNonZero) / firstNonZero) * 100;
    }
    
    // Determine trend
    let trend = 'stable';
    let message = '';
    
    // Check for recent decline (last 2 months)
    const recentDecline = monthly[5] < monthly[4] && monthly[4] < monthly[3] && monthly[3] > 0;
    
    if (percentChange > 30 && secondHalfAvg > firstHalfAvg * 1.2) {
        trend = 'increasing';
        message = `${name} satışları 6 ayda <span class="insight-percent-up">%${Math.round(percentChange)}</span> arttı.`;
    } else if (percentChange < -20 || recentDecline) {
        trend = 'decreasing';
        if (recentDecline) {
            message = `${name} satışları son 2 ayda düşüş gösterdi.`;
        } else {
            message = `${name} satışları <span class="insight-percent-down">%${Math.abs(Math.round(percentChange))}</span> azaldı.`;
        }
    } else if (coefficientOfVariation < 30) {
        trend = 'stable';
        message = `${name} aylık ortalama satışını korudu.`;
    } else {
        trend = 'stable';
        message = `${name} dalgalı satış performansı gösterdi.`;
    }
    
    return {
        name,
        trend,
        message,
        percentChange,
        variance: coefficientOfVariation,
        average: Math.round(average),
        total,
        monthly
    };
}

/**
 * Render insights to the DOM
 * @param {Object} insights - Analyzed insights object
 */
function renderInsights(insights) {
    if (elements.insightsLoading) elements.insightsLoading.classList.add('hidden');
    if (elements.insightsNoData) elements.insightsNoData.classList.add('hidden');
    if (elements.insightsContent) elements.insightsContent.classList.remove('hidden');
    
    let html = '';
    
    // Highlights section
    if (insights.topGrowth || insights.topDrop || insights.mostStable) {
        html += `
            <div class="insight-section">
                <div class="insight-section-title">⭐ Öne Çıkan Trendler</div>
                <ul class="insight-list">
        `;
        
        if (insights.topGrowth) {
            html += `
                <li class="insight-item positive">
                    <strong>En Yüksek Artış:</strong> ${insights.topGrowth.message}
                </li>
            `;
        }
        
        if (insights.topDrop) {
            html += `
                <li class="insight-item negative">
                    <strong>Dikkat:</strong> ${insights.topDrop.message}
                </li>
            `;
        }
        
        if (insights.mostStable) {
            html += `
                <li class="insight-item neutral">
                    <strong>En Stabil:</strong> ${insights.mostStable.name} tutarlı satış performansı gösterdi.
                </li>
            `;
        }
        
        html += '</ul></div>';
    }
    
    // Increasing products section
    if (insights.increasing.length > 1) {
        html += `
            <div class="insight-section">
                <div class="insight-section-title">📈 Yükselen Ürünler</div>
                <ul class="insight-list">
        `;
        
        // Show top 3 (excluding the highlight)
        insights.increasing.slice(1, 4).forEach(item => {
            html += `<li class="insight-item positive">${item.message}</li>`;
        });
        
        html += '</ul></div>';
    }
    
    // Decreasing products section
    if (insights.decreasing.length > 1) {
        html += `
            <div class="insight-section">
                <div class="insight-section-title">📉 Düşüşte Olan Ürünler</div>
                <ul class="insight-list">
        `;
        
        // Show top 3 (excluding the highlight)
        insights.decreasing.slice(1, 4).forEach(item => {
            html += `<li class="insight-item negative">${item.message}</li>`;
        });
        
        html += '</ul></div>';
    }
    
    // Stable products section
    if (insights.stable.length > 0) {
        html += `
            <div class="insight-section">
                <div class="insight-section-title">📊 Stabil Satış Performansı</div>
                <ul class="insight-list">
        `;
        
        // Show top 3 stable products
        insights.stable.slice(0, 3).forEach(item => {
            html += `<li class="insight-item neutral">${item.message}</li>`;
        });
        
        html += '</ul></div>';
    }
    
    // If no insights generated
    if (!html) {
        showInsightsNoData();
        return;
    }
    
    elements.insightsContent.innerHTML = html;
}

// ======================
// AI Decision Support Functions
// ======================

// State for AI advice
let aiAdviceState = {
    isLoading: false,
    advice: null,
    error: null,
    lastMonth: null
};

/**
 * Show the initial state of AI advice card
 */
function showAiAdviceInitial() {
    if (elements.aiAdviceInitial) elements.aiAdviceInitial.classList.remove('hidden');
    if (elements.aiAdviceLoading) elements.aiAdviceLoading.classList.add('hidden');
    if (elements.aiAdviceError) elements.aiAdviceError.classList.add('hidden');
    if (elements.aiAdviceResult) elements.aiAdviceResult.classList.add('hidden');
}

/**
 * Show the loading state of AI advice card
 */
function showAiAdviceLoading() {
    if (elements.aiAdviceInitial) elements.aiAdviceInitial.classList.add('hidden');
    if (elements.aiAdviceLoading) elements.aiAdviceLoading.classList.remove('hidden');
    if (elements.aiAdviceError) elements.aiAdviceError.classList.add('hidden');
    if (elements.aiAdviceResult) elements.aiAdviceResult.classList.add('hidden');
}

/**
 * Show the error state of AI advice card
 * @param {string} message - Error message to display
 */
function showAiAdviceError(message) {
    if (elements.aiAdviceInitial) elements.aiAdviceInitial.classList.add('hidden');
    if (elements.aiAdviceLoading) elements.aiAdviceLoading.classList.add('hidden');
    if (elements.aiAdviceError) elements.aiAdviceError.classList.remove('hidden');
    if (elements.aiAdviceResult) elements.aiAdviceResult.classList.add('hidden');
    
    if (elements.aiErrorMessage) {
        elements.aiErrorMessage.textContent = message;
    }
}

/**
 * Show the result state of AI advice card
 */
function showAiAdviceResult() {
    if (elements.aiAdviceInitial) elements.aiAdviceInitial.classList.add('hidden');
    if (elements.aiAdviceLoading) elements.aiAdviceLoading.classList.add('hidden');
    if (elements.aiAdviceError) elements.aiAdviceError.classList.add('hidden');
    if (elements.aiAdviceResult) elements.aiAdviceResult.classList.remove('hidden');
}

/**
 * Parse and render AI advice content
 * @param {string} advice - Raw advice text from AI
 */
function renderAiAdvice(advice) {
    if (!elements.aiAdviceContent) return;
    
    // Convert markdown-like text to HTML
    let html = advice
        // Convert **text** to <strong>
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Convert headers (lines starting with numbers like "1." or "2.")
        .replace(/^(\d+\.\s*\*\*[^*]+\*\*)/gm, '<h4>$1</h4>')
        // Keep existing bullet points
        .replace(/^[•\-]\s*/gm, '• ');
    
    // Split into sections by headers
    const sections = html.split(/<h4>/);
    let formattedHtml = '';
    
    sections.forEach((section, index) => {
        if (index === 0 && !section.trim()) return;
        
        if (index > 0) {
            // This section had a header
            const headerEndIndex = section.indexOf('</h4>');
            if (headerEndIndex > -1) {
                const header = section.substring(0, headerEndIndex);
                const content = section.substring(headerEndIndex + 5);
                formattedHtml += `<h4>${header}</h4>`;
                formattedHtml += formatBulletPoints(content);
            } else {
                formattedHtml += formatBulletPoints(section);
            }
        } else {
            formattedHtml += formatBulletPoints(section);
        }
    });
    
    elements.aiAdviceContent.innerHTML = formattedHtml || '<p>Öneri bulunamadı.</p>';
    showAiAdviceResult();
}

/**
 * Format bullet points into list HTML
 * @param {string} text - Text with bullet points
 * @returns {string} HTML with ul/li elements
 */
function formatBulletPoints(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let html = '';
    let inList = false;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            const content = trimmed.replace(/^[•\-]\s*/, '');
            html += `<li>${content}</li>`;
        } else if (trimmed) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += `<p>${trimmed}</p>`;
        }
    });
    
    if (inList) {
        html += '</ul>';
    }
    
    return html;
}

/**
 * Get AI decision support advice
 */
async function getAiAdvice() {
    // Get current month from sales details dropdown
    const month = elements.salesDetailsMonthSelector?.value || getCurrentMonth();
    
    // Update state
    aiAdviceState.isLoading = true;
    aiAdviceState.error = null;
    showAiAdviceLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/decision-support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ month })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'API hatası');
        }
        
        const data = await response.json();
        
        if (data.success && data.advice) {
            aiAdviceState.advice = data.advice;
            aiAdviceState.lastMonth = month;
            aiAdviceState.error = null;
            renderAiAdvice(data.advice);
        } else {
            throw new Error('Geçersiz yanıt');
        }
        
    } catch (error) {
        console.error('❌ AI advice error:', error);
        aiAdviceState.advice = null;
        aiAdviceState.error = error.message;
        showAiAdviceError('Yapay zeka önerisi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
        aiAdviceState.isLoading = false;
    }
}

/**
 * Get current month in YYYY-MM format
 * @returns {string} Current month
 */
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Reset AI advice state when month changes
 */
function resetAiAdviceOnMonthChange() {
    if (aiAdviceState.advice && elements.salesDetailsMonthSelector) {
        const currentMonth = elements.salesDetailsMonthSelector.value;
        if (currentMonth !== aiAdviceState.lastMonth) {
            // Month changed, clear previous advice
            aiAdviceState.advice = null;
            aiAdviceState.error = null;
            showAiAdviceInitial();
        }
    }
}

/**
 * Show chart loading state
 */
function showChartLoading() {
    if (elements.salesChartLoading) elements.salesChartLoading.classList.remove('hidden');
    if (elements.salesChartNoData) elements.salesChartNoData.classList.add('hidden');
    if (elements.salesRevenueChart) elements.salesRevenueChart.classList.add('hidden');
    if (elements.salesChartContainer) elements.salesChartContainer.classList.remove('chart-active');
}

/**
 * Show no data message
 */
function showChartNoData() {
    if (elements.salesChartLoading) elements.salesChartLoading.classList.add('hidden');
    if (elements.salesChartNoData) elements.salesChartNoData.classList.remove('hidden');
    if (elements.salesRevenueChart) elements.salesRevenueChart.classList.add('hidden');
    if (elements.salesChartContainer) elements.salesChartContainer.classList.remove('chart-active');
    
    // Destroy existing chart if any
    if (salesRevenueChartInstance) {
        salesRevenueChartInstance.destroy();
        salesRevenueChartInstance = null;
    }
}

/**
 * Render the sales line chart
 * @param {Array} items - Array of sales items from API
 */
function renderSalesRevenueChart(items) {
    // Hide loading and no-data, show canvas
    if (elements.salesChartLoading) elements.salesChartLoading.classList.add('hidden');
    if (elements.salesChartNoData) elements.salesChartNoData.classList.add('hidden');
    if (elements.salesRevenueChart) elements.salesRevenueChart.classList.remove('hidden');
    if (elements.salesChartContainer) elements.salesChartContainer.classList.add('chart-active');
    
    // Destroy existing chart if any
    if (salesRevenueChartInstance) {
        salesRevenueChartInstance.destroy();
        salesRevenueChartInstance = null;
    }
    
    // Prepare data for chart
    const labels = items.map(item => truncateLabel(item.urun_adi, 20));
    const revenueData = items.map(item => parseFloat(item.toplam_tutar));
    const quantityData = items.map(item => parseInt(item.toplam_adet));
    const fullNames = items.map(item => item.urun_adi);
    
    // Determine which data to use based on current mode
    const isRevenueMode = salesChartMode === 'revenue';
    const chartData = isRevenueMode ? revenueData : quantityData;
    const datasetLabel = isRevenueMode ? 'Toplam Ciro (₺)' : 'Satış Adedi';
    
    // Define colors based on mode
    // Revenue mode: Green | Quantity mode: Dark navy blue
    const chartColors = isRevenueMode
        ? {
            line: '#13A865',
            dot: '#13A865',
            fill: 'rgba(19, 168, 101, 0.15)',
            hoverDot: '#0d8a50'
          }
        : {
            line: '#0F2038',
            dot: '#0F2038',
            fill: 'rgba(15, 32, 56, 0.15)',
            hoverDot: '#1a3a5c'
          };
    
    // Get canvas context
    const ctx = elements.salesRevenueChart.getContext('2d');
    
    // Create chart
    salesRevenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: datasetLabel,
                data: chartData,
                borderColor: chartColors.line,
                backgroundColor: chartColors.fill,
                borderWidth: 3,
                pointBackgroundColor: chartColors.dot,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: chartColors.hoverDot,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 37, 64, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 200, 87, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: {
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return fullNames[index];
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const revenue = revenueData[index];
                            const quantity = quantityData[index];
                            // Always show both quantity and revenue in tooltip
                            return [
                                `Satış Adedi: ${formatNumber(quantity)} adet`,
                                `Toplam Ciro: ${formatCurrencyTL(revenue)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: '#64748b',
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(226, 232, 240, 0.8)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: '#64748b',
                        callback: function(value) {
                            if (isRevenueMode) {
                                // Revenue mode: show as currency
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K ₺';
                                }
                                return value + ' ₺';
                            } else {
                                // Quantity mode: show as units
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        }
    });
    
}

/**
 * Truncate label text for chart display
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateLabel(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format number as Turkish Lira currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrencyTL(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(amount);
}

// ======================
// Add Product Modal Functions
// ======================

/**
 * Open the Add Product modal
 */
function openAddProductModal() {
    if (elements.addProductModal) {
        elements.addProductModal.classList.remove('hidden');
        // Lock body scroll
        const scrollY = window.scrollY;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        
        // Load categories if not already loaded
        if (!categoriesLoaded) {
            loadCategories();
        }
        
        // Load locations if not already loaded
        if (!locationsLoaded) {
            loadLocations();
        }
        
        // Reset form
        resetAddProductForm();
        
        // Focus on first input
        if (elements.productNameInput) {
            elements.productNameInput.focus();
        }
    }
}

/**
 * Close the Add Product modal
 */
function closeAddProductModal() {
    if (elements.addProductModal) {
        elements.addProductModal.classList.add('hidden');
        // Unlock body scroll
        const scrollY = document.body.style.top;
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY.replace('-', '')) || 0);
        }
    }
}

/**
 * Reset the Add Product form
 */
function resetAddProductForm() {
    if (elements.addProductForm) {
        elements.addProductForm.reset();
    }
    if (elements.productHacimInput) {
        elements.productHacimInput.value = '0.10';
    }
    if (elements.productAdetInput) {
        elements.productAdetInput.value = '1';
    }
    if (elements.productLokasyonSelect) {
        elements.productLokasyonSelect.value = '';
    }
    hideFormMessages();
    hideDbExamplesPanel();
    updateStockPreview(); // Reset preview
}

/**
 * Toggle the DB examples panel visibility
 */
function toggleDbExamplesPanel() {
    if (elements.dbExamplesPanel && elements.btnToggleDbExamples) {
        const isHidden = elements.dbExamplesPanel.classList.contains('hidden');
        
        if (isHidden) {
            elements.dbExamplesPanel.classList.remove('hidden');
            elements.btnToggleDbExamples.classList.add('active');
        } else {
            elements.dbExamplesPanel.classList.add('hidden');
            elements.btnToggleDbExamples.classList.remove('active');
        }
    }
}

/**
 * Hide the DB examples panel
 */
function hideDbExamplesPanel() {
    if (elements.dbExamplesPanel) {
        elements.dbExamplesPanel.classList.add('hidden');
    }
    if (elements.btnToggleDbExamples) {
        elements.btnToggleDbExamples.classList.remove('active');
    }
}

/**
 * Hide form error and success messages
 */
function hideFormMessages() {
    if (elements.formErrorMessage) {
        elements.formErrorMessage.classList.add('hidden');
        elements.formErrorMessage.textContent = '';
    }
    if (elements.formSuccessMessage) {
        elements.formSuccessMessage.classList.add('hidden');
        elements.formSuccessMessage.textContent = '';
    }
}

/**
 * Show form error message
 * @param {string} message - Error message to display
 */
function showFormError(message) {
    hideFormMessages();
    if (elements.formErrorMessage) {
        elements.formErrorMessage.textContent = message;
        elements.formErrorMessage.classList.remove('hidden');
    }
}

/**
 * Show form success message
 * @param {string} message - Success message to display
 */
function showFormSuccess(message) {
    hideFormMessages();
    if (elements.formSuccessMessage) {
        elements.formSuccessMessage.textContent = message;
        elements.formSuccessMessage.classList.remove('hidden');
    }
}

/**
 * Load locations from API
 */
async function loadLocations() {
    if (!elements.productLokasyonSelect) return;
    
    hideLokasyonError();
    showLokasyonLoadingOption(elements.productLokasyonSelect);
    
    try {
        const response = await fetch(`${API_BASE_URL}/lokasyonlar`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API bağlantı hatası');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Lokasyonlar yüklenemedi');
        }
        
        if (data.success && data.data) {
            locationsData = data.data;
            populateLocationDropdown(locationsData);
            locationsLoaded = true;
            
            // Default select the first 'magaza' location (main store)
            const mainStore = locationsData.find(loc => loc.tur === 'magaza');
            if (mainStore && elements.productLokasyonSelect) {
                elements.productLokasyonSelect.value = mainStore.lokasyon_id;
                updateStockPreview();
            }
        }
    } catch (error) {
        console.error('❌ Locations loading error:', error);
        showLokasyonError('Lokasyonlar yüklenemedi.');
        locationsLoaded = false;
    }
}

/**
 * Populate the location dropdown with options
 * @param {Array} locations - Array of location objects
 */
function populateLocationDropdown(locations) {
    if (!elements.productLokasyonSelect) return;
    
    elements.productLokasyonSelect.innerHTML = '<option value="">Depo seçin...</option>';
    
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.lokasyon_id;
        option.textContent = `${location.ad} (${location.tur === 'magaza' ? 'Mağaza' : 'Depo'})`;
        
        // Compute numeric capacity and used first
        const capacityDb = Number(location.kapasite_db || location.kullanilabilir_kapasite_db || 0);
        const usedDb = Number(location.used_db || 0);
        
        // Compute occupancy percent ON 0-100 scale
        const dolulukYuzde = capacityDb > 0 ? (usedDb / capacityDb) * 100 : 0;
        
        // Assign datasets using computed values
        option.dataset.capacity = capacityDb;
        option.dataset.usedDb = usedDb;
        option.dataset.dolulukYuzde = dolulukYuzde;
        
        elements.productLokasyonSelect.appendChild(option);
    });
}

/**
 * Show loading option in location select
 */
function showLokasyonLoadingOption(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="" disabled selected>Depolar yükleniyor...</option>';
}

/**
 * Show location error
 */
function showLokasyonError(message) {
    if (elements.lokasyonErrorMessage) {
        elements.lokasyonErrorMessage.textContent = message || 'Lokasyonlar yüklenemedi.';
        elements.lokasyonErrorMessage.classList.remove('hidden');
    }
}

/**
 * Hide location error
 */
function hideLokasyonError() {
    if (elements.lokasyonErrorMessage) {
        elements.lokasyonErrorMessage.classList.add('hidden');
    }
}

/**
 * Update stock preview based on current form values
 * Shows:
 * 1. Product's own occupancy percentage
 * 2. Total warehouse occupancy after adding this product
 */
function updateStockPreview() {
    if (!elements.stockPreviewGroup || !elements.previewSpaceDb || !elements.previewOccupancyPercent || !elements.previewTotalOccupancyPercent) {
        return;
    }
    
    const adet = parseFloat(elements.productAdetInput?.value) || 0;
    const hacimDb = parseFloat(elements.productHacimInput?.value) || 0;
    const lokasyonId = elements.productLokasyonSelect?.value;
    
    // Show preview only if all required values are present
    if (adet > 0 && hacimDb > 0 && lokasyonId) {
        const selectedOption = elements.productLokasyonSelect?.selectedOptions[0];
        if (!selectedOption) {
            elements.stockPreviewGroup.style.display = 'none';
            return;
        }
        
        // Calculate product DB (this product only)
        const productDb = adet * hacimDb;
        const capacityDb = parseFloat(selectedOption.dataset.capacity || 0);
        const currentUsedDb = parseFloat(selectedOption.dataset.usedDb || 0);
        
        // Update space preview
        elements.previewSpaceDb.textContent = formatDbValue(productDb) + ' DB';
        
        // Calculate product occupancy percentage: (product_db / kapasite_db) * 100
        if (capacityDb > 0) {
            const occupancyPercent = (productDb / capacityDb) * 100;
            // Round to 2 decimals
            const roundedPercent = Math.round(occupancyPercent * 100) / 100;
            elements.previewOccupancyPercent.textContent = `%${roundedPercent.toFixed(2)}`;
        } else {
            // Show error message if capacity is missing or 0
            elements.previewOccupancyPercent.textContent = 'Depo kapasitesi hesaplanamadı';
        }
        
        // Calculate total occupancy after adding this product
        if (capacityDb > 0) {
            const totalUsedDbAfter = currentUsedDb + productDb;
            const totalOccupancyPercent = (totalUsedDbAfter / capacityDb) * 100;
            // Round to 2 decimals
            const roundedTotalPercent = Math.round(totalOccupancyPercent * 100) / 100;
            
            // Update text content
            elements.previewTotalOccupancyPercent.textContent = `%${roundedTotalPercent.toFixed(2)}`;
            
            // Apply visual styling based on occupancy level
            if (elements.stockPreviewTotalOccupancy) {
                // Remove all state classes first
                elements.stockPreviewTotalOccupancy.classList.remove('preview-warning', 'preview-critical');
                
                if (roundedTotalPercent > 85) {
                    // Critical: >85%
                    elements.stockPreviewTotalOccupancy.classList.add('preview-critical');
                } else if (roundedTotalPercent >= 70) {
                    // Warning: 70-85%
                    elements.stockPreviewTotalOccupancy.classList.add('preview-warning');
                }
                // Normal: <70% (no class needed, uses default styling)
            }
        } else {
            // Show error message if capacity is missing or 0
            elements.previewTotalOccupancyPercent.textContent = 'Toplam doluluk hesaplanamadı';
            if (elements.stockPreviewTotalOccupancy) {
                elements.stockPreviewTotalOccupancy.classList.remove('preview-warning', 'preview-critical');
            }
        }
        
        elements.stockPreviewGroup.style.display = 'block';
    } else {
        elements.stockPreviewGroup.style.display = 'none';
    }
}

/**
 * Load categories from API
 */
async function loadCategories() {
    categoriesLoading = true;
    hideCategoryError();
    showCategoryLoadingOption(elements.productCategorySelect);
    
    try {
        const response = await fetch(`${API_BASE_URL}/kategoriler`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API bağlantı hatası');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Kategoriler yüklenemedi');
        }
        
        if (data.success && data.data) {
            categoriesData = normalizeCategories(data.data);
            populateCategoryDropdown(categoriesData);
            categoriesLoaded = true;
        }
    } catch (error) {
        console.error('❌ Categories loading error:', error);
        showCategoryError('Kategoriler yüklenemedi.');
        showFormError('Kategoriler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
        categoriesLoaded = false;
    } finally {
        categoriesLoading = false;
    }
}

/**
 * Populate the category dropdown with options
 * @param {Array} categories - Array of category objects
 */
function populateCategoryDropdown(categories) {
    if (!elements.productCategorySelect) return;
    
    elements.productCategorySelect.innerHTML = '<option value="">Kategori seçin...</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        option.dataset.categoryName = category.name; // Store name for hacim calculation
        elements.productCategorySelect.appendChild(option);
    });
}

/**
 * Calculate default Depo Birimi (hacim_db) based on category name
 * @param {string} categoryName - Name of the selected category
 * @returns {number} Default hacim value
 */
function calculateHacimByCategory(categoryName) {
    if (!categoryName) return 0.10;
    
    const name = categoryName.toLowerCase();
    
    if (name.includes('aydınlatma') || name.includes('ampul') || name.includes('armatür')) {
        return 0.15;
    }
    if (name.includes('kumanda')) {
        return 0.08;
    }
    if (name.includes('priz')) {
        return 0.12;
    }
    if (name.includes('kablo')) {
        return 2.50;
    }
    if (name.includes('vida') || name.includes('civata') || name.includes('somun')) {
        return 0.02;
    }
    if (name.includes('anahtar kopyalama') || name.includes('hizmet')) {
        return 0.00;
    }
    if (name.includes('anahtar')) {
        return 0.05;
    }
    if (name.includes('boya')) {
        return 0.10;
    }
    if (name.includes('tesisat') || name.includes('musluk') || name.includes('duş')) {
        return 0.05;
    }
    
    // Default value
    return 0.10;
}

/**
 * Handle category selection change
 */
function onCategoryChange() {
    const selectedOption = elements.productCategorySelect?.selectedOptions[0];
    if (selectedOption && selectedOption.value) {
        const categoryName = selectedOption.dataset.categoryName || selectedOption.textContent;
        const hacim = calculateHacimByCategory(categoryName);
        if (elements.productHacimInput) {
            elements.productHacimInput.value = hacim.toFixed(2);
        }
    }
}

/**
 * Handle Add Product form submission
 * @param {Event} event - Form submit event
 */
async function handleAddProductSubmit(event) {
    event.preventDefault();
    hideFormMessages();
    
    // Get form values
    const productName = elements.productNameInput?.value.trim();
    const categoryId = elements.productCategorySelect?.value;
    const hacimDb = parseFloat(elements.productHacimInput?.value) || 0;
    const birimFiyat = parseFloat(elements.productPriceInput?.value) || 0;
    const adet = parseInt(elements.productAdetInput?.value) || 0;
    const lokasyonId = elements.productLokasyonSelect?.value;
    
    // Validate
    if (!productName) {
        showFormError('Ürün adı zorunludur.');
        elements.productNameInput?.focus();
        return;
    }
    
    if (!categoryId) {
        showFormError('Kategori seçimi zorunludur.');
        elements.productCategorySelect?.focus();
        return;
    }
    
    if (hacimDb === null || hacimDb === undefined || isNaN(hacimDb) || elements.productHacimInput?.value === '') {
        showFormError('Depo birimi (DB) zorunludur.');
        elements.productHacimInput?.focus();
        return;
    }
    
    if (hacimDb < 0) {
        showFormError('Depo birimi negatif olamaz.');
        elements.productHacimInput?.focus();
        return;
    }
    
    if (birimFiyat <= 0) {
        showFormError('Geçerli bir birim fiyat girilmelidir.');
        elements.productPriceInput?.focus();
        return;
    }
    
    if (adet < 1 || !Number.isInteger(adet)) {
        showFormError('Adet/Stok en az 1 olmalıdır ve tam sayı olmalıdır.');
        elements.productAdetInput?.focus();
        return;
    }
    
    if (!lokasyonId) {
        showFormError('Depo seçimi zorunludur.');
        elements.productLokasyonSelect?.focus();
        return;
    }
    
    // Disable save button while submitting
    if (elements.modalSaveBtn) {
        elements.modalSaveBtn.disabled = true;
        elements.modalSaveBtn.textContent = 'Kaydediliyor...';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/urunler`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ad: productName,
                kategori_id: parseInt(categoryId),
                hacim_db: hacimDb,
                birim_fiyat: birimFiyat,
                adet: adet,
                lokasyon_id: parseInt(lokasyonId)
            })
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API bağlantı hatası');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ürün eklenirken hata oluştu');
        }
        
        if (data.success) {
            showFormSuccess('Ürün başarıyla eklendi!');
            
            // Refresh products list
            productsLoaded = false;
            loadProducts();
            
            // Refresh store utilization if stock was added
            if (data.data.location_occupancy) {
                cachedUtilizationData = null; // Clear cache to force refresh
                loadStoreUtilization();
            }
            
            // Refresh "Mevcut Depolarım" modal if it's open and product was added to a depot
            if (lokasyonId && typeof loadOwnedDepots === 'function') {
                const ownedModal = document.getElementById('mevcut-depolarim-modal');
                if (ownedModal && !ownedModal.classList.contains('hidden')) {
                    // Modal is open, refresh the owned depots list to update occupancy/status
                    loadOwnedDepots();
                }
            }
            
            // Close modal after a short delay
            setTimeout(() => {
                closeAddProductModal();
            }, 1000);
        } else {
            throw new Error(data.error || 'Beklenmeyen API yanıtı');
        }
    } catch (error) {
        console.error('❌ Add product error:', error);
        showFormError(error.message || 'Ürün eklenirken bir hata oluştu.');
    } finally {
        // Re-enable save button
        if (elements.modalSaveBtn) {
            elements.modalSaveBtn.disabled = false;
            elements.modalSaveBtn.innerHTML = '<span class="btn-icon">💾</span> Kaydet';
        }
    }
}

// ======================
// Edit Product Modal Functions
// ======================

/**
 * Open the Edit Product modal with product data
 * @param {HTMLElement} button - The edit button that was clicked
 */
function openEditProductModal(button) {
    const productId = button.dataset.id;
    const productName = button.dataset.name;
    const categoryName = button.dataset.category;
    const price = button.dataset.price;
    const hacim = button.dataset.hacim;
    
    currentEditProductId = productId;
    currentEditProductName = productName;
    
    if (elements.editProductModal) {
        elements.editProductModal.classList.remove('hidden');
        // Lock body scroll
        const scrollY = window.scrollY;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        
        // Fill form fields
        if (elements.editProductId) elements.editProductId.value = productId;
        if (elements.editProductName) elements.editProductName.value = productName;
        if (elements.editProductHacim) elements.editProductHacim.value = parseFloat(hacim).toFixed(2);
        if (elements.editProductPrice) elements.editProductPrice.value = parseFloat(price).toFixed(2);
        
        // Load categories and select the current one
        loadCategoriesForEditModal(categoryName);
        
        // Hide any previous messages
        hideEditFormMessages();
    }
}

/**
 * Close the Edit Product modal
 */
function closeEditProductModal() {
    if (elements.editProductModal) {
        elements.editProductModal.classList.add('hidden');
        // Unlock body scroll
        const scrollY = document.body.style.top;
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY.replace('-', '')) || 0);
        }
        currentEditProductId = null;
        currentEditProductName = '';
    }
}

/**
 * Load categories for the edit modal dropdown
 * @param {string} selectedCategoryName - Name of category to pre-select
 */
async function loadCategoriesForEditModal(selectedCategoryName) {
    if (!elements.editProductCategory) return;
    
    // If categories already loaded, use cached data
    if (categoriesLoaded && categoriesData.length > 0) {
        populateEditCategoryDropdown(categoriesData, selectedCategoryName);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/kategoriler`);
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API bağlantı hatası');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            categoriesData = normalizeCategories(data.data);
            categoriesLoaded = true;
            populateEditCategoryDropdown(categoriesData, selectedCategoryName);
        }
    } catch (error) {
        console.error('❌ Error loading categories for edit:', error);
        showEditFormError('Kategoriler yüklenemedi.');
    }
}

/**
 * Populate the edit modal category dropdown
 * @param {Array} categories - Array of category objects
 * @param {string} selectedCategoryName - Name of category to pre-select
 */
function populateEditCategoryDropdown(categories, selectedCategoryName) {
    if (!elements.editProductCategory) return;
    
    elements.editProductCategory.innerHTML = '<option value="">Kategori seçin...</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        
        // Select the matching category
        if (category.name === selectedCategoryName) {
            option.selected = true;
        }
        
        elements.editProductCategory.appendChild(option);
    });
}

/**
 * Normalize categories payload to {id, name}
 * @param {Array} data - Raw categories array
 * @returns {Array} normalized categories
 */
function normalizeCategories(data) {
    if (!Array.isArray(data)) return [];
    return data
        .map(c => ({
            id: c.id ?? c.kategori_id,
            name: c.name ?? c.kategori_ad
        }))
        .filter(c => c.id !== undefined && c.id !== null && c.name);
}

/**
 * Show a temporary loading option in a select
 * @param {HTMLSelectElement} selectEl
 */
function showCategoryLoadingOption(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="" disabled selected>Kategoriler yükleniyor...</option>';
}

/**
 * Show inline category error
 * @param {string} message
 */
function showCategoryError(message) {
    const el = document.getElementById('category-error-message');
    if (el) {
        el.textContent = message || 'Kategoriler yüklenemedi.';
        el.classList.remove('hidden');
    }
}

/**
 * Hide inline category error
 */
function hideCategoryError() {
    const el = document.getElementById('category-error-message');
    if (el) {
        el.classList.add('hidden');
    }
}

/**
 * Hide edit form error and success messages
 */
function hideEditFormMessages() {
    if (elements.editFormError) {
        elements.editFormError.classList.add('hidden');
        elements.editFormError.textContent = '';
    }
    if (elements.editFormSuccess) {
        elements.editFormSuccess.classList.add('hidden');
        elements.editFormSuccess.textContent = '';
    }
}

/**
 * Show edit form error message
 * @param {string} message - Error message
 */
function showEditFormError(message) {
    hideEditFormMessages();
    if (elements.editFormError) {
        elements.editFormError.textContent = message;
        elements.editFormError.classList.remove('hidden');
    }
}

/**
 * Show edit form success message
 * @param {string} message - Success message
 */
function showEditFormSuccess(message) {
    hideEditFormMessages();
    if (elements.editFormSuccess) {
        elements.editFormSuccess.textContent = message;
        elements.editFormSuccess.classList.remove('hidden');
    }
}

/**
 * Handle Edit Product form submission
 * @param {Event} event - Form submit event
 */
async function handleEditProductSubmit(event) {
    event.preventDefault();
    hideEditFormMessages();
    
    const productId = elements.editProductId?.value;
    const productName = elements.editProductName?.value.trim();
    const categoryId = elements.editProductCategory?.value;
    const hacimDb = parseFloat(elements.editProductHacim?.value) || 0;
    const birimFiyat = parseFloat(elements.editProductPrice?.value) || 0;
    
    // Validation
    if (!productName) {
        showEditFormError('Ürün adı zorunludur.');
        elements.editProductName?.focus();
        return;
    }
    
    if (!categoryId) {
        showEditFormError('Kategori seçimi zorunludur.');
        elements.editProductCategory?.focus();
        return;
    }
    
    if (hacimDb === null || hacimDb === undefined || isNaN(hacimDb) || elements.editProductHacim?.value === '') {
        showEditFormError('Depo birimi (DB) zorunludur.');
        elements.editProductHacim?.focus();
        return;
    }
    
    if (birimFiyat <= 0) {
        showEditFormError('Geçerli bir birim fiyat girilmelidir.');
        elements.editProductPrice?.focus();
        return;
    }
    
    // Disable save button
    if (elements.editModalSaveBtn) {
        elements.editModalSaveBtn.disabled = true;
        elements.editModalSaveBtn.textContent = 'Kaydediliyor...';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/urunler/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ad: productName,
                kategori_id: parseInt(categoryId),
                hacim_db: hacimDb,
                birim_fiyat: birimFiyat
            })
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API bağlantı hatası');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ürün güncellenirken hata oluştu');
        }
        
        if (data.success) {
            showEditFormSuccess('Ürün başarıyla güncellendi!');
            
            // Refresh products list
            productsLoaded = false;
            loadProducts();
            
            // Close modal after a short delay
            setTimeout(() => {
                closeEditProductModal();
            }, 1000);
        } else {
            throw new Error(data.error || 'Beklenmeyen API yanıtı');
        }
    } catch (error) {
        console.error('❌ Update product error:', error);
        showEditFormError(error.message || 'Ürün güncellenirken bir hata oluştu.');
    } finally {
        if (elements.editModalSaveBtn) {
            elements.editModalSaveBtn.disabled = false;
            elements.editModalSaveBtn.innerHTML = '<span class="btn-icon">💾</span> Kaydet';
        }
    }
}

// ======================
// Delete Product Functions
// ======================

/**
 * Open the delete confirmation modal
 */
function openDeleteConfirmModal() {
    if (elements.deleteConfirmModal) {
        elements.deleteConfirmModal.classList.remove('hidden');
        // Lock body scroll
        const scrollY = window.scrollY;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        
        // Show product name in confirmation
        if (elements.deleteProductName) {
            elements.deleteProductName.textContent = currentEditProductName;
        }
        
    }
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteConfirmModal() {
    if (elements.deleteConfirmModal) {
        elements.deleteConfirmModal.classList.add('hidden');
        // Unlock body scroll
        const scrollY = document.body.style.top;
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY.replace('-', '')) || 0);
        }
    }
}

/**
 * Handle product deletion
 */
async function handleDeleteProduct() {
    if (!currentEditProductId) {
        console.error('No product ID for deletion');
        return;
    }
    
    // Disable delete button
    if (elements.deleteModalConfirmBtn) {
        elements.deleteModalConfirmBtn.disabled = true;
        elements.deleteModalConfirmBtn.textContent = 'Siliniyor...';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/urunler/${currentEditProductId}`, {
            method: 'DELETE'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API bağlantı hatası');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ürün silinirken hata oluştu');
        }
        
        if (data.success) {
            // Close both modals
            closeDeleteConfirmModal();
            closeEditProductModal();
            
            // Refresh products list
            productsLoaded = false;
            loadProducts();
        } else {
            throw new Error(data.error || 'Beklenmeyen API yanıtı');
        }
    } catch (error) {
        console.error('❌ Delete product error:', error);
        // Show error in edit modal
        closeDeleteConfirmModal();
        showEditFormError(error.message || 'Ürün silinirken bir hata oluştu.');
    } finally {
        if (elements.deleteModalConfirmBtn) {
            elements.deleteModalConfirmBtn.disabled = false;
            elements.deleteModalConfirmBtn.innerHTML = '<span class="btn-icon">🗑️</span> Evet, Sil';
        }
    }
}

// ======================
// UI Update Functions
// ======================

/**
 * Update dashboard with new analysis data
 * @param {Object} data - Analysis result data
 */
function updateDashboard(data) {
    // Placeholder for Phase 2+
    // Will update:
    // - Decision summary card
    // - Utilization display
    // - Depot recommendations
    // - Product priorities
}

/**
 * Format number with Turkish locale
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    return new Intl.NumberFormat('tr-TR').format(num);
}

/**
 * Format currency with Turkish Lira
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format Depo Birimi (DB) value for display
 * Rules:
 * - If third decimal digit is non-zero, show 3 decimal places (e.g., 0.001 → "0.001")
 * - If third decimal digit is zero, show 2 decimal places (e.g., 0.020 → "0.02")
 * - Zero values display as "0.00"
 * @param {number|string} value - The DB value to format
 * @returns {string} Formatted DB value string
 */
function formatDbValue(value) {
    if (value === null || value === undefined || value === '') {
        return '–';
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
        return '–';
    }
    
    // Handle zero
    if (num === 0) {
        return '0.00';
    }
    
    // Check if the third decimal digit is non-zero
    // Multiply by 1000, get the last digit
    const thirdDecimal = Math.round(Math.abs(num) * 1000) % 10;
    
    if (thirdDecimal !== 0) {
        // Show 3 decimal places
        return num.toFixed(3);
    } else {
        // Show 2 decimal places
        return num.toFixed(2);
    }
}

// ======================
// Inflation & Stock Strategy
// ======================

/**
 * Format percentage value with Turkish locale and 2 decimals
 * @param {number} value
 * @returns {string}
 */
function formatPercentValue(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '–';
    }
    return Number(value).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Load TÜİK inflation values from backend (demo)
 */
async function loadTuikInflation() {
    if (!elements.tuikAnnual || !elements.tuikMonthly) return;

    try {
        const response = await fetch(`${API_BASE_URL}/enflasyon-tuik`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();
        const annual = data?.annual;
        const monthly = data?.monthly;

        elements.tuikAnnual.textContent = formatPercentValue(annual);
        elements.tuikMonthly.textContent = formatPercentValue(monthly);
    } catch (error) {
        console.error('❌ TÜİK enflasyon verisi yüklenemedi:', error);
        elements.tuikAnnual.textContent = '–';
        elements.tuikMonthly.textContent = '–';
    }
}

/**
 * Calculate average inflation based on input rows and update UI
 */
function handleInflationCalculation() {
    const rows = elements.inflationRows && elements.inflationRows.length
        ? elements.inflationRows
        : document.querySelectorAll('.inflation-calc-row');

    let previousSum = 0;
    let newSum = 0;
    let count = 0;

    rows.forEach((row) => {
        const prevInput = row.querySelector('.inflation-input-prev');
        const newInput = row.querySelector('.inflation-input-new');

        const prev = parseFloat(prevInput?.value);
        const next = parseFloat(newInput?.value);

        if (!isNaN(prev) && !isNaN(next)) {
            previousSum += prev;
            newSum += next;
            count += 1;
        }
    });

    if (elements.stockDecisionMessage) {
        elements.stockDecisionMessage.textContent = '';
        elements.stockDecisionMessage.classList.remove('decision-low', 'decision-medium', 'decision-high');
    }

    if (!elements.calcInflationValue) return;

    if (count === 0 || previousSum === 0) {
        elements.calcInflationValue.textContent = '-';
        if (elements.stockDecisionMessage) {
            elements.stockDecisionMessage.textContent = 'Lütfen en az bir ürün için önceki ve yeni fiyat giriniz.';
            elements.stockDecisionMessage.classList.add('decision-high');
        }
        return;
    }

    const averagePrevious = previousSum / count;
    const averageNew = newSum / count;

    if (averagePrevious === 0) {
        elements.calcInflationValue.textContent = '-';
        if (elements.stockDecisionMessage) {
            elements.stockDecisionMessage.textContent = 'Lütfen önceki fiyatı 0 olmayan en az bir ürün giriniz.';
            elements.stockDecisionMessage.classList.add('decision-high');
        }
        return;
    }

    const inflationRate = ((averageNew - averagePrevious) / averagePrevious) * 100;
    const formattedRate = formatPercentValue(inflationRate);
    elements.calcInflationValue.textContent = formattedRate;

    if (!elements.stockDecisionMessage) return;

    if (inflationRate <= 20) {
        elements.stockDecisionMessage.textContent = 'Enflasyon görece düşük. Kritik ürünlerde stok yapmak daha mantıklı olabilir.';
        elements.stockDecisionMessage.classList.add('decision-low');
    } else if (inflationRate > 20 && inflationRate <= 50) {
        elements.stockDecisionMessage.textContent = 'Enflasyon orta-yüksek seviyede. Stok kararlarında dikkatli olunmalı; hızlı dönen ürünlerde sınırlı stok tercih edilebilir.';
        elements.stockDecisionMessage.classList.add('decision-medium');
    } else {
        elements.stockDecisionMessage.textContent = 'Enflasyon çok yüksek. Yüksek miktarda stok tutmak önemli bir maliyet ve risk oluşturabilir.';
        elements.stockDecisionMessage.classList.add('decision-high');
    }
}

// ======================
// Event Listeners
// ======================

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Logo/title click handler - return to overview (home)
    if (elements.logoHomeBtn) {
        elements.logoHomeBtn.addEventListener('click', showOverviewSection);
    }

    // Analysis button click handler - show analysis section
    if (elements.runAnalysisBtn) {
        elements.runAnalysisBtn.addEventListener('click', runAnalysis);
    }

    // Inflation calculator button
    if (elements.calcInflationBtn) {
        elements.calcInflationBtn.addEventListener('click', handleInflationCalculation);
    }

    // Back to overview button click handler (from analysis section)
    if (elements.backToOverviewBtn) {
        elements.backToOverviewBtn.addEventListener('click', showOverviewSection);
    }

    // Back to overview button click handler (from products section)
    if (elements.backToOverviewFromProductsBtn) {
        elements.backToOverviewFromProductsBtn.addEventListener('click', showOverviewSection);
    }

    // "Ürün Analizleri" button click handler - show sales details page
    if (elements.btnProductAnalytics) {
        elements.btnProductAnalytics.addEventListener('click', () => showSalesDetailsSection());
    }

    // "Tüm Ürünler" button click handler - show products section
    if (elements.btnAllProducts) {
        elements.btnAllProducts.addEventListener('click', showProductsSection);
    }

    // Sales Details page - back to overview button
    if (elements.backToOverviewFromSalesDetailsBtn) {
        elements.backToOverviewFromSalesDetailsBtn.addEventListener('click', showOverviewSection);
    }

    // Sales Details page - month selector change handler
    if (elements.salesDetailsMonthSelect) {
        elements.salesDetailsMonthSelect.addEventListener('change', onSalesDetailsMonthChange);
    }

    // Decision Panel filter apply button
    const decisionPanelApplyBtn = document.getElementById('decision-panel-apply-btn');
    if (decisionPanelApplyBtn) {
        decisionPanelApplyBtn.addEventListener('click', async () => {
            const year = document.getElementById('decision-panel-year')?.value;
            const month = document.getElementById('decision-panel-month')?.value;
            
            if (!year || !month) {
                console.error('Year or month not selected');
                return;
            }
            
            // Month value is already a number (12, 11, etc.)
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            
            console.log(`📊 Decision Panel filter: Year ${yearNum}, Month ${monthNum}`);
            
            // Show loading state
            updateKPICards('—', '—', '—', '—', 'Uygun');
            
            try {
                const response = await fetch(`${API_BASE_URL}/kds/summary?year=${yearNum}&month=${monthNum}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    // Format currency for revenue
                    const formattedCiro = formatCurrencyTL(data.toplamAylikCiro);
                    
                    // Format sales count with thousand separators
                    const formattedAdet = data.satisAdedi.toLocaleString('tr-TR');
                    
                    // Format critical depots count
                    const formattedKritik = data.kritikDepoSayisi.toString();
                    
                    // Determine badge class and text based on decision
                    const badgeClass = data.kdsKarari === 'DIKKAT' ? 'decision-warning' : 'decision-safe';
                    const badgeText = data.kdsKarari === 'DIKKAT' ? 'Dikkat' : 'Uygun';
                    const statusText = badgeText; // Show the same text in status field
                    
                    // Update KPI cards
                    updateKPICards(formattedCiro, formattedAdet, formattedKritik, statusText, badgeText, badgeClass);
                } else {
                    throw new Error(data.error || 'Veri yüklenemedi');
                }
            } catch (error) {
                console.error('❌ Error loading KDS summary:', error);
                // Show error state (keep "—" values)
                updateKPICards('—', '—', '—', '—', 'Uygun');
            }
        });
    }

    // Chart mode toggle buttons
    if (elements.chartModeRevenue) {
        elements.chartModeRevenue.addEventListener('click', () => switchChartMode('revenue'));
    }
    if (elements.chartModeQuantity) {
        elements.chartModeQuantity.addEventListener('click', () => switchChartMode('quantity'));
    }

    // AI Advice buttons
    if (elements.btnGetAiAdvice) {
        elements.btnGetAiAdvice.addEventListener('click', getAiAdvice);
    }
    if (elements.btnRetryAiAdvice) {
        elements.btnRetryAiAdvice.addEventListener('click', getAiAdvice);
    }
    if (elements.btnRefreshAiAdvice) {
        elements.btnRefreshAiAdvice.addEventListener('click', getAiAdvice);
    }

    // "Yeni Ürün Ekle" button click handler - open modal
    if (elements.btnAddProduct) {
        elements.btnAddProduct.addEventListener('click', openAddProductModal);
    }

    // Modal close button
    if (elements.modalCloseBtn) {
        elements.modalCloseBtn.addEventListener('click', closeAddProductModal);
    }

    // Modal cancel button
    if (elements.modalCancelBtn) {
        elements.modalCancelBtn.addEventListener('click', closeAddProductModal);
    }

    // Modal backdrop click to close
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeAddProductModal);
    }

    // Category selection change handler
    if (elements.productCategorySelect) {
        elements.productCategorySelect.addEventListener('change', onCategoryChange);
    }
    
    // Stock preview update handlers
    if (elements.productAdetInput) {
        elements.productAdetInput.addEventListener('input', updateStockPreview);
    }
    if (elements.productHacimInput) {
        elements.productHacimInput.addEventListener('input', updateStockPreview);
    }
    if (elements.productLokasyonSelect) {
        elements.productLokasyonSelect.addEventListener('change', updateStockPreview);
    }

    // Add Product form submission
    if (elements.addProductForm) {
        elements.addProductForm.addEventListener('submit', handleAddProductSubmit);
    }

    // Toggle DB examples panel
    if (elements.btnToggleDbExamples) {
        elements.btnToggleDbExamples.addEventListener('click', toggleDbExamplesPanel);
    }

    // ======================
    // Edit Product Modal Event Listeners
    // ======================
    
    // Edit modal close button
    if (elements.editModalCloseBtn) {
        elements.editModalCloseBtn.addEventListener('click', closeEditProductModal);
    }
    
    // Edit modal cancel button
    if (elements.editModalCancelBtn) {
        elements.editModalCancelBtn.addEventListener('click', closeEditProductModal);
    }
    
    // Edit modal backdrop click
    if (elements.editModalBackdrop) {
        elements.editModalBackdrop.addEventListener('click', closeEditProductModal);
    }
    
    // Edit product form submission
    if (elements.editProductForm) {
        elements.editProductForm.addEventListener('submit', handleEditProductSubmit);
    }
    
    // Delete button in edit modal
    if (elements.editModalDeleteBtn) {
        elements.editModalDeleteBtn.addEventListener('click', openDeleteConfirmModal);
    }
    
    // ======================
    // Delete Confirmation Modal Event Listeners
    // ======================
    
    // Delete modal close button
    if (elements.deleteModalCloseBtn) {
        elements.deleteModalCloseBtn.addEventListener('click', closeDeleteConfirmModal);
    }
    
    // Delete modal cancel button
    if (elements.deleteModalCancelBtn) {
        elements.deleteModalCancelBtn.addEventListener('click', closeDeleteConfirmModal);
    }
    
    // Delete modal backdrop click
    if (elements.deleteModalBackdrop) {
        elements.deleteModalBackdrop.addEventListener('click', closeDeleteConfirmModal);
    }
    
    // Delete confirm button
    if (elements.deleteModalConfirmBtn) {
        elements.deleteModalConfirmBtn.addEventListener('click', handleDeleteProduct);
    }

    // Add keyboard shortcut (Ctrl+Enter to run analysis)
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            runAnalysis();
        }
        // Escape key to close modals
        if (event.key === 'Escape') {
            if (elements.deleteConfirmModal && !elements.deleteConfirmModal.classList.contains('hidden')) {
                closeDeleteConfirmModal();
            } else if (elements.editProductModal && !elements.editProductModal.classList.contains('hidden')) {
                closeEditProductModal();
            } else if (elements.addProductModal && !elements.addProductModal.classList.contains('hidden')) {
                closeAddProductModal();
            }
        }
    });
}

// ======================
// Suitability Weights Management
// ======================

const DEFAULT_WEIGHTS = {
    distance: 50,
    rent: 30,
    capacity: 20
};

const STORAGE_KEY = 'kds_suitability_weights';

/**
 * Get suitability weights from localStorage or return defaults
 * @returns {Object} {distance, rent, capacity} as percentages (50, 30, 20)
 */
function getSuitabilityWeights() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate structure and values
            if (parsed && 
                typeof parsed.distance === 'number' && 
                typeof parsed.rent === 'number' && 
                typeof parsed.capacity === 'number' &&
                parsed.distance >= 0 && parsed.distance <= 100 &&
                parsed.rent >= 0 && parsed.rent <= 100 &&
                parsed.capacity >= 0 && parsed.capacity <= 100) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn('Failed to parse suitability weights from localStorage:', error);
    }
    return { ...DEFAULT_WEIGHTS };
}

/**
 * Set suitability weights and save to localStorage
 * @param {Object} weights - {distance, rent, capacity} as percentages
 * @returns {Object} Normalized weights that sum to 100
 */
function setSuitabilityWeights(weights) {
    // Clamp values between 0 and 100
    let distance = Math.max(0, Math.min(100, weights.distance || 0));
    let rent = Math.max(0, Math.min(100, weights.rent || 0));
    let capacity = Math.max(0, Math.min(100, weights.capacity || 0));
    
    // Normalize to sum to 100
    const total = distance + rent + capacity;
    if (total > 0) {
        distance = Math.round((distance / total) * 100);
        rent = Math.round((rent / total) * 100);
        capacity = 100 - distance - rent; // Ensure exact sum
    } else {
        // If all zero, use defaults
        distance = DEFAULT_WEIGHTS.distance;
        rent = DEFAULT_WEIGHTS.rent;
        capacity = DEFAULT_WEIGHTS.capacity;
    }
    
    const normalized = { distance, rent, capacity };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
        console.error('Failed to save suitability weights to localStorage:', error);
    }
    
    return normalized;
}

/**
 * Update the tooltip text to reflect current weights
 */
function updateSuitabilityTooltip() {
    const tooltipEl = document.querySelector('#best-depots-help-icon .tooltip');
    if (!tooltipEl) return;
    
    const weights = getSuitabilityWeights();
    const distanceDec = (weights.distance / 100).toFixed(2);
    const rentDec = (weights.rent / 100).toFixed(2);
    const capacityDec = (weights.capacity / 100).toFixed(2);
    
    tooltipEl.innerHTML = `Uygunluk skoru; Mesafe, Aylık Kira ve Kapasite kriterlerinin 0–100 aralığına normalize edilip ağırlıklandırılmasıyla hesaplanır.<br><br>Ağırlıklar: Mesafe %${weights.distance}, Aylık Kira %${weights.rent}, Kapasite %${weights.capacity}.<br><br>Formül: Skor = (MesafeSkoru×${distanceDec}) + (KiraSkoru×${rentDec}) + (KapasiteSkoru×${capacityDec}).<br><br>Not: Yakın ve ucuz depolar daha yüksek puan alır; kapasite arttıkça puan artar.`;
}

// ======================
// Decision Panel Functions
// ======================

/**
 * Load and render best depots from API
 */
async function loadBestDepots() {
    const contentEl = document.getElementById('best-depots-content');
    const emptyEl = document.getElementById('best-depots-empty');
    
    let hasData = false;
    
    // Initially hide both content and empty state
    if (contentEl) contentEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    
    try {
        // Get current weights from localStorage
        const weights = getSuitabilityWeights();
        
        // Build query string with weights
        const params = new URLSearchParams({
            weightDistance: (weights.distance / 100).toString(),
            weightPrice: (weights.rent / 100).toString(),
            weightCapacity: (weights.capacity / 100).toString()
        });
        
        const response = await fetch(`${API_BASE_URL}/en-uygun-depolar?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            // Show top 3 depots
            const topDepots = data.data.slice(0, 3);
            renderBestDepots(topDepots);
            hasData = true;
        } else {
            hasData = false;
        }
    } catch (error) {
        console.error('❌ Error loading best depots:', error);
        hasData = false;
    } finally {
        // Update UI based on final state
        if (hasData) {
            // Data exists: show content
            if (contentEl) contentEl.classList.remove('hidden');
            if (emptyEl) emptyEl.classList.add('hidden');
        } else {
            // No data: show empty state
            if (contentEl) contentEl.classList.add('hidden');
            if (emptyEl) emptyEl.classList.remove('hidden');
        }
        
        // Refresh cost chart when depot data changes
        if (typeof initDepotCostChart === 'function') {
            initDepotCostChart();
        }
        
        // Refresh capacity scenario chart when depot data changes
        if (typeof initCapacityScenarioChart === 'function') {
            initCapacityScenarioChart();
        }
        
        // Equalize card heights after content is updated
        setTimeout(equalizeCardHeights, 50);
    }
}

/**
 * Render best depots list
 * @param {Array} depots - Array of depot objects from API
 */
function renderBestDepots(depots) {
    const contentEl = document.getElementById('best-depots-content');
    if (!contentEl) return;
    
    let html = '<div class="best-depots-list">';
    
    depots.forEach((depot, index) => {
        const rank = index + 1;
        const depoAdi = escapeHtml(depot.depo_adi);
        const distanceKm = depot.distance_km ? depot.distance_km.toFixed(2) : '—';
        const kapasiteDb = depot.kapasite_db ? formatDbValue(depot.kapasite_db) : '—';
        const aylikKira = depot.aylik_kira ? formatCurrencyTL(depot.aylik_kira) : '—';
        const score = depot.score ? depot.score.toFixed(2) : '—';
        
        html += `
            <div class="best-depot-item">
                <div class="depot-rank">${rank}</div>
                <div class="depot-details">
                    <div class="depot-name">${depoAdi}</div>
                    <div class="depot-metrics">
                        <span class="metric">
                            <span class="metric-label">Mesafe:</span>
                            <span class="metric-value">${distanceKm} km</span>
                        </span>
                        <span class="metric">
                            <span class="metric-label">Kapasite:</span>
                            <span class="metric-value">${kapasiteDb} DB</span>
                        </span>
                        <span class="metric">
                            <span class="metric-label">Kira:</span>
                            <span class="metric-value">${aylikKira} / ay</span>
                        </span>
                        <span class="metric">
                            <span class="metric-label">Uygunluk skoru:</span>
                            <span class="metric-value score-value">${score}/100</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    contentEl.innerHTML = html;
    
    // Equalize card heights after rendering
    equalizeCardHeights();
}

/**
 * Initialize Decision Panel charts with static demo data
 * TODO: Wire to actual API endpoints when available
 */
/**
 * Calculate forecast values based on average month-to-month growth rate
 * with damping and deterministic fluctuations for more realistic forecasts
 * @param {Array<number>} historicalData - Array of historical revenue values
 * @param {number} forecastMonths - Number of months to forecast
 * @returns {Array<number>} Array of forecast values
 */
function calculateRevenueForecast(historicalData, forecastMonths = 6) {
    if (historicalData.length < 2) {
        // Not enough data, return flat forecast
        const lastValue = historicalData[historicalData.length - 1] || 0;
        return Array(forecastMonths).fill(Math.max(0, lastValue));
    }
    
    // Calculate month-to-month change ratios
    const ratios = [];
    for (let i = 1; i < historicalData.length; i++) {
        const prev = historicalData[i - 1];
        const curr = historicalData[i];
        if (prev > 0) {
            ratios.push(curr / prev);
        }
    }
    
    // Calculate average ratio (geometric mean for multiplicative growth)
    const avgRatio = ratios.length > 0 
        ? Math.pow(ratios.reduce((a, b) => a * b, 1), 1 / ratios.length)
        : 1.0;
    
    // Convert ratio to growth rate (e.g., 1.05 = 5% growth, 0.95 = -5% decline)
    const avgGrowthRate = avgRatio - 1.0;
    
    // Deterministic fluctuation pattern (as percentages: 0.012 = +1.2%, -0.008 = -0.8%)
    const fluctuationPattern = [0.012, -0.008, 0.006, -0.010, 0.007, -0.005];
    
    // Generate forecast starting from last historical value
    const forecast = [];
    let lastValue = historicalData[historicalData.length - 1];
    
    for (let i = 0; i < forecastMonths; i++) {
        // Apply damping: reduce growth rate over time (0.85^(i-1) for month i)
        // Month 0: no damping, Month 1: 0.85, Month 2: 0.85^2, etc.
        const dampingFactor = i === 0 ? 1.0 : Math.pow(0.85, i - 1);
        const effectiveRate = avgGrowthRate * dampingFactor;
        
        // Add deterministic fluctuation (cycle through pattern)
        const fluctuation = fluctuationPattern[i % fluctuationPattern.length];
        let monthlyChangeRate = effectiveRate + fluctuation;
        
        // Clamp monthly change to between -5% and +5%
        monthlyChangeRate = Math.max(-0.05, Math.min(0.05, monthlyChangeRate));
        
        // Apply the change rate to get new value
        lastValue = lastValue * (1.0 + monthlyChangeRate);
        
        // Ensure non-negative
        forecast.push(Math.max(0, lastValue));
    }
    
    return forecast;
}

/**
 * Generate next 6 months labels starting from the month after the last historical month
 * @param {Array<string>} historicalLabels - Array of historical month labels
 * @returns {Array<string>} Array of next 6 month labels
 */
function generateForecastLabels(historicalLabels) {
    // Find the index of the last historical month in TURKISH_MONTHS
    const lastHistoricalMonth = historicalLabels[historicalLabels.length - 1];
    const lastMonthIndex = TURKISH_MONTHS.indexOf(lastHistoricalMonth);
    
    if (lastMonthIndex === -1) {
        // Fallback: if month not found, assume Kasım (November, index 10)
        const labels = [];
        let currentMonthIndex = 10; // Kasım
        
        for (let i = 0; i < 6; i++) {
            currentMonthIndex = (currentMonthIndex + 1) % 12;
            labels.push(TURKISH_MONTHS[currentMonthIndex]);
        }
        return labels;
    }
    
    // Generate next 6 months starting from the month after the last historical month
    const labels = [];
    let currentMonthIndex = (lastMonthIndex + 1) % 12;
    
    for (let i = 0; i < 6; i++) {
        labels.push(TURKISH_MONTHS[currentMonthIndex]);
        currentMonthIndex = (currentMonthIndex + 1) % 12;
    }
    
    return labels;
}

/**
 * Toggle revenue trend chart between real and forecast view
 */
function toggleRevenueTrendView() {
    if (!revenueTrendChartInstance) {
        return;
    }
    
    if (revenueTrendViewMode === 'real') {
        // Switch to forecast view
        const forecastData = calculateRevenueForecast(REVENUE_TREND_ORIGINAL_DATA, 6);
        const forecastLabels = generateForecastLabels(REVENUE_TREND_ORIGINAL_LABELS);
        
        // Update chart
        revenueTrendChartInstance.data.labels = forecastLabels;
        revenueTrendChartInstance.data.datasets[0].data = forecastData;
        revenueTrendChartInstance.data.datasets[0].borderDash = [6, 6];
        revenueTrendChartInstance.data.datasets[0].fill = false;
        revenueTrendChartInstance.data.datasets[0].label = 'Önümüzdeki 6 Ay Tahmini Ciro (₺)';
        
        revenueTrendChartInstance.update();
        
        // Update button text
        const toggleBtn = document.getElementById('revenue-trend-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = 'Son 6 Ay Ciro Trendi';
        }
        
        revenueTrendViewMode = 'forecast';
    } else {
        // Switch back to real view
        revenueTrendChartInstance.data.labels = REVENUE_TREND_ORIGINAL_LABELS;
        revenueTrendChartInstance.data.datasets[0].data = REVENUE_TREND_ORIGINAL_DATA;
        revenueTrendChartInstance.data.datasets[0].borderDash = [];
        revenueTrendChartInstance.data.datasets[0].fill = true;
        revenueTrendChartInstance.data.datasets[0].label = 'Aylık Ciro (₺)';
        
        revenueTrendChartInstance.update();
        
        // Update button text
        const toggleBtn = document.getElementById('revenue-trend-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = 'Önümüzdeki 6 Ay Tahmini Ciro Trendi';
        }
        
        revenueTrendViewMode = 'real';
    }
}

function initDecisionPanelCharts() {
    // Revenue Trend Chart (Line)
    const revenueTrendCanvas = document.getElementById('revenue-trend-chart');
    if (revenueTrendCanvas && typeof Chart !== 'undefined') {
        const ctx = revenueTrendCanvas.getContext('2d');
        
        revenueTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: REVENUE_TREND_ORIGINAL_LABELS,
                datasets: [{
                    label: 'Aylık Ciro (₺)',
                    data: REVENUE_TREND_ORIGINAL_DATA,
                    borderColor: '#13A865',
                    backgroundColor: 'rgba(19, 168, 101, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#13A865',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 37, 64, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                return formatCurrencyTL(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K ₺';
                                }
                                return value + ' ₺';
                            }
                        }
                    }
                }
            }
        });
        
        // Add toggle button event listener
        const toggleBtn = document.getElementById('revenue-trend-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleRevenueTrendView);
        }
    }
    
    // Load best depots (replaces warehouse comparison chart)
    loadBestDepots();
    
    // Equalize card heights after charts are initialized
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(equalizeCardHeights, 100);
    
    // Top Products by Space Chart (Horizontal Bar)
    const topProductsSpaceCanvas = document.getElementById('top-products-space-chart');
    if (topProductsSpaceCanvas && typeof Chart !== 'undefined') {
        const ctx = topProductsSpaceCanvas.getContext('2d');
        // Static demo data: Top 5 products by space consumption
        const productLabels = ['E27 Büyük Ampul', 'Uzatma Kablolu Priz', 'TV Kumandası', 'Musluk Bataryası', 'Dekoratif Armatür'];
        const productData = [45.2, 38.5, 28.3, 22.1, 18.7];
        
        topProductsSpaceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: productLabels.map(label => truncateLabel(label, 20)),
                datasets: [{
                    label: 'Toplam Alan (DB)',
                    data: productData,
                    backgroundColor: '#0F2038',
                    borderColor: '#1a3a5c',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 37, 64, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            title: function(context) {
                                return productLabels[context[0].dataIndex];
                            },
                            label: function(context) {
                                return `${context.parsed.x.toFixed(1)} DB`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + ' DB';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Capacity Forecast Chart (Line)
    const capacityForecastCanvas = document.getElementById('capacity-forecast-chart');
    if (capacityForecastCanvas && typeof Chart !== 'undefined') {
        const ctx = capacityForecastCanvas.getContext('2d');
        // Static demo data: 3-month capacity forecast
        const forecastLabels = ['Ocak 2026', 'Şubat 2026', 'Mart 2026'];
        const forecastData = [68, 72, 78];
        
        capacityForecastChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecastLabels,
                datasets: [{
                    label: 'Tahmini Doluluk (%)',
                    data: forecastData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 37, 64, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                return `Tahmini: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Initialize new cost and capacity charts
    initDepotCostChart();
    initCapacityScenarioChart();
}

// ======================
// Depot Cost & Capacity Charts
// ======================

// Chart instances for new charts
let depotCostChartInstance = null;
let capacityScenarioChartInstance = null;

// Constants for transportation cost calculation
// Formula: Fixed truck cost + (Distance × Fuel consumption × Fuel price)
// Assumptions:
// - Fixed truck cost per trip: 15,000 ₺ (covers driver, vehicle maintenance, etc.)
// - Average fuel consumption: 35 liters per 100 km
// - Fuel price: 53.08 ₺ per liter
// - Cost per km: (35 / 100) * 53.08 = 18.578 ₺
const TRANSPORT_FIXED_COST = 15000; // Fixed truck cost in Turkish Lira (₺)
const TRANSPORT_COST_PER_KM = (35 / 100) * 53.08; // Cost per kilometer: 18.578 ₺

/**
 * Prepare sorted and sliced depot cost data for chart
 * @param {Array} depots - Array of depot objects from API
 * @param {boolean} expanded - Whether to show all depots or just top 5
 * @returns {Object} { labels, rentData, transportData, totalData }
 */
function prepareDepotCostData(depots, expanded = false) {
    // Map depots to objects with calculated costs
    const depotCosts = depots.map(d => {
        const rent = d.aylik_kira || 0;
        const distance = d.distance_km || 0;
        const transport = TRANSPORT_FIXED_COST + (distance * TRANSPORT_COST_PER_KM);
        const total = rent + transport;
        
        return {
            name: d.depo_adi || 'Depo',
            rent: rent,
            transport: transport,
            total: total
        };
    });
    
    // Sort by total cost ascending
    depotCosts.sort((a, b) => a.total - b.total);
    
    // Slice to top 5 if not expanded
    const displayCount = expanded ? depotCosts.length : Math.min(5, depotCosts.length);
    const displayDepots = depotCosts.slice(0, displayCount);
    
    // Build arrays for chart
    const labels = displayDepots.map(d => {
        // Return only depot name (no total cost in label)
        return d.name;
    });
    const rentData = displayDepots.map(d => d.rent);
    const transportData = displayDepots.map(d => d.transport);
    const totalData = displayDepots.map(d => d.total);
    
    return {
        labels: labels,
        rentData: rentData,
        transportData: transportData,
        totalData: totalData,
        totalDepotCount: depotCosts.length
    };
}

/**
 * Initialize Depot Cost Chart (Grouped Bar Chart)
 * Shows monthly rent and transportation cost side-by-side for each depot
 */
async function initDepotCostChart() {
    const canvas = document.getElementById('depot-cost-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    // Initialize toggle state if not exists
    if (typeof window.__depotCostChartExpanded === 'undefined') {
        window.__depotCostChartExpanded = false;
    }
    
    try {
        // Fetch depot data from API
        const weights = getSuitabilityWeights();
        const params = new URLSearchParams({
            weightDistance: (weights.distance / 100).toString(),
            weightPrice: (weights.rent / 100).toString(),
            weightCapacity: (weights.capacity / 100).toString()
        });
        
        const response = await fetch(`${API_BASE_URL}/en-uygun-depolar?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Depo verileri alınamadı');
        }
        
        const data = await response.json();
        const depots = data.success && data.data ? data.data : [];
        
        // Prepare sorted and sliced chart data
        const chartData = prepareDepotCostData(depots, window.__depotCostChartExpanded);
        
        // Update toggle button visibility and setup event listener
        const toggleBtn = document.getElementById('depot-cost-toggle-btn');
        if (toggleBtn) {
            if (chartData.totalDepotCount <= 5) {
                toggleBtn.style.display = 'none';
            } else {
                toggleBtn.style.display = 'inline-block';
                toggleBtn.textContent = window.__depotCostChartExpanded ? 'Daha Az Göster' : 'Tüm Depoları Göster';
                
                // Setup toggle button click handler (only once)
                if (!toggleBtn.hasAttribute('data-listener-attached')) {
                    toggleBtn.setAttribute('data-listener-attached', 'true');
                    toggleBtn.addEventListener('click', function() {
                        // Toggle expanded state
                        window.__depotCostChartExpanded = !window.__depotCostChartExpanded;
                        // Re-render chart with new state
                        initDepotCostChart();
                    });
                }
            }
        }
        
        const ctx = canvas.getContext('2d');
        
        // Update existing chart or create new one
        if (depotCostChartInstance) {
            // Update existing chart data
            depotCostChartInstance.data.labels = chartData.labels;
            depotCostChartInstance.data.datasets[0].data = chartData.rentData;
            depotCostChartInstance.data.datasets[1].data = chartData.transportData;
            depotCostChartInstance.update();
            return;
        }
        
        // Create new chart instance (first time only)
        
        depotCostChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Aylık Kira',
                        data: chartData.rentData,
                        backgroundColor: '#0F2038',
                        borderColor: '#1a3a5c',
                        borderWidth: 2,
                        hidden: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Tahmini Ulaştırma Maliyeti',
                        data: chartData.transportData,
                        backgroundColor: '#f59e0b',
                        borderColor: '#d97706',
                        borderWidth: 2,
                        hidden: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        onClick: null, // Disable legend click toggling
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Outfit, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 37, 64, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            title: function(context) {
                                // Show only depot name (remove any "Toplam:" suffix if present)
                                const title = context[0].label || '';
                                // If label contains newline, take only first part (depot name)
                                const depotName = title.split('\n')[0];
                                return depotName;
                            },
                            afterTitle: function(context) {
                                // Calculate and show overall total as first line after title
                                const dataIndex = context[0].dataIndex;
                                const rentDataset = context[0].chart.data.datasets[0]; // Aylık Kira
                                const transportDataset = context[0].chart.data.datasets[1]; // Tahmini Ulaştırma Maliyeti
                                
                                const rent = rentDataset.data[dataIndex] || 0;
                                const transport = transportDataset.data[dataIndex] || 0;
                                const total = rent + transport;
                                
                                return `Toplam: ${formatCurrencyTL(total)}`;
                            },
                            label: function(context) {
                                const label = context.dataset.label || '';
                                // Skip if label contains "Toplam" (safety check for any helper datasets)
                                if (label.toLowerCase().includes('toplam')) {
                                    return null;
                                }
                                // Skip if dataset is marked as helper
                                if (context.dataset._isTotalHelper) {
                                    return null;
                                }
                                const value = context.parsed.y;
                                return `${label}: ${formatCurrencyTL(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false, // Explicitly set to false for grouped bars
                        ticks: {
                            font: {
                                size: 10
                            },
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        stacked: false, // Explicitly set to false for grouped bars
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K ₺';
                                }
                                return value + ' ₺';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Aylık Kira (₺)',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        stacked: false, // Explicitly set to false for grouped bars
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false // Prevent grid line overlap
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K ₺';
                                }
                                return value + ' ₺';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Tahmini Ulaştırma Maliyeti (₺)',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                },
                barPercentage: 0.9, // Make bars wider for better visibility
                categoryPercentage: 0.6 // Control spacing between categories
            }
        });
    } catch (error) {
        console.error('❌ Error initializing depot cost chart:', error);
        // Show placeholder data on error
        const ctx = canvas.getContext('2d');
        if (depotCostChartInstance) {
            depotCostChartInstance.destroy();
        }
        depotCostChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Veri yükleniyor...'],
                datasets: [{
                    label: 'Aylık Kira',
                    data: [0],
                    backgroundColor: '#0F2038'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

/**
 * Resolve depots for scenario chart from multiple sources
 * Priority: window.allDepotsData > window.filteredDepotsData > window.KDS?.depots > API fetch
 * @returns {Promise<Array>} Array of raw depot objects
 */
async function resolveDepotsForScenarioChart() {
    // Priority A: window.allDepotsData
    if (window.allDepotsData && Array.isArray(window.allDepotsData) && window.allDepotsData.length > 0) {
        return window.allDepotsData;
    }
    
    // Priority B: window.filteredDepotsData
    if (window.filteredDepotsData && Array.isArray(window.filteredDepotsData) && window.filteredDepotsData.length > 0) {
        return window.filteredDepotsData;
    }
    
    // Priority C: window.KDS?.depots
    if (window.KDS && window.KDS.depots && Array.isArray(window.KDS.depots) && window.KDS.depots.length > 0) {
        return window.KDS.depots;
    }
    
    // Priority D: Fetch from API
    try {
        const depotsResponse = await fetch(`${API_BASE_URL}/depolar-detay`);
        if (depotsResponse.ok) {
            const depotsData = await depotsResponse.json();
            // Accept multiple response formats
            if (depotsData.success) {
                if (Array.isArray(depotsData.depolar)) {
                    return depotsData.depolar;
                }
                if (Array.isArray(depotsData.depots)) {
                    return depotsData.depots;
                }
                if (Array.isArray(depotsData.data)) {
                    return depotsData.data;
                }
            }
            // If direct array
            if (Array.isArray(depotsData)) {
                return depotsData;
            }
        }
    } catch (depotError) {
        console.warn('⚠️ Could not fetch depot details for scenarios:', depotError);
    }
    
    return [];
}

/**
 * Normalize depot object to standard format
 * @param {Object} depot - Raw depot object
 * @returns {Object|null} Normalized depot or null if invalid
 */
function normalizeDepot(depot) {
    const name = depot.ad || depot.depo_adi || depot.name;
    if (!name) {
        return null; // Filter out invalid depots
    }
    
    return {
        name: name,
        capacityDb: Number(depot.kapasite_db || depot.kapasite || depot.capacityDb || 0),
        distanceKm: Number(depot.mesafe_km || depot.mesafe || depot.distance_km || depot.distanceKm || 0),
        suitability: Number(depot.uygunluk_skoru || depot.skor || depot.score || depot.suitability || 0),
        raw: depot // Keep original for reference
    };
}

/**
 * Initialize Capacity Scenario Chart (Bar Chart)
 * Shows capacity usage scenarios: Current, + En Yakın Depo, + En Uygun Depo, + En Büyük Kapasite
 */
async function initCapacityScenarioChart() {
    const canvas = document.getElementById('capacity-scenario-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    // Store instance in window for safe updates
    if (!window.capacityScenarioChart) {
        window.capacityScenarioChart = null;
    }
    
    const currentCapacityDb = 1875; // Main store capacity constant
    const forecastUsedDb = 1400; // Placeholder until real forecast is wired
    
    try {
        // Resolve depots from multiple sources
        const rawDepots = await resolveDepotsForScenarioChart();
        
        // Normalize and filter depots
        const normalizedDepots = rawDepots
            .map(normalizeDepot)
            .filter(d => d !== null); // Remove invalid depots
        
        const hasDepotData = normalizedDepots.length > 0;
        
        // Find specific depots for scenarios
        let enYakinDepo = null;
        let enUygunDepo = null;
        let enBuyukKapasite = null;
        
        if (hasDepotData) {
            // Scenario 1: "+ En Yakın Depo" (minimum distance, prefer distanceKm > 0)
            const depotsWithDistance = normalizedDepots.filter(d => d.distanceKm > 0);
            if (depotsWithDistance.length > 0) {
                enYakinDepo = depotsWithDistance.reduce((closest, depot) => {
                    return depot.distanceKm < closest.distanceKm ? depot : closest;
                });
            } else {
                // Fallback: use depot with minimum distance (even if 0)
                enYakinDepo = normalizedDepots.reduce((closest, depot) => {
                    return depot.distanceKm < closest.distanceKm ? depot : closest;
                });
            }
            
            // Scenario 2: "+ En Uygun Depo" (maximum suitability, fallback to first if all 0)
            const depotsWithSuitability = normalizedDepots.filter(d => d.suitability > 0);
            if (depotsWithSuitability.length > 0) {
                enUygunDepo = depotsWithSuitability.reduce((best, depot) => {
                    return depot.suitability > best.suitability ? depot : best;
                });
            } else {
                // Fallback: use first depot if all suitability scores are 0
                enUygunDepo = normalizedDepots[0];
            }
            
            // Scenario 3: "+ En Büyük Kapasite" (maximum capacity)
            enBuyukKapasite = normalizedDepots.reduce((largest, depot) => {
                return depot.capacityDb > largest.capacityDb ? depot : largest;
            });
        }
        
        // Build scenario data (always 4 scenarios if depots exist)
        const scenarioLabels = ['Mevcut Durum'];
        const totalCapacityData = [currentCapacityDb];
        const usedCapacityData = [forecastUsedDb];
        
        // Add scenarios if depots found
        if (hasDepotData) {
            if (enYakinDepo) {
                scenarioLabels.push('+ En Yakın Depo');
                totalCapacityData.push(currentCapacityDb + enYakinDepo.capacityDb);
                usedCapacityData.push(forecastUsedDb);
            }
            
            if (enUygunDepo) {
                scenarioLabels.push('+ En Uygun Depo');
                totalCapacityData.push(currentCapacityDb + enUygunDepo.capacityDb);
                usedCapacityData.push(forecastUsedDb);
            }
            
            if (enBuyukKapasite) {
                scenarioLabels.push('+ En Büyük Kapasite');
                totalCapacityData.push(currentCapacityDb + enBuyukKapasite.capacityDb);
                usedCapacityData.push(forecastUsedDb);
            }
        }
        
        const ctx = canvas.getContext('2d');
        
        // Update existing chart or create new one
        if (window.capacityScenarioChart) {
            // Update existing chart data
            window.capacityScenarioChart.data.labels = scenarioLabels;
            window.capacityScenarioChart.data.datasets[0].data = totalCapacityData;
            window.capacityScenarioChart.data.datasets[1].data = usedCapacityData;
            window.capacityScenarioChart.update();
            
            // Update error message visibility - hide if we have scenarios beyond "Mevcut Durum"
            const errorNote = document.getElementById('capacity-scenario-error-note');
            if (errorNote) {
                const hasScenarios = scenarioLabels.length > 1;
                errorNote.style.display = hasScenarios ? 'none' : 'block';
            }
            
            return;
        }
        
        // Create new chart instance
        window.capacityScenarioChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: scenarioLabels,
                datasets: [
                    {
                        label: 'Toplam Kapasite',
                        data: totalCapacityData,
                        backgroundColor: '#0F2038',
                        borderColor: '#1a3a5c',
                        borderWidth: 2
                    },
                    {
                        label: 'Tahmini Kullanım (3 Ay)',
                        data: usedCapacityData,
                        backgroundColor: '#f59e0b',
                        borderColor: '#d97706',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Outfit, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 37, 64, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${formatDbValue(value)} DB`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false, // Grouped bars
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        stacked: false, // Grouped bars
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatDbValue(value) + ' DB';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Kapasite (DB)',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                },
                barPercentage: 0.9,
                categoryPercentage: 0.6
            }
        });
        
        // Store in module variable for compatibility
        capacityScenarioChartInstance = window.capacityScenarioChart;
        
        // Show/hide error note - hide if we have scenarios beyond "Mevcut Durum"
        const errorNote = document.getElementById('capacity-scenario-error-note');
        if (errorNote) {
            const hasScenarios = scenarioLabels.length > 1;
            errorNote.style.display = hasScenarios ? 'none' : 'block';
        }
        
    } catch (error) {
        console.error('❌ Error initializing capacity scenario chart:', error);
        
        // Show fallback chart with just "Mevcut Durum"
        const ctx = canvas.getContext('2d');
        if (window.capacityScenarioChart) {
            window.capacityScenarioChart.destroy();
            window.capacityScenarioChart = null;
        }
        
        window.capacityScenarioChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mevcut Durum'],
                datasets: [
                    {
                        label: 'Toplam Kapasite',
                        data: [currentCapacityDb],
                        backgroundColor: '#0F2038',
                        borderColor: '#1a3a5c',
                        borderWidth: 2
                    },
                    {
                        label: 'Tahmini Kullanım (3 Ay)',
                        data: [1400], // Placeholder until real forecast is wired
                        backgroundColor: '#f59e0b',
                        borderColor: '#d97706',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        capacityScenarioChartInstance = window.capacityScenarioChart;
        
        // Show error note
        const errorNote = document.getElementById('capacity-scenario-error-note');
        if (errorNote) {
            errorNote.style.display = 'block';
        }
    }
}

// ======================
// Initialization
// ======================

/**
 * Initialize the application
 */
function init() {
    // Set up event listeners
    initEventListeners();
    
    // Load TÜİK inflation data
    loadTuikInflation();

    // Load store utilization on dashboard
    loadStoreUtilization();
    
    // Initialize Decision Panel charts with static demo data
    initDecisionPanelCharts();
    
    // Initialize suitability weights settings panel
    initSuitabilityWeightsPanel();
    
    // Update tooltip with current weights
    updateSuitabilityTooltip();
    
}

/**
 * Initialize suitability weights settings panel
 */
function initSuitabilityWeightsPanel() {
    const settingsBtn = document.getElementById('best-depots-weights-btn');
    const panel = document.getElementById('best-depots-weights-popover');
    const closeBtn = document.getElementById('weights-panel-close');
    const applyBtn = document.getElementById('weights-apply-btn');
    const resetBtn = document.getElementById('weights-reset-btn');
    const distanceInput = document.getElementById('weight-distance');
    const rentInput = document.getElementById('weight-rent');
    const capacityInput = document.getElementById('weight-capacity');
    const totalValue = document.getElementById('weights-total-value');
    const errorEl = document.getElementById('weights-error');
    
    // Check if essential elements exist
    if (!panel) {
        console.warn('Suitability weights panel not found in DOM');
        return;
    }
    
    if (!settingsBtn && !closeBtn && !applyBtn && !resetBtn) {
        console.warn('Suitability weights controls not found in DOM');
        return;
    }
    
    // Load current weights into inputs
    function loadWeightsToInputs() {
        const weights = getSuitabilityWeights();
        if (distanceInput) distanceInput.value = weights.distance;
        if (rentInput) rentInput.value = weights.rent;
        if (capacityInput) capacityInput.value = weights.capacity;
        updateTotalDisplay();
    }
    
    // Update total display
    function updateTotalDisplay() {
        const distance = parseFloat(distanceInput?.value || 0);
        const rent = parseFloat(rentInput?.value || 0);
        const capacity = parseFloat(capacityInput?.value || 0);
        const total = distance + rent + capacity;
        
        if (totalValue) {
            totalValue.textContent = total.toFixed(0);
            totalValue.style.color = Math.abs(total - 100) < 0.01 ? '' : 'var(--color-warning, #f59e0b)';
        }
        
        // Hide error if total is valid
        if (errorEl && Math.abs(total - 100) < 0.01) {
            errorEl.classList.add('hidden');
        }
    }
    
    // Auto-adjust other weights when one is changed
    function adjustWeights(changedInput) {
        const distance = parseFloat(distanceInput?.value || 0);
        const rent = parseFloat(rentInput?.value || 0);
        const capacity = parseFloat(capacityInput?.value || 0);
        const total = distance + rent + capacity;
        
        if (total === 0) return; // Avoid division by zero
        
        // Calculate what the other two should be to sum to 100
        const targetTotal = 100;
        const otherTotal = total - parseFloat(changedInput.value);
        
        if (otherTotal <= 0) {
            // If changed value is >= 100, set others to 0 and clamp changed
            if (changedInput === distanceInput) {
                distanceInput.value = Math.min(100, parseFloat(distanceInput.value));
                rentInput.value = 0;
                capacityInput.value = 0;
            } else if (changedInput === rentInput) {
                rentInput.value = Math.min(100, parseFloat(rentInput.value));
                distanceInput.value = 0;
                capacityInput.value = 0;
            } else {
                capacityInput.value = Math.min(100, parseFloat(capacityInput.value));
                distanceInput.value = 0;
                rentInput.value = 0;
            }
            updateTotalDisplay();
            return;
        }
        
        // Proportionally adjust the other two
        const ratio = (targetTotal - parseFloat(changedInput.value)) / otherTotal;
        
        if (changedInput === distanceInput) {
            rentInput.value = Math.max(0, Math.min(100, Math.round(rent * ratio)));
            capacityInput.value = targetTotal - parseFloat(distanceInput.value) - parseFloat(rentInput.value);
        } else if (changedInput === rentInput) {
            distanceInput.value = Math.max(0, Math.min(100, Math.round(distance * ratio)));
            capacityInput.value = targetTotal - parseFloat(rentInput.value) - parseFloat(distanceInput.value);
        } else {
            distanceInput.value = Math.max(0, Math.min(100, Math.round(distance * ratio)));
            rentInput.value = targetTotal - parseFloat(capacityInput.value) - parseFloat(distanceInput.value);
        }
        
        updateTotalDisplay();
    }
    
    // Function to open panel
    function openPanel() {
        loadWeightsToInputs();
        panel.classList.remove('hidden');
        // Focus first input for accessibility
        if (distanceInput) {
            setTimeout(() => distanceInput.focus(), 100);
        }
    }
    
    // Function to close panel
    function closePanel() {
        panel.classList.add('hidden');
        if (errorEl) errorEl.classList.add('hidden');
        // Return focus to settings button
        if (settingsBtn) {
            settingsBtn.focus();
        }
    }
    
    // Open panel - use event delegation if button doesn't exist yet
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openPanel();
        });
        
        // Keyboard support for settings button
        settingsBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPanel();
            }
        });
    } else {
        // Use event delegation as fallback
        document.addEventListener('click', function(e) {
            const target = e.target.closest('#best-depots-weights-btn');
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                openPanel();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            const target = document.getElementById('best-depots-weights-btn');
            if (target && document.activeElement === target && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                openPanel();
            }
        });
    }
    
    // Close panel handlers
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closePanel();
        });
    }
    
    // Close on backdrop click (clicking on panel background)
    panel.addEventListener('click', function(e) {
        if (e.target === panel) {
            closePanel();
        }
    });
    
    // Close on Escape key
    let escapeHandler = function(e) {
        if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
            closePanel();
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Close when clicking outside the panel
    // Use capture phase to check before other handlers
    document.addEventListener('click', function(e) {
        // Only handle if panel is open
        if (panel.classList.contains('hidden')) {
            return;
        }
        
        // Check if click is on the settings button (will be handled by open handler)
        if (e.target.closest('#best-depots-weights-btn')) {
            return;
        }
        
        // Check if click is inside the panel
        if (e.target.closest('#best-depots-weights-popover')) {
            return;
        }
        
        // Click is outside, close the panel
        closePanel();
    }, true);
    
    // Input change handlers
    [distanceInput, rentInput, capacityInput].forEach(input => {
        if (!input) return;
        
        input.addEventListener('input', function() {
            // Clamp value
            let value = parseFloat(this.value || 0);
            value = Math.max(0, Math.min(100, value));
            this.value = value;
            
            adjustWeights(this);
        });
        
        input.addEventListener('blur', function() {
            // Ensure value is valid on blur
            let value = parseFloat(this.value || 0);
            value = Math.max(0, Math.min(100, value));
            this.value = value;
            updateTotalDisplay();
        });
    });
    
    // Apply button
    applyBtn.addEventListener('click', function() {
        const distance = parseFloat(distanceInput?.value || 0);
        const rent = parseFloat(rentInput?.value || 0);
        const capacity = parseFloat(capacityInput?.value || 0);
        const total = distance + rent + capacity;
        
        if (Math.abs(total - 100) > 0.01) {
            if (errorEl) {
                errorEl.textContent = 'Toplam %100 olmalıdır. Lütfen değerleri ayarlayın.';
                errorEl.classList.remove('hidden');
            }
            return;
        }
        
        // Validate all are non-negative
        if (distance < 0 || rent < 0 || capacity < 0) {
            if (errorEl) {
                errorEl.textContent = 'Tüm değerler 0 veya pozitif olmalıdır.';
                errorEl.classList.remove('hidden');
            }
            return;
        }
        
        // Save weights
        const normalized = setSuitabilityWeights({ distance, rent, capacity });
        
        // Update tooltip
        updateSuitabilityTooltip();
        
        // Reload depots with new weights
        loadBestDepots();
        
        // Close panel
        closePanel();
    });
    
    // Reset button
    resetBtn.addEventListener('click', function() {
        // Reset to defaults
        setSuitabilityWeights(DEFAULT_WEIGHTS);
        loadWeightsToInputs();
        
        // Update tooltip
        updateSuitabilityTooltip();
        
        // Reload depots with default weights
        loadBestDepots();
    });
    
    // Initial load
    loadWeightsToInputs();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// ======================
// Card Height Equalization
// ======================

/**
 * Equalize heights of revenue trend card and best depots card
 * Makes the left chart card match the right card's height
 */
function equalizeCardHeights() {
    const revenueCard = document.getElementById('revenueTrendCard');
    const depotsCard = document.getElementById('bestDepotsCard');
    const chartWrap = document.getElementById('revenueTrendChartWrap');
    
    if (!revenueCard || !depotsCard || !chartWrap) {
        return; // Elements not found, exit early
    }
    
    // Get the height of the right card (best depots)
    const depotsCardHeight = depotsCard.getBoundingClientRect().height;
    
    if (depotsCardHeight <= 0) {
        return; // Card not visible yet, skip
    }
    
    // Set the left card to match the right card's height
    revenueCard.style.height = depotsCardHeight + 'px';
    
    // Calculate available height for chart container
    // Get header height
    const cardHeader = revenueCard.querySelector('.card-header');
    const cardBody = revenueCard.querySelector('.card-body');
    
    if (!cardHeader || !cardBody) {
        return;
    }
    
    const headerHeight = cardHeader.getBoundingClientRect().height;
    const bodyPadding = parseFloat(getComputedStyle(cardBody).paddingTop) + 
                        parseFloat(getComputedStyle(cardBody).paddingBottom);
    
    // Calculate chart container height: total card height - header - body padding
    const chartHeight = depotsCardHeight - headerHeight - bodyPadding;
    
    // Ensure minimum height to prevent issues
    if (chartHeight > 50) {
        chartWrap.style.height = chartHeight + 'px';
        
        // Resize Chart.js instance if it exists
        if (revenueTrendChartInstance && typeof revenueTrendChartInstance.resize === 'function') {
            revenueTrendChartInstance.resize();
        }
    }
}

/**
 * Debounced resize handler for window resize events
 */
let resizeTimeout = null;
function handleResize() {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
        equalizeCardHeights();
    }, 100);
}

// Add resize listener
window.addEventListener('resize', handleResize);

// ======================
// KPI Cards Update Function
// ======================

/**
 * Update KPI cards with summary data
 * @param {string} revenue - Formatted revenue string
 * @param {string} salesCount - Formatted sales count string
 * @param {string} criticalDepots - Critical depots count string
 * @param {string} decisionStatus - Decision status ("UYGUN" or "DIKKAT")
 * @param {string} badgeText - Badge text ("Uygun" or "Dikkat")
 * @param {string} badgeClass - Badge CSS class ("decision-safe" or "decision-warning")
 */
function updateKPICards(revenue, salesCount, criticalDepots, decisionStatus, badgeText, badgeClass = 'decision-safe') {
    // Update revenue card
    const revenueEl = document.getElementById('kpi-monthly-revenue');
    if (revenueEl) {
        revenueEl.textContent = revenue;
    }
    
    // Update sales count card
    const salesCountEl = document.getElementById('kpi-sales-count');
    if (salesCountEl) {
        salesCountEl.textContent = salesCount;
    }
    
    // Update critical warehouses card
    const criticalEl = document.getElementById('kpi-critical-warehouses');
    if (criticalEl) {
        criticalEl.textContent = criticalDepots;
    }
    
    // Update decision status and badge
    const decisionStatusEl = document.getElementById('kpi-decision-status');
    const decisionBadgeEl = document.getElementById('kpi-decision-badge');
    
    if (decisionStatusEl) {
        decisionStatusEl.textContent = decisionStatus;
    }
    
    if (decisionBadgeEl) {
        decisionBadgeEl.textContent = badgeText;
        // Remove existing badge classes
        decisionBadgeEl.classList.remove('decision-safe', 'decision-warning', 'decision-danger');
        // Add new badge class
        decisionBadgeEl.classList.add(badgeClass);
    }
}

// ======================
// Export for testing (if needed)
// ======================

// Make functions available globally for debugging
window.KDS = {
    runAnalysis,
    showOverviewSection,
    showAnalysisSection,
    showProductsSection,
    showSalesDetailsSection,
    loadProducts,
    loadCategories,
    openAddProductModal,
    closeAddProductModal,
    openEditProductModal,
    closeEditProductModal,
    openDeleteConfirmModal,
    closeDeleteConfirmModal,
    formatNumber,
    formatCurrency,
    formatCurrencyTL,
    formatDbValue,
    getLast6Months,
    loadSalesDetailsChart,
    renderSalesRevenueChart,
    switchChartMode,
    loadSalesInsights,
    loadStoreUtilization
};

// Make openEditProductModal available globally for onclick handlers
window.openEditProductModal = openEditProductModal;

