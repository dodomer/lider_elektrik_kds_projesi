/**
 * Lider Elektrik - Karar Destek Sistemi (KDS)
 * API Routes
 * 
 * This module contains all API endpoints for the Decision Support System.
 * Currently implements basic health check; more endpoints will be added later.
 */

const express = require('express');
const router = express.Router();


// Database module
const db = require('../db');

// OpenAI client
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Store capacity configuration (75 m² * 25 DB/m²)
const MAIN_STORE_CAPACITY_DB = 1875;

// TÜİK inflation demo endpoint
router.get('/enflasyon-tuik', (req, res) => {
    res.json({
        source: 'TÜİK (demo veri)',
        annual: 68.5,
        monthly: 3.2
    });
});

// ======================
// Health Check Endpoint
// ======================

/**
 * GET /api/health
 * Returns system health status
 * Used to verify the API is running correctly
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        message: 'Lider Elektrik KDS API çalışıyor',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * GET /api/analytics/revenue-trend
 * Returns monthly revenue trend for the last N months (default 6)
 * Params: months (1-12)
 */
router.get('/analytics/revenue-trend', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let months = parseInt(req.query.months || '6', 10);
        if (isNaN(months) || months < 1) months = 6;
        if (months > 12) months = 12;

        const sql = `
            SELECT 
                DATE_FORMAT(tarih, '%Y-%m') AS ym,
                SUM(adet * birim_fiyat) AS revenue
            FROM satislar
            WHERE tarih >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
            GROUP BY ym
            ORDER BY ym
        `;

        const rows = await db.query(sql, [months]);

        const data = rows.map(r => ({
            ym: r.ym,
            revenue: parseFloat(r.revenue || 0)
        }));

        console.log(`📈 /api/analytics/revenue-trend - months: ${months}, rows: ${data.length}`);

        return res.json({
            success: true,
            months,
            data
        });
    } catch (error) {
        console.error('❌ Error fetching revenue trend:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Satış trendi verileri alınırken bir hata oluştu.',
            message: error.message
        });
    }
});

// ======================
// Placeholder Endpoints (To be implemented in Phase 2+)
// ======================

/**
 * GET /api/store/utilization
 * Returns current store utilization percentage
 * Calculates actual utilization from stoklar, urunler, and lokasyonlar tables
 */
router.get('/store/utilization', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Get total stock volume (sum of stock quantity * product hacim_db) for the main store (lokasyon_id = 1)
        const stockSql = `
            SELECT COALESCE(SUM(s.miktar * u.hacim_db), 0) AS total_used_db
            FROM stoklar s
            INNER JOIN urunler u ON s.urun_id = u.urun_id
            WHERE s.lokasyon_id = 1 AND u.aktif_mi = 1
        `;

        const [stockResult] = await Promise.all([
            db.query(stockSql)
        ]);

        const usedDB = parseFloat(stockResult[0]?.total_used_db || 0);
        const capacityDB = MAIN_STORE_CAPACITY_DB;

        const freeDB = Math.max(0, capacityDB - usedDB);
        const utilizationPercent = capacityDB > 0 ? Math.round((usedDB / capacityDB) * 100) : 0;
        
        console.log(`🏪 /api/store/utilization - Used: ${usedDB.toFixed(2)} DB, Capacity: ${capacityDB} DB, Utilization: ${utilizationPercent}%`);
        
        return res.json({
            success: true,
            data: {
                usedDB: parseFloat(usedDB.toFixed(2)),
                capacityDB: capacityDB,
                freeDB: parseFloat(freeDB.toFixed(2)),
                utilizationPercent: utilizationPercent,
                unit: 'DB'
            }
        });
    } catch (error) {
        console.error('❌ Error fetching store utilization:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Mağaza doluluk bilgisi yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * GET /api/depots
 * Returns list of depots with coordinates
 */
router.get('/depots', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const sql = `
            SELECT 
                lokasyon_id AS id,
                ad          AS name,
                enlem       AS latitude,
                boylam      AS longitude,
                tur,
                adres
            FROM lokasyonlar
            WHERE tur = 'depo'
        `;
        const depots = await db.query(sql);
        return res.json(depots);
    } catch (error) {
        console.error('❌ Error fetching depots:', error.message);
        return res.status(500).json({
            error: 'Depo verileri alınırken bir hata oluştu.'
        });
    }
});

/**
 * GET /api/sales-details
 * Returns top 10 products by revenue for a specific month
 * Query params: month (YYYY-MM format, defaults to current month)
 * Returns products sorted by total revenue (toplam_tutar) descending
 */
router.get('/sales-details', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Get month parameter or default to current month
        let month = req.query.month;
        
        if (!month) {
            const now = new Date();
            month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        
        console.log(`📈 /api/sales-details - Requested month: ${month}`);
        
        // Validate month format (YYYY-MM)
        const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (!monthRegex.test(month)) {
            return res.status(400).json({
                success: false,
                error: 'Geçersiz ay formatı. YYYY-MM formatında olmalıdır.'
            });
        }
        
        // Parse year and month for date range calculation
        const [year, monthNum] = month.split('-');
        const yearInt = parseInt(year);
        const monthInt = parseInt(monthNum);
        
        // Calculate start and end dates for the month
        const startDate = `${year}-${monthNum}-01 00:00:00`;
        const lastDay = new Date(yearInt, monthInt, 0).getDate();
        const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')} 23:59:59`;
        
        console.log(`📅 Date range: ${startDate} to ${endDate}`);
        
        // Aggregate sales per product for the month (include products with zero sales)
        const salesSql = `
            SELECT 
                u.urun_id,
                u.ad AS urun_adi,
                COALESCE(SUM(s.adet), 0) AS toplam_adet,
                COALESCE(SUM(s.toplam_tutar), 0) AS toplam_tutar
            FROM urunler u
            LEFT JOIN satislar s 
                ON s.urun_id = u.urun_id
                AND s.tarih BETWEEN ? AND ?
                AND s.lokasyon_id = 1
            WHERE u.aktif_mi = 1
            GROUP BY u.urun_id, u.ad
        `;

        const rows = await db.query(salesSql, [startDate, endDate]);

        const normalized = rows.map(row => ({
            urun_id: row.urun_id,
            urun_adi: row.urun_adi,
            toplam_adet: parseInt(row.toplam_adet || 0, 10),
            toplam_tutar: parseFloat(row.toplam_tutar || 0)
        }));

        // Build union of top 10 by revenue and top 10 by quantity
        const topRevenue = [...normalized].sort((a, b) => b.toplam_tutar - a.toplam_tutar).slice(0, 10);
        const topQuantity = [...normalized].sort((a, b) => b.toplam_adet - a.toplam_adet).slice(0, 10);

        const combinedMap = new Map();
        [...topRevenue, ...topQuantity].forEach(item => {
            combinedMap.set(item.urun_id, item);
        });

        let combined = Array.from(combinedMap.values());

        // If still fewer than 10, pad with other active products (zero sales included)
        if (combined.length < 10) {
            const filler = normalized
                .filter(item => !combinedMap.has(item.urun_id))
                .sort((a, b) => b.toplam_tutar - a.toplam_tutar)
                .slice(0, 10 - combined.length);
            filler.forEach(item => combinedMap.set(item.urun_id, item));
            combined = Array.from(combinedMap.values());
        }

        // Sort by revenue for a stable response; frontend will re-sort per mode
        combined.sort((a, b) => b.toplam_tutar - a.toplam_tutar);

        console.log(`✅ /api/sales-details - Month: ${month}, Returning ${combined.length} products (union of top revenue & quantity)`);
        
        return res.json({
            success: true,
            month: month,
            items: combined
        });
    } catch (error) {
        console.error('❌ Error fetching sales details:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            success: false,
            error: 'Satış detayları yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * GET /api/sales-trends
 * Returns 6-month sales trend data for all products
 * Used for generating sales insights and trend analysis
 */
router.get('/sales-trends', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Calculate last 6 months
        const months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            months.push(`${year}-${month}`);
        }
        
        console.log(`📈 /api/sales-trends - Analyzing months: ${months.join(', ')}`);
        
        // Get sales data for each month for each product
        // Using a query that groups by product and month
        const sql = `
            SELECT 
                u.urun_id,
                u.ad AS urun_adi,
                DATE_FORMAT(s.tarih, '%Y-%m') AS month,
                SUM(s.adet) AS toplam_adet,
                SUM(s.toplam_tutar) AS toplam_tutar
            FROM satislar s
            INNER JOIN urunler u ON s.urun_id = u.urun_id
            WHERE s.tarih >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                AND s.lokasyon_id = 1
            GROUP BY u.urun_id, u.ad, DATE_FORMAT(s.tarih, '%Y-%m')
            ORDER BY u.ad, month
        `;
        
        const results = await db.query(sql);
        
        // Transform results into the required format
        const productsMap = new Map();
        
        results.forEach(row => {
            if (!productsMap.has(row.urun_id)) {
                productsMap.set(row.urun_id, {
                    urun_id: row.urun_id,
                    urun_adi: row.urun_adi,
                    monthly: {}
                });
            }
            productsMap.get(row.urun_id).monthly[row.month] = {
                adet: parseInt(row.toplam_adet),
                tutar: parseFloat(row.toplam_tutar)
            };
        });
        
        // Convert to array and fill missing months with zeros
        const products = Array.from(productsMap.values()).map(product => {
            const monthlyData = months.map(month => ({
                adet: product.monthly[month]?.adet || 0,
                tutar: product.monthly[month]?.tutar || 0
            }));
            
            return {
                urun_id: product.urun_id,
                urun_adi: product.urun_adi,
                monthly: monthlyData
            };
        });
        
        // Filter out products with no sales at all in the period
        const activeProducts = products.filter(p => 
            p.monthly.some(m => m.adet > 0)
        );
        
        console.log(`✅ /api/sales-trends - Found ${activeProducts.length} products with sales data`);
        
        return res.json({
            success: true,
            months: months,
            products: activeProducts
        });
    } catch (error) {
        console.error('❌ Error fetching sales trends:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            success: false,
            error: 'Satış trendi verileri yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * GET /api/top-products
 * Returns top selling products for a specific month
 * Query params: month (YYYY-MM format, defaults to current month)
 * Returns products sorted by monthly sales descending
 */
router.get('/top-products', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Get month parameter or default to current month
        let month = req.query.month;
        
        if (!month) {
            const now = new Date();
            month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        
        console.log(`📊 /api/top-products - Requested month: ${month}`);
        
        // Validate month format (YYYY-MM)
        const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (!monthRegex.test(month)) {
            return res.status(400).json({
                success: false,
                error: 'Geçersiz ay formatı. YYYY-MM formatında olmalıdır.'
            });
        }
        
        // Parse year and month for date range calculation
        const [year, monthNum] = month.split('-');
        const yearInt = parseInt(year);
        const monthInt = parseInt(monthNum);
        
        // Calculate start and end dates for the month
        // startDate = first day of month at 00:00:00
        // endDate = last day of month at 23:59:59
        const startDate = `${year}-${monthNum}-01 00:00:00`;
        
        // Get last day of month: create date for first day of next month, then subtract 1 day
        const lastDay = new Date(yearInt, monthInt, 0).getDate();
        const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')} 23:59:59`;
        
        console.log(`📅 Date range: ${startDate} to ${endDate}`);
        
        // Query to get top selling products for the specified month
        // Joins satislar with urunler and kategoriler
        // Sums up sales quantity (adet) for the month
        // Also gets current stock from stoklar table (for lokasyon_id = 1, the main store)
        const sql = `
            SELECT 
                u.urun_id,
                u.ad AS name,
                k.kategori_ad AS category,
                COALESCE(SUM(s.adet), 0) AS monthlySales,
                COALESCE((
                    SELECT st.miktar 
                    FROM stoklar st 
                    WHERE st.urun_id = u.urun_id AND st.lokasyon_id = 1
                    LIMIT 1
                ), 0) AS stock
            FROM urunler u
            LEFT JOIN kategoriler k ON u.kategori_id = k.kategori_id
            LEFT JOIN satislar s ON u.urun_id = s.urun_id 
                AND s.tarih BETWEEN ? AND ?
                AND s.lokasyon_id = 1
            WHERE u.aktif_mi = 1
            GROUP BY u.urun_id, u.ad, k.kategori_ad
            HAVING monthlySales > 0
            ORDER BY monthlySales DESC
            LIMIT 10
        `;
        
        const products = await db.query(sql, [startDate, endDate]);
        
        console.log(`✅ /api/top-products - Month: ${month}, Found ${products.length} products`);
        
        return res.json({
            success: true,
            month: month,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('❌ Error fetching top products:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            success: false,
            error: 'En çok satan ürünler yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * GET /api/products/top-selling (Legacy - kept for backward compatibility)
 * Returns top selling products
 * TODO: Implement actual database query with sales data
 */
router.get('/products/top-selling', (req, res) => {
    // Placeholder response - will query satislar and urunler tables
    res.json({
        success: true,
        data: [
            { id: 1, name: 'LED Ampul 9W', category: 'Aydınlatma', monthlySales: 245, stock: 120, status: 'demo' },
            { id: 2, name: 'TV Kumandası Universal', category: 'Kumandalar', monthlySales: 189, stock: 45, status: 'demo' },
            { id: 3, name: 'Üçlü Priz', category: 'Prizler', monthlySales: 156, stock: 89, status: 'demo' },
            { id: 4, name: '2.5mm Kablo (100m)', category: 'Kablolar', monthlySales: 134, stock: 23, status: 'demo' },
            { id: 5, name: 'Sıva Altı Anahtar', category: 'Anahtarlar', monthlySales: 98, stock: 156, status: 'demo' }
        ]
    });
});

/**
 * POST /api/analysis/run
 * Runs the depot decision analysis
 * TODO: Implement actual KDS analysis logic
 */
router.post('/analysis/run', (req, res) => {
    // Placeholder response - will implement full analysis in Phase 3
    res.json({
        success: true,
        message: 'Analiz tamamlandı (Demo)',
        data: {
            depotNeeded: null,
            recommendedDepot: null,
            confidence: 0,
            reasoning: 'Henüz gerçek analiz uygulanmadı. Bu demo yanıttır.',
            timestamp: new Date().toISOString(),
            status: 'demo'
        }
    });
});

/**
 * GET /api/analysis/latest
 * Returns the latest analysis result
 * TODO: Query kds_analiz_log table for most recent entry
 */
router.get('/analysis/latest', (req, res) => {
    // Placeholder response - will query kds_analiz_log table
    res.json({
        success: true,
        data: {
            id: null,
            depotNeeded: null,
            recommendedDepot: null,
            analysisDate: null,
            status: 'no_analysis',
            message: 'Henüz analiz yapılmadı'
        }
    });
});

// ======================
// Categories Endpoints
// ======================

/**
 * GET /api/kategoriler
 * Returns all categories from the database
 */
router.get('/kategoriler', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const sql = `
            SELECT kategori_id, kategori_ad
            FROM kategoriler
            ORDER BY kategori_ad ASC
        `;
        
        const categories = await db.query(sql);
        const normalized = categories.map(row => ({
            id: row.kategori_id,
            name: row.kategori_ad,
            kategori_id: row.kategori_id,
            kategori_ad: row.kategori_ad
        }));
        
        console.log(`📂 /api/kategoriler - Returning ${categories.length} categories`);
        
        return res.json({
            success: true,
            count: categories.length,
            data: normalized
        });
    } catch (error) {
        console.error('❌ Error fetching categories:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Kategoriler yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

// ======================
// Products Endpoints
// ======================

/**
 * GET /api/urunler
 * Returns all active products with their category names
 * Queries urunler table joined with kategoriler
 */
router.get('/urunler', async (req, res) => {
    // Explicitly set JSON content type
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const sql = `
            SELECT 
                u.urun_id,
                u.ad,
                k.kategori_ad AS kategori_ad,
                u.birim_fiyat,
                u.hacim_db
            FROM urunler u
            LEFT JOIN kategoriler k ON u.kategori_id = k.kategori_id
            WHERE u.aktif_mi = 1
            ORDER BY u.ad ASC
        `;
        
        const products = await db.query(sql);
        
        console.log(`📦 /api/urunler - Returning ${products.length} products`);
        
        return res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Ürünler yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * POST /api/urunler
 * Creates a new product in the database
 * Required fields: ad, kategori_id, birim_fiyat, hacim_db
 */
router.post('/urunler', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { ad, kategori_id, birim_fiyat, hacim_db } = req.body;
        
        // Validate required fields
        if (!ad || ad.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Ürün adı zorunludur.'
            });
        }
        
        if (!kategori_id) {
            return res.status(400).json({
                success: false,
                error: 'Kategori seçimi zorunludur.'
            });
        }
        
        if (birim_fiyat === undefined || birim_fiyat === null || birim_fiyat < 0) {
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir birim fiyat girilmelidir.'
            });
        }
        
        if (hacim_db === undefined || hacim_db === null || hacim_db < 0) {
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir depo birimi (hacim) girilmelidir.'
            });
        }
        
        // Insert new product
        const sql = `
            INSERT INTO urunler (ad, kategori_id, birim_fiyat, hacim_db, kritik_stok, aktif_mi)
            VALUES (?, ?, ?, ?, 0, 1)
        `;
        
        const result = await db.query(sql, [ad.trim(), kategori_id, birim_fiyat, hacim_db]);
        
        console.log(`✅ /api/urunler POST - Created product: ${ad} (ID: ${result.insertId})`);
        
        return res.status(201).json({
            success: true,
            message: 'Ürün başarıyla eklendi.',
            data: {
                urun_id: result.insertId,
                ad: ad.trim(),
                kategori_id: kategori_id,
                birim_fiyat: birim_fiyat,
                hacim_db: hacim_db
            }
        });
    } catch (error) {
        console.error('❌ Error creating product:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Ürün eklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * PUT /api/urunler/:id
 * Updates an existing product in the database
 * Required fields: ad, kategori_id, birim_fiyat, hacim_db
 */
router.put('/urunler/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const { id } = req.params;
    const { ad, kategori_id, birim_fiyat, hacim_db } = req.body;
    
    try {
        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                error: 'Geçersiz ürün ID.'
            });
        }
        
        // Validate required fields
        if (!ad || ad.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Ürün adı zorunludur.'
            });
        }
        
        if (!kategori_id) {
            return res.status(400).json({
                success: false,
                error: 'Kategori seçimi zorunludur.'
            });
        }
        
        if (birim_fiyat === undefined || birim_fiyat === null || birim_fiyat < 0) {
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir birim fiyat girilmelidir.'
            });
        }
        
        if (hacim_db === undefined || hacim_db === null || hacim_db < 0) {
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir depo birimi (hacim) girilmelidir.'
            });
        }
        
        // Check if product exists
        const checkSql = 'SELECT urun_id FROM urunler WHERE urun_id = ? AND aktif_mi = 1';
        const existing = await db.query(checkSql, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ürün bulunamadı.'
            });
        }
        
        // Update product
        const updateSql = `
            UPDATE urunler 
            SET ad = ?, kategori_id = ?, birim_fiyat = ?, hacim_db = ?
            WHERE urun_id = ?
        `;
        
        await db.query(updateSql, [ad.trim(), kategori_id, birim_fiyat, hacim_db, id]);
        
        console.log(`✅ /api/urunler PUT - Updated product ID: ${id}`);
        
        return res.json({
            success: true,
            message: 'Ürün başarıyla güncellendi.',
            data: {
                urun_id: parseInt(id),
                ad: ad.trim(),
                kategori_id: kategori_id,
                birim_fiyat: birim_fiyat,
                hacim_db: hacim_db
            }
        });
    } catch (error) {
        console.error('❌ Error updating product:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Ürün güncellenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * DELETE /api/urunler/:id
 * Hard deletes a product (removes the row from the database)
 */
router.delete('/urunler/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const { id } = req.params;
    
    try {
        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                error: 'Geçersiz ürün ID.'
            });
        }
        
        // Check if product exists and get its name for logging
        const checkSql = 'SELECT urun_id, ad FROM urunler WHERE urun_id = ?';
        const existing = await db.query(checkSql, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ürün bulunamadı.'
            });
        }
        
        const productName = existing[0].ad;
        
        // Hard delete - remove the row from database
        const deleteSql = 'DELETE FROM urunler WHERE urun_id = ?';
        const result = await db.query(deleteSql, [id]);
        
        // Check if any row was actually deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ürün silinemedi.'
            });
        }
        
        console.log(`🗑️ /api/urunler DELETE - Hard deleted product: ${productName} (ID: ${id})`);
        
        return res.json({
            success: true,
            message: 'Ürün başarıyla silindi.',
            data: {
                urun_id: parseInt(id),
                ad: productName
            }
        });
    } catch (error) {
        console.error('❌ Error deleting product:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Ürün silinirken bir hata oluştu.',
            message: error.message
        });
    }
});

// ======================
// Decision Support Endpoint
// ======================

/**
 * Helper function to calculate last 6 months including a target month
 * @param {string} targetMonth - Target month in YYYY-MM format
 * @returns {Array} Array of month strings
 */
function getLast6Months(targetMonth) {
    const [year, month] = targetMonth.split('-').map(Number);
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(year, month - 1 - i, 1);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        months.push(`${y}-${m}`);
    }
    
    return months;
}

/**
 * Helper function to analyze product trend
 * @param {string} name - Product name
 * @param {Array} monthly - Array of monthly sales quantities
 * @returns {Object|null} Trend analysis or null
 */
function analyzeProductTrendForDecision(name, monthly) {
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
    
    // Calculate percent change
    const firstNonZero = monthly.find(m => m > 0) || 0;
    const lastNonZero = [...monthly].reverse().find(m => m > 0) || 0;
    let percentChange = 0;
    if (firstNonZero > 0) {
        percentChange = ((lastNonZero - firstNonZero) / firstNonZero) * 100;
    }
    
    // Determine trend
    let trendType = 'stable';
    let description = '';
    
    const recentDecline = monthly[5] < monthly[4] && monthly[4] < monthly[3] && monthly[3] > 0;
    
    if (percentChange > 30 && secondHalfAvg > firstHalfAvg * 1.2) {
        trendType = 'increase';
        description = `${name} satışları 6 ayda %${Math.round(percentChange)} arttı.`;
    } else if (percentChange < -20 || recentDecline) {
        trendType = 'decrease';
        if (recentDecline) {
            description = `${name} satışları son 2 ayda düşüş gösterdi.`;
        } else {
            description = `${name} satışları %${Math.abs(Math.round(percentChange))} azaldı.`;
        }
    } else if (coefficientOfVariation < 30) {
        trendType = 'stable';
        description = `${name} aylık ortalama satışını korudu.`;
    } else {
        trendType = 'stable';
        description = `${name} dalgalı satış performansı gösterdi.`;
    }
    
    return {
        productName: name,
        trendType,
        changePercent: Math.round(percentChange),
        description,
        averageMonthlySales: Math.round(average),
        totalSales: total
    };
}

/**
 * Build comprehensive analysis data for decision support
 * @param {string} month - Target month in YYYY-MM format
 * @returns {Object} Analysis data object
 */
async function buildAnalysisData(month) {
    // Get last 6 months
    const lastSixMonths = getLast6Months(month);
    
    // Parse month for date range
    const [year, monthNum] = month.split('-');
    const yearInt = parseInt(year);
    const monthInt = parseInt(monthNum);
    const startDate = `${year}-${monthNum}-01 00:00:00`;
    const lastDay = new Date(yearInt, monthInt, 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')} 23:59:59`;
    
    // Query 1: Top 10 products by revenue for selected month
    const topRevenueSql = `
        SELECT 
            u.urun_id,
            u.ad AS urun_adi,
            k.kategori_ad AS kategori,
            COALESCE(SUM(s.adet), 0) AS toplam_adet,
            COALESCE(SUM(s.toplam_tutar), 0) AS toplam_tutar
        FROM satislar s
        INNER JOIN urunler u ON s.urun_id = u.urun_id
        LEFT JOIN kategoriler k ON u.kategori_id = k.kategori_id
        WHERE s.tarih BETWEEN ? AND ?
            AND s.lokasyon_id = 1
        GROUP BY u.urun_id, u.ad, k.kategori_ad
        ORDER BY toplam_tutar DESC
        LIMIT 10
    `;
    
    // Query 2: Top 10 products by quantity for selected month
    const topQuantitySql = `
        SELECT 
            u.urun_id,
            u.ad AS urun_adi,
            k.kategori_ad AS kategori,
            COALESCE(SUM(s.adet), 0) AS toplam_adet,
            COALESCE(SUM(s.toplam_tutar), 0) AS toplam_tutar
        FROM satislar s
        INNER JOIN urunler u ON s.urun_id = u.urun_id
        LEFT JOIN kategoriler k ON u.kategori_id = k.kategori_id
        WHERE s.tarih BETWEEN ? AND ?
            AND s.lokasyon_id = 1
        GROUP BY u.urun_id, u.ad, k.kategori_ad
        ORDER BY toplam_adet DESC
        LIMIT 10
    `;
    
    // Query 3: 6-month trend data for all products
    const trendSql = `
        SELECT 
            u.urun_id,
            u.ad AS urun_adi,
            DATE_FORMAT(s.tarih, '%Y-%m') AS month,
            SUM(s.adet) AS toplam_adet
        FROM satislar s
        INNER JOIN urunler u ON s.urun_id = u.urun_id
        WHERE s.tarih >= DATE_SUB(?, INTERVAL 6 MONTH)
            AND s.lokasyon_id = 1
        GROUP BY u.urun_id, u.ad, DATE_FORMAT(s.tarih, '%Y-%m')
        ORDER BY u.ad, month
    `;
    
    // Query 4: Store occupancy
    const stockSql = `
        SELECT COALESCE(SUM(s.miktar * u.hacim_db), 0) AS total_used_db
        FROM stoklar s
        INNER JOIN urunler u ON s.urun_id = u.urun_id
        WHERE s.lokasyon_id = 1 AND u.aktif_mi = 1
    `;
    
    // Query 5: Monthly totals for summary
    const monthlyTotalSql = `
        SELECT 
            COALESCE(SUM(s.adet), 0) AS toplam_adet,
            COALESCE(SUM(s.toplam_tutar), 0) AS toplam_tutar
        FROM satislar s
        WHERE s.tarih BETWEEN ? AND ?
            AND s.lokasyon_id = 1
    `;
    
    // Execute all queries in parallel
    const [
        topRevenueResult,
        topQuantityResult,
        trendResult,
        stockResult,
        monthlyTotalResult
    ] = await Promise.all([
        db.query(topRevenueSql, [startDate, endDate]),
        db.query(topQuantitySql, [startDate, endDate]),
        db.query(trendSql, [endDate]),
        db.query(stockSql),
        db.query(monthlyTotalSql, [startDate, endDate])
    ]);
    
    // Process top revenue products
    const topRevenueProducts = topRevenueResult.map(row => ({
        urun_id: row.urun_id,
        urun_adi: row.urun_adi,
        kategori: row.kategori || 'Kategorisiz',
        toplam_adet: parseInt(row.toplam_adet),
        toplam_tutar: parseFloat(row.toplam_tutar)
    }));
    
    // Process top quantity products
    const topQuantityProducts = topQuantityResult.map(row => ({
        urun_id: row.urun_id,
        urun_adi: row.urun_adi,
        kategori: row.kategori || 'Kategorisiz',
        toplam_adet: parseInt(row.toplam_adet),
        toplam_tutar: parseFloat(row.toplam_tutar)
    }));
    
    // Process trends
    const productsMap = new Map();
    trendResult.forEach(row => {
        if (!productsMap.has(row.urun_id)) {
            productsMap.set(row.urun_id, {
                urun_id: row.urun_id,
                urun_adi: row.urun_adi,
                monthly: {}
            });
        }
        productsMap.get(row.urun_id).monthly[row.month] = parseInt(row.toplam_adet);
    });
    
    // Analyze trends for each product
    const trends = {
        increasing: [],
        decreasing: [],
        stable: []
    };
    
    productsMap.forEach(product => {
        const monthlyData = lastSixMonths.map(m => product.monthly[m] || 0);
        const analysis = analyzeProductTrendForDecision(product.urun_adi, monthlyData);
        
        if (analysis) {
            if (analysis.trendType === 'increase') {
                trends.increasing.push(analysis);
            } else if (analysis.trendType === 'decrease') {
                trends.decreasing.push(analysis);
            } else {
                trends.stable.push(analysis);
            }
        }
    });
    
    // Sort trends
    trends.increasing.sort((a, b) => b.changePercent - a.changePercent);
    trends.decreasing.sort((a, b) => a.changePercent - b.changePercent);
    trends.stable.sort((a, b) => b.totalSales - a.totalSales);
    
    // Process store occupancy
    const usedDB = parseFloat(stockResult[0]?.total_used_db || 0);
    const capacityDB = MAIN_STORE_CAPACITY_DB;
    const freeDB = Math.max(0, capacityDB - usedDB);
    const dolulukOrani = capacityDB > 0 ? Math.round((usedDB / capacityDB) * 100) : 0;
    
    const storeOccupancy = {
        dolulukOrani,
        kullanilanAlanDB: parseFloat(usedDB.toFixed(2)),
        toplamKapasiteDB: capacityDB,
        bosAlanDB: parseFloat(freeDB.toFixed(2)),
        durum: dolulukOrani >= 90 ? 'kritik' : dolulukOrani >= 80 ? 'yuksek' : dolulukOrani >= 60 ? 'normal' : 'dusuk'
    };
    
    // Process monthly summary
    const monthlySummary = {
        toplamSatisAdedi: parseInt(monthlyTotalResult[0]?.toplam_adet || 0),
        toplamCiro: parseFloat(monthlyTotalResult[0]?.toplam_tutar || 0)
    };
    
    return {
        month,
        lastSixMonths,
        monthlySummary,
        topRevenueProducts,
        topQuantityProducts,
        trends,
        storeOccupancy
    };
}

/**
 * Generate AI-powered decision support advice using OpenAI
 * @param {Object} analysisData - The analysis data from buildAnalysisData
 * @returns {string} AI-generated advice text in Turkish
 */
async function generateAIAdvice(analysisData) {
    const systemPrompt = `Sen bir elektrik malzemeleri perakende mağazası için karar destek sistemisin.
Türkçe yanıt ver. Kısa, pratik ve uygulanabilir öneriler sun.
Yanıtlarını madde işaretleri (•) ile formatla.
Her öneri somut, spesifik ve mağaza yöneticisinin hemen uygulayabileceği şekilde olsun.`;

    const userPrompt = `Aşağıda bir elektrik malzemeleri mağazasının son 6 aylık satış verileri, stok durumu ve trend analizleri bulunmaktadır.

Bu verilere dayanarak şu konularda pratik öneriler sun:

1. **Stok Yönetimi**: Hangi ürünlerin stoklarını artırmalı/azaltmalıyız?
2. **Depo İhtiyacı**: Mağaza doluluk oranına göre ek depo gerekli mi?
3. **Kampanya ve Fiyatlandırma**: Hangi ürünlerde indirim/kampanya yapılmalı?
4. **Riskler ve Uyarılar**: Stok tükenmesi, yavaş hareket eden ürünler gibi dikkat edilmesi gereken noktalar neler?

Her başlık için 2-3 spesifik öneri ver. Ürün isimlerini ve rakamları kullanarak somut öneriler sun.

VERİ:
${JSON.stringify(analysisData, null, 2)}`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 1500
    });

    return completion.choices[0]?.message?.content || 'Öneri oluşturulamadı.';
}

/**
 * POST /api/decision-support
 * Returns comprehensive analysis data and AI-powered recommendations
 * Accepts optional JSON body with month parameter
 */
router.post('/decision-support', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Get month from request body or default to current month
        let month = req.body?.month;
        
        if (!month) {
            const now = new Date();
            month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        
        console.log(`🧠 /api/decision-support - Building analysis for month: ${month}`);
        
        // Validate month format
        const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (!monthRegex.test(month)) {
            return res.status(400).json({
                success: false,
                error: 'Geçersiz ay formatı. YYYY-MM formatında olmalıdır.'
            });
        }
        
        // Build analysis data
        const analysisData = await buildAnalysisData(month);
        
        console.log(`✅ /api/decision-support - Analysis complete for ${month}`);
        console.log(`   📊 Top revenue products: ${analysisData.topRevenueProducts.length}`);
        console.log(`   📦 Top quantity products: ${analysisData.topQuantityProducts.length}`);
        console.log(`   📈 Increasing trends: ${analysisData.trends.increasing.length}`);
        console.log(`   📉 Decreasing trends: ${analysisData.trends.decreasing.length}`);
        console.log(`   🏪 Store occupancy: ${analysisData.storeOccupancy.dolulukOrani}%`);
        
        // Generate AI advice
        console.log(`🤖 /api/decision-support - Generating AI recommendations...`);
        
        let advice;
        try {
            advice = await generateAIAdvice(analysisData);
            console.log(`✅ /api/decision-support - AI advice generated successfully`);
        } catch (aiError) {
            console.error('❌ OpenAI API call failed:', aiError.message);
            console.error('❌ Full OpenAI error:', aiError);
            return res.status(500).json({
                success: false,
                error: 'Karar desteği üretilemedi.'
            });
        }
        
        return res.json({
            success: true,
            month,
            advice,
            analysisData
        });
        
    } catch (error) {
        console.error('❌ Error building decision support data:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            success: false,
            error: 'Karar destek verileri oluşturulurken bir hata oluştu.',
            message: error.message
        });
    }
});

// Simple ping endpoint to verify router works
router.get('/ping', (req, res) => {
    res.json({ ok: true, message: 'API router is working' });
});

// Depoları harita için dönen endpoint
router.get('/depots', async (req, res) => {
    try {
        const query = `
          SELECT 
            lokasyon_id AS id,
            ad          AS name,
            enlem       AS latitude,
            boylam      AS longitude,
            tur,
            adres
          FROM lokasyonlar
          WHERE tur = 'depo';
        `;

        const result = await db.query(query); // If your DB module uses pool, use pool.query
        res.json(result.rows || result);
    } catch (err) {
        console.error('Depo verileri alınırken hata:', err);
        res.status(500).json({ error: 'Depo verileri alınırken bir hata oluştu.' });
    }
});

module.exports = router;

