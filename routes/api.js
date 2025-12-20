/**
 * Lider Elektrik - Karar Destek Sistemi (KDS)
 * API Routes
 * 
 * This module contains all API endpoints for the Decision Support System.
 * Currently implements basic health check; more endpoints will be added later.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database module
const db = require('../db');

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'depolar');
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: depo_<timestamp>_<random>.<ext>
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const ext = path.extname(file.originalname);
        cb(null, `depo_${timestamp}_${random}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları kabul edilir.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB per file
    }
});

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
// KDS Summary Endpoint
// ======================

/**
 * GET /api/kds/summary
 * Returns summary data for the Decision Panel (Yönetici Özeti)
 * Query params: year (YYYY), month (MM, 1-12)
 * Returns: toplamAylikCiro, satisAdedi, kritikDepoSayisi, kdsKarari
 */
router.get('/kds/summary', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Get and validate year parameter
        const year = parseInt(req.query.year);
        if (!year || year < 2000 || year > 2100) {
            return res.status(400).json({
                success: false,
                error: 'Geçersiz yıl. 2000-2100 arası bir yıl olmalıdır.'
            });
        }
        
        // Get and validate month parameter
        const month = parseInt(req.query.month);
        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                error: 'Geçersiz ay. 1-12 arası bir ay olmalıdır.'
            });
        }
        
        console.log(`📊 /api/kds/summary - Year: ${year}, Month: ${month}`);
        
        // A) Calculate total monthly revenue (toplamAylikCiro)
        const revenueSql = `
            SELECT COALESCE(SUM(toplam_tutar), 0) AS toplam_aylik_ciro
            FROM satislar
            WHERE YEAR(tarih) = ? AND MONTH(tarih) = ? AND lokasyon_id = 1
        `;
        
        const revenueResult = await db.query(revenueSql, [year, month]);
        const toplamAylikCiro = parseFloat(revenueResult[0]?.toplam_aylik_ciro || 0);
        
        // B) Calculate total sales count (satisAdedi)
        const salesCountSql = `
            SELECT COALESCE(SUM(adet), 0) AS satis_adedi
            FROM satislar
            WHERE YEAR(tarih) = ? AND MONTH(tarih) = ? AND lokasyon_id = 1
        `;
        
        const salesCountResult = await db.query(salesCountSql, [year, month]);
        const satisAdedi = parseInt(salesCountResult[0]?.satis_adedi || 0);
        
        // C) Count critical depots (occupancy >= 80%)
        const criticalDepotsSql = `
            SELECT COUNT(*) AS kritik_depo_sayisi
            FROM (
                SELECT 
                    l.lokasyon_id,
                    l.kullanilabilir_kapasite_db,
                    COALESCE(SUM(s.miktar * u.hacim_db), 0) AS used_db,
                    CASE 
                        WHEN l.kullanilabilir_kapasite_db = 0 THEN 0
                        ELSE (COALESCE(SUM(s.miktar * u.hacim_db), 0) / l.kullanilabilir_kapasite_db) * 100
                    END AS doluluk_orani
                FROM lokasyonlar l
                LEFT JOIN stoklar s ON s.lokasyon_id = l.lokasyon_id
                LEFT JOIN urunler u ON u.urun_id = s.urun_id AND u.aktif_mi = 1
                WHERE l.tur = 'depo' AND (l.aktif_mi = 1 OR l.aktif_mi IS NULL)
                GROUP BY l.lokasyon_id, l.kullanilabilir_kapasite_db
                HAVING doluluk_orani >= 80
            ) AS critical_depots
        `;
        
        const criticalDepotsResult = await db.query(criticalDepotsSql);
        const kritikDepoSayisi = parseInt(criticalDepotsResult[0]?.kritik_depo_sayisi || 0);
        
        // D) Determine KDS decision
        const kdsKarari = kritikDepoSayisi >= 1 ? 'DIKKAT' : 'UYGUN';
        
        console.log(`✅ /api/kds/summary - Ciro: ${toplamAylikCiro}, Adet: ${satisAdedi}, Kritik Depo: ${kritikDepoSayisi}, Karar: ${kdsKarari}`);
        
        return res.json({
            success: true,
            toplamAylikCiro: toplamAylikCiro,
            satisAdedi: satisAdedi,
            kritikDepoSayisi: kritikDepoSayisi,
            kdsKarari: kdsKarari
        });
    } catch (error) {
        console.error('❌ Error fetching KDS summary:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            success: false,
            error: 'Özet verileri yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
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
                adres,
                sahip_miyiz
            FROM lokasyonlar
            WHERE tur = 'depo' AND (aktif_mi = 1 OR aktif_mi IS NULL)
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
 * GET /api/business
 * Returns our own business location (magaza where sahip_miyiz=1)
 * Returns: { lokasyon_id, ad, adres, enlem, boylam }
 */
router.get('/business', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const sql = `
            SELECT 
                lokasyon_id,
                ad,
                adres,
                enlem,
                boylam
            FROM lokasyonlar
            WHERE tur = 'magaza' AND sahip_miyiz = 1
            LIMIT 1
        `;
        const result = await db.query(sql);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ana mağaza konumu bulunamadı. Veritabanında tur=\'magaza\' ve sahip_miyiz=1 olan bir kayıt olmalıdır.'
            });
        }
        
        const business = result[0];
        
        // Validate coordinates
        if (business.enlem === null || business.boylam === null || 
            isNaN(parseFloat(business.enlem)) || isNaN(parseFloat(business.boylam))) {
            return res.status(400).json({
                success: false,
                error: 'Ana mağaza konumunun koordinatları (enlem/boylam) eksik veya geçersiz. Lütfen veritabanında kontrol edin.'
            });
        }
        
        return res.json({
            lokasyon_id: business.lokasyon_id,
            ad: business.ad,
            adres: business.adres,
            enlem: parseFloat(business.enlem),
            boylam: parseFloat(business.boylam)
        });
    } catch (error) {
        console.error('❌ Error fetching business location:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Ana mağaza konumu alınırken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * GET /api/depolar-detay
 * Returns warehouses with all fields plus distance from business location
 * Returns: { business: {...}, depolar: [{...all fields..., distance_km}] }
 */
router.get('/depolar-detay', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        // First, get business location
        const businessSql = `
            SELECT 
                lokasyon_id,
                ad,
                enlem,
                boylam
            FROM lokasyonlar
            WHERE tur = 'magaza' AND sahip_miyiz = 1
            LIMIT 1
        `;
        const businessResult = await db.query(businessSql);
        
        if (businessResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ana mağaza konumu bulunamadı.'
            });
        }
        
        const business = businessResult[0];
        const businessLat = parseFloat(business.enlem);
        const businessLng = parseFloat(business.boylam);
        
        if (isNaN(businessLat) || isNaN(businessLng)) {
            return res.status(400).json({
                success: false,
                error: 'Ana mağaza koordinatları geçersiz.'
            });
        }
        
        // Get all warehouses with all fields and photos (only active depots)
        const depotsSql = `
            SELECT 
                l.lokasyon_id,
                l.ad,
                l.tur,
                l.adres,
                l.enlem,
                l.boylam,
                l.metrekare,
                l.yukseklik_m,
                l.kapasite_db,
                l.kullanilabilir_oran,
                l.kullanilabilir_kapasite_db,
                l.aylik_kira,
                l.sahip_miyiz,
                l.aktif_mi,
                df.foto_url
            FROM lokasyonlar l
            LEFT JOIN depo_fotograflari df ON l.lokasyon_id = df.lokasyon_id
            WHERE l.tur = 'depo' AND (l.aktif_mi = 1 OR l.aktif_mi IS NULL)
            ORDER BY l.lokasyon_id ASC, df.id ASC
        `;
        
        const depotsRaw = await db.query(depotsSql);
        
        // Group warehouses by lokasyon_id and collect photos
        const depotsMap = new Map();
        
        depotsRaw.forEach(row => {
            const lokasyonId = row.lokasyon_id;
            
            if (!depotsMap.has(lokasyonId)) {
                // First occurrence of this warehouse - create entry
                depotsMap.set(lokasyonId, {
                    lokasyon_id: row.lokasyon_id,
                    ad: row.ad,
                    tur: row.tur,
                    adres: row.adres,
                    enlem: row.enlem,
                    boylam: row.boylam,
                    metrekare: row.metrekare,
                    yukseklik_m: row.yukseklik_m,
                    kapasite_db: row.kapasite_db,
                    kullanilabilir_oran: row.kullanilabilir_oran,
                    kullanilabilir_kapasite_db: row.kullanilabilir_kapasite_db,
                    aylik_kira: row.aylik_kira,
                    sahip_miyiz: row.sahip_miyiz,
                    photos: []
                });
            }
            
            // Add photo if it exists
            if (row.foto_url) {
                const depot = depotsMap.get(lokasyonId);
                depot.photos.push({ foto_url: row.foto_url });
            }
        });
        
        // Convert map to array
        const depots = Array.from(depotsMap.values());
        
        // Calculate distance for each warehouse
        const depotsWithDistance = depots.map(depot => {
            const depotLat = parseFloat(depot.enlem);
            const depotLng = parseFloat(depot.boylam);
            
            let distance_km = null;
            if (!isNaN(depotLat) && !isNaN(depotLng)) {
                distance_km = calculateDistance(businessLat, businessLng, depotLat, depotLng);
                // Round to 2 decimal places
                distance_km = Math.round(distance_km * 100) / 100;
            }
            
            return {
                ...depot,
                distance_km: distance_km
            };
        });
        
        // Sort by distance (nulls last)
        depotsWithDistance.sort((a, b) => {
            if (a.distance_km === null && b.distance_km === null) return 0;
            if (a.distance_km === null) return 1;
            if (b.distance_km === null) return -1;
            return a.distance_km - b.distance_km;
        });
        
        return res.json({
            success: true,
            business: {
                lokasyon_id: business.lokasyon_id,
                ad: business.ad,
                enlem: businessLat,
                boylam: businessLng
            },
            depolar: depotsWithDistance
        });
    } catch (error) {
        console.error('❌ Error fetching depots with details:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Depo detayları alınırken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * POST /api/depolar
 * Create a new warehouse (depo) with optional photos
 * Accepts multipart/form-data with fields and photos[]
 */
router.post('/depolar', upload.array('photos', 10), async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Validate required fields
        const { ad, enlem, boylam } = req.body;
        
        if (!ad || ad.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Depo adı zorunludur.'
            });
        }
        
        if (!enlem || isNaN(parseFloat(enlem))) {
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir enlem (latitude) değeri gerekli.'
            });
        }
        
        if (!boylam || isNaN(parseFloat(boylam))) {
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir boylam (longitude) değeri gerekli.'
            });
        }
        
        // Prepare data for insertion
        // NOTE: kullanilabilir_kapasite_db is a GENERATED column in MySQL
        // DO NOT include it in INSERT - MySQL will calculate it automatically
        
        const depoData = {
            tur: 'depo',
            ad: ad.trim(),
            adres: req.body.adres || null,
            enlem: parseFloat(enlem),
            boylam: parseFloat(boylam),
            metrekare: req.body.metrekare ? parseFloat(req.body.metrekare) : null,
            yukseklik_m: req.body.yukseklik_m ? parseFloat(req.body.yukseklik_m) : null,
            kapasite_db: req.body.kapasite_db ? parseInt(req.body.kapasite_db) : null,
            kullanilabilir_oran: req.body.kullanilabilir_oran ? parseFloat(req.body.kullanilabilir_oran) : null,
            // kullanilabilir_kapasite_db is GENERATED - do not include in INSERT
            aylik_kira: req.body.aylik_kira ? parseFloat(req.body.aylik_kira) : null,
            sahip_miyiz: 0 // Default: not owned
        };
        
        // Insert warehouse into database (excluding generated column)
        // Note: aktif_mi defaults to 1 if column exists
        const insertSql = `
            INSERT INTO lokasyonlar (
                tur, ad, adres, enlem, boylam, metrekare, yukseklik_m,
                kapasite_db, kullanilabilir_oran,
                aylik_kira, sahip_miyiz, aktif_mi
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;
        
        const insertParams = [
            depoData.tur,
            depoData.ad,
            depoData.adres,
            depoData.enlem,
            depoData.boylam,
            depoData.metrekare,
            depoData.yukseklik_m,
            depoData.kapasite_db,
            depoData.kullanilabilir_oran,
            depoData.aylik_kira,
            depoData.sahip_miyiz,
            1 // aktif_mi = 1 (active by default)
        ];
        
        const insertResult = await db.query(insertSql, insertParams);
        // For INSERT queries, mysql2 returns an object with insertId property
        const lokasyonId = insertResult.insertId;
        
        if (!lokasyonId) {
            return res.status(500).json({
                success: false,
                error: 'Depo oluşturulurken bir hata oluştu.'
            });
        }
        
        // Handle photo uploads
        const photos = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Store relative URL in database
                const fotoUrl = `/images/depolar/${file.filename}`;
                
                const photoSql = `
                    INSERT INTO depo_fotograflari (lokasyon_id, foto_url)
                    VALUES (?, ?)
                `;
                
                await db.query(photoSql, [lokasyonId, fotoUrl]);
                photos.push({ foto_url: fotoUrl });
            }
        }
        
        // SELECT the created row back to get the generated column value
        const selectSql = `
            SELECT 
                lokasyon_id,
                tur,
                ad,
                adres,
                enlem,
                boylam,
                metrekare,
                yukseklik_m,
                kapasite_db,
                kullanilabilir_oran,
                kullanilabilir_kapasite_db,
                aylik_kira,
                sahip_miyiz
            FROM lokasyonlar
            WHERE lokasyon_id = ?
        `;
        
        const [createdDepot] = await db.query(selectSql, [lokasyonId]);
        
        if (!createdDepot) {
            return res.status(500).json({
                success: false,
                error: 'Depo oluşturuldu ancak veriler alınamadı.'
            });
        }
        
        // Return created depot with photos and generated column
        return res.json({
            success: true,
            lokasyon_id: createdDepot.lokasyon_id,
            tur: createdDepot.tur,
            ad: createdDepot.ad,
            adres: createdDepot.adres,
            enlem: createdDepot.enlem,
            boylam: createdDepot.boylam,
            metrekare: createdDepot.metrekare,
            yukseklik_m: createdDepot.yukseklik_m,
            kapasite_db: createdDepot.kapasite_db,
            kullanilabilir_oran: createdDepot.kullanilabilir_oran,
            kullanilabilir_kapasite_db: createdDepot.kullanilabilir_kapasite_db, // Generated by MySQL
            aylik_kira: createdDepot.aylik_kira,
            sahip_miyiz: createdDepot.sahip_miyiz,
            photos: photos
        });
        
    } catch (error) {
        console.error('❌ Error creating depot:', error.message);
        
        // Clean up uploaded files if depot creation failed
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const filePath = path.join(__dirname, '..', 'public', 'images', 'depolar', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Depo oluşturulurken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * PATCH /api/depolar/:lokasyon_id/soft-delete
 * Soft deletes a depot by setting aktif_mi = 0
 * Only works for tur='depo', never for business location (tur='magaza' or sahip_miyiz=1)
 */
router.patch('/depolar/:lokasyon_id/soft-delete', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { lokasyon_id } = req.params;
        const lokasyonId = parseInt(lokasyon_id);
        
        if (!lokasyonId || isNaN(lokasyonId)) {
            return res.status(400).json({
                ok: false,
                message: 'Geçersiz depo ID.'
            });
        }
        
        // Check if location exists - use correct PK column (lokasyon_id)
        const checkSql = `
            SELECT lokasyon_id, tur, sahip_miyiz, aktif_mi
            FROM lokasyonlar
            WHERE lokasyon_id = ?
            LIMIT 1
        `;
        const locationResult = await db.query(checkSql, [lokasyonId]);
        
        // Handle different return formats from db.query
        const location = Array.isArray(locationResult) && locationResult.length > 0 
            ? (Array.isArray(locationResult[0]) ? locationResult[0] : locationResult)
            : locationResult;
        
        // Guard check: If no row is found, return 404
        if (!location || (Array.isArray(location) && location.length === 0) || !location[0]) {
            return res.status(404).json({
                ok: false,
                message: 'Depo bulunamadı.'
            });
        }
        
        // Get the first row safely
        const depotRow = Array.isArray(location) ? location[0] : location;
        
        // Guard check: If row.tur !== 'depo', return 400
        if (!depotRow.tur || depotRow.tur !== 'depo') {
            return res.status(400).json({
                ok: false,
                message: 'Sadece depolar silinebilir.'
            });
        }
        
        // Guard check: If row.sahip_miyiz = 1, return 400
        if (depotRow.sahip_miyiz === 1) {
            return res.status(400).json({
                ok: false,
                message: 'Satın alınmış depo silinemez.'
            });
        }
        
        // Check if already deleted
        if (depotRow.aktif_mi === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Bu depo zaten silinmiş.'
            });
        }
        
        // Perform soft delete safely
        const updateSql = 'UPDATE lokasyonlar SET aktif_mi = 0 WHERE lokasyon_id = ? AND tur = \'depo\'';
        const updateResult = await db.query(updateSql, [lokasyonId]);
        
        // Handle different return formats
        const affectedRows = updateResult?.affectedRows || (Array.isArray(updateResult) && updateResult[0]?.affectedRows) || 0;
        
        if (affectedRows === 0) {
            return res.status(500).json({
                ok: false,
                message: 'Depo silinirken bir hata oluştu.'
            });
        }
        
        console.log(`🗑️ Soft deleted depot (ID: ${lokasyonId})`);
        
        return res.json({
            ok: true,
            message: 'Depo başarıyla silindi.',
            lokasyon_id: lokasyonId
        });
        
    } catch (error) {
        console.error('❌ Error soft deleting depot:', error.message);
        console.error('❌ Full error:', error);
        
        // If column doesn't exist, provide helpful error
        if (error.message && (error.message.includes('Unknown column') || error.message.includes('aktif_mi'))) {
            return res.status(500).json({
                ok: false,
                message: 'Veritabanı hatası: aktif_mi sütunu bulunamadı. Lütfen veritabanı şemasını kontrol edin.'
            });
        }
        
        return res.status(500).json({
            ok: false,
            message: 'Depo silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata')
        });
    }
});

/**
 * PATCH /api/depolar/:lokasyon_id/satin-al
 * Marks a depot as owned by setting sahip_miyiz = 1
 * Only works for tur='depo'
 */
router.patch('/depolar/:lokasyon_id/satin-al', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { lokasyon_id } = req.params;
        const lokasyonId = parseInt(lokasyon_id);
        
        if (!lokasyonId || isNaN(lokasyonId)) {
            return res.status(400).json({
                ok: false,
                message: 'Geçersiz depo ID.'
            });
        }
        
        // Check if location exists - use correct PK column (lokasyon_id)
        const checkSql = `
            SELECT lokasyon_id, tur, sahip_miyiz, aktif_mi
            FROM lokasyonlar
            WHERE lokasyon_id = ?
            LIMIT 1
        `;
        const locationResult = await db.query(checkSql, [lokasyonId]);
        
        // Handle different return formats from db.query
        const location = Array.isArray(locationResult) && locationResult.length > 0 
            ? (Array.isArray(locationResult[0]) ? locationResult[0] : locationResult)
            : locationResult;
        
        // Guard check: If no row is found, return 404
        if (!location || (Array.isArray(location) && location.length === 0) || !location[0]) {
            return res.status(404).json({
                ok: false,
                message: 'Depo bulunamadı.'
            });
        }
        
        // Get the first row safely
        const depotRow = Array.isArray(location) ? location[0] : location;
        
        // Guard check: If row.tur !== 'depo', return 400
        if (!depotRow.tur || depotRow.tur !== 'depo') {
            return res.status(400).json({
                ok: false,
                message: 'Sadece depolar için bu işlem yapılabilir.'
            });
        }
        
        // Check if already owned
        if (depotRow.sahip_miyiz === 1) {
            return res.status(400).json({
                ok: false,
                message: 'Bu depo zaten satın alınmış.'
            });
        }
        
        // Mark as owned: Set sahip_miyiz = 1
        const updateSql = 'UPDATE lokasyonlar SET sahip_miyiz = 1 WHERE lokasyon_id = ? AND tur = \'depo\'';
        const updateResult = await db.query(updateSql, [lokasyonId]);
        
        // Handle different return formats
        const affectedRows = updateResult?.affectedRows || (Array.isArray(updateResult) && updateResult[0]?.affectedRows) || 0;
        
        if (affectedRows === 0) {
            return res.status(500).json({
                ok: false,
                message: 'Depo güncellenirken bir hata oluştu.'
            });
        }
        
        console.log(`✅ Marked depot as owned (ID: ${lokasyonId})`);
        
        // Return updated depot data
        const selectSql = `
            SELECT 
                lokasyon_id,
                ad,
                tur,
                sahip_miyiz,
                aylik_kira
            FROM lokasyonlar
            WHERE lokasyon_id = ?
            LIMIT 1
        `;
        const updatedResult = await db.query(selectSql, [lokasyonId]);
        const updatedDepot = Array.isArray(updatedResult) && updatedResult.length > 0
            ? (Array.isArray(updatedResult[0]) ? updatedResult[0][0] : updatedResult[0])
            : null;
        
        return res.json({
            ok: true,
            message: 'Depo satın alındı olarak işaretlendi.',
            lokasyon_id: lokasyonId,
            sahip_miyiz: 1,
            depot: updatedDepot
        });
        
    } catch (error) {
        console.error('❌ Error marking depot as owned:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Depo güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata')
        });
    }
});

/**
 * GET /api/monthly-revenue
 * Returns the FULL monthly revenue total (all products, no LIMIT)
 * Query params: month (YYYY-MM format, defaults to current month)
 * Returns: { success: true, month: 'YYYY-MM', monthly_total: number }
 */
router.get('/monthly-revenue', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Get month parameter or default to current month
        let month = req.query.month;
        
        if (!month) {
            const now = new Date();
            month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        
        console.log(`💰 /api/monthly-revenue - Requested month: ${month}`);
        
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
        
        // Query to get FULL monthly revenue (SUM of adet * birim_fiyat for ALL products)
        const sql = `
            SELECT SUM(adet * birim_fiyat) AS monthly_total
            FROM satislar
            WHERE YEAR(tarih) = ? AND MONTH(tarih) = ?
                AND lokasyon_id = 1
        `;
        
        const result = await db.query(sql, [yearInt, monthInt]);
        const monthlyTotal = parseFloat(result[0]?.monthly_total || 0);
        
        console.log(`✅ /api/monthly-revenue - Month: ${month}, Total: ${monthlyTotal.toFixed(2)} TL`);
        
        return res.json({
            success: true,
            month: month,
            monthly_total: monthlyTotal
        });
    } catch (error) {
        console.error('❌ Error fetching monthly revenue:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            success: false,
            error: 'Aylık toplam ciro yüklenirken bir hata oluştu.',
            message: error.message
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
        
        // Query to get top 10 products by revenue for the specified month
        const sql = `
            SELECT 
                u.urun_id,
                u.ad AS urun_adi,
                COALESCE(SUM(s.adet), 0) AS toplam_adet,
                COALESCE(SUM(s.toplam_tutar), 0) AS toplam_tutar
            FROM satislar s
            INNER JOIN urunler u ON s.urun_id = u.urun_id
            WHERE s.tarih BETWEEN ? AND ?
                AND s.lokasyon_id = 1
            GROUP BY u.urun_id, u.ad
            ORDER BY toplam_tutar DESC
            LIMIT 10
        `;
        
        const items = await db.query(sql, [startDate, endDate]);
        
        console.log(`✅ /api/sales-details - Month: ${month}, Found ${items.length} products`);
        
        return res.json({
            success: true,
            month: month,
            items: items
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
// Locations Endpoints
// ======================

/**
 * GET /api/lokasyonlar
 * Returns all locations (magaza + depo) with their capacity and current occupancy
 * Used for product creation to select where to store stock
 */
router.get('/lokasyonlar', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Get all locations with their capacity
        const locationsSql = `
            SELECT 
                lokasyon_id, 
                ad, 
                tur, 
                kapasite_db, 
                kullanilabilir_kapasite_db
            FROM lokasyonlar
            WHERE sahip_miyiz=1
            ORDER BY (tur='magaza') DESC, lokasyon_id ASC
        `;
        
        const locations = await db.query(locationsSql);
        
        // For each location, calculate current used_db and occupancy percentage
        const locationsWithOccupancy = await Promise.all(
            locations.map(async (loc) => {
                const usedSql = `
                    SELECT 
                        COALESCE(SUM(s.miktar * u.hacim_db), 0) AS used_db
                    FROM stoklar s
                    INNER JOIN urunler u ON s.urun_id = u.urun_id
                    WHERE s.lokasyon_id = ? AND u.aktif_mi = 1
                `;
                
                const [usedResult] = await db.query(usedSql, [loc.lokasyon_id]);
                const used_db = parseFloat(usedResult?.used_db || 0);
                const capacity_db = parseFloat(loc.kullanilabilir_kapasite_db || loc.kapasite_db || 0);
                
                const doluluk_yuzde = capacity_db > 0 
                    ? Math.round((used_db / capacity_db) * 100 * 100) / 100 
                    : 0;
                
                return {
                    lokasyon_id: loc.lokasyon_id,
                    ad: loc.ad,
                    tur: loc.tur,
                    kapasite_db: parseFloat(loc.kapasite_db || 0),
                    kullanilabilir_kapasite_db: capacity_db,
                    used_db: used_db,
                    doluluk_yuzde: doluluk_yuzde
                };
            })
        );
        
        console.log(`📍 /api/lokasyonlar - Returning ${locationsWithOccupancy.length} locations`);
        
        return res.json({
            success: true,
            count: locationsWithOccupancy.length,
            data: locationsWithOccupancy
        });
    } catch (error) {
        console.error('❌ Error fetching locations:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Lokasyonlar yüklenirken bir hata oluştu.',
            message: error.message
        });
    }
});

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * GET /api/en-uygun-depolar
 * Returns ranked list of best warehouses (depots) based on capacity, price, and distance
 * Uses real database data to compute scores
 */
router.get('/en-uygun-depolar', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Find main store (reference location)
        const mainStoreSql = `
            SELECT lokasyon_id, ad, enlem, boylam
            FROM lokasyonlar
            WHERE tur = 'magaza'
            LIMIT 1
        `;
        
        const mainStore = await db.query(mainStoreSql);
        
        if (mainStore.length === 0) {
            return res.json({
                success: true,
                message: 'Ana mağaza bulunamadı.',
                data: []
            });
        }
        
        const mainStoreLat = parseFloat(mainStore[0].enlem);
        const mainStoreLon = parseFloat(mainStore[0].boylam);
        
        // Get all candidate depots
        const depotsSql = `
            SELECT 
                lokasyon_id,
                ad,
                tur,
                enlem,
                boylam,
                aylik_kira,
                kapasite_db,
                kullanilabilir_kapasite_db
            FROM lokasyonlar
            WHERE tur = 'depo' AND (aktif_mi = 1 OR aktif_mi IS NULL)
            ORDER BY lokasyon_id ASC
        `;
        
        const depots = await db.query(depotsSql);
        
        if (depots.length === 0) {
            return res.json({
                success: true,
                message: 'Depo bulunamadı.',
                data: []
            });
        }
        
        // Calculate metrics for each depot
        const depotsWithMetrics = depots.map(depot => {
            const depotLat = parseFloat(depot.enlem);
            const depotLon = parseFloat(depot.boylam);
            
            // Calculate distance using Haversine formula
            const distanceKm = calculateHaversineDistance(
                mainStoreLat, 
                mainStoreLon, 
                depotLat, 
                depotLon
            );
            
            // Get capacity (prefer kullanilabilir_kapasite_db, fallback to kapasite_db)
            const capacity = parseFloat(depot.kullanilabilir_kapasite_db || depot.kapasite_db || 0);
            
            // Get price
            const price = parseFloat(depot.aylik_kira || 0);
            
            return {
                depo_id: depot.lokasyon_id,
                depo_adi: depot.ad,
                aylik_kira: price,
                kapasite_db: capacity,
                distance_km: Math.round(distanceKm * 100) / 100, // Round to 2 decimals
                enlem: depotLat,
                boylam: depotLon
            };
        });
        
        // Normalize values for scoring (0-1 scale)
        // Find min/max for each metric
        const capacities = depotsWithMetrics.map(d => d.kapasite_db).filter(c => c > 0);
        const prices = depotsWithMetrics.map(d => d.aylik_kira).filter(p => p > 0);
        const distances = depotsWithMetrics.map(d => d.distance_km);
        
        const maxCapacity = Math.max(...capacities, 1);
        const minCapacity = Math.min(...capacities, 0);
        const maxPrice = Math.max(...prices, 1);
        const minPrice = Math.min(...prices, 0);
        const maxDistance = Math.max(...distances, 1);
        const minDistance = Math.min(...distances, 0);
        
        // Calculate scores for each depot
        // Weights: capacity 0.45, price 0.35, distance 0.20
        const WEIGHT_CAPACITY = 0.45;
        const WEIGHT_PRICE = 0.35;
        const WEIGHT_DISTANCE = 0.20;
        
        const depotsWithScores = depotsWithMetrics.map(depot => {
            // Normalize capacity (higher is better): (value - min) / (max - min)
            const capacityRange = maxCapacity - minCapacity;
            const normalizedCapacity = capacityRange > 0 
                ? (depot.kapasite_db - minCapacity) / capacityRange 
                : 0.5; // Default to middle if all same
            
            // Normalize price (lower is better): 1 - ((value - min) / (max - min))
            const priceRange = maxPrice - minPrice;
            const normalizedPrice = priceRange > 0 
                ? 1 - ((depot.aylik_kira - minPrice) / priceRange)
                : 0.5; // Default to middle if all same
            
            // Normalize distance (lower is better): 1 - ((value - min) / (max - min))
            const distanceRange = maxDistance - minDistance;
            const normalizedDistance = distanceRange > 0 
                ? 1 - ((depot.distance_km - minDistance) / distanceRange)
                : 0.5; // Default to middle if all same
            
            // Calculate weighted score
            const score = (
                normalizedCapacity * WEIGHT_CAPACITY +
                normalizedPrice * WEIGHT_PRICE +
                normalizedDistance * WEIGHT_DISTANCE
            ) * 100; // Scale to 0-100 for readability
            
            return {
                ...depot,
                score: Math.round(score * 100) / 100 // Round to 2 decimals
            };
        });
        
        // Sort by score descending
        depotsWithScores.sort((a, b) => b.score - a.score);
        
        // Remove temporary fields (enlem, boylam) from response
        const result = depotsWithScores.map(({ enlem, boylam, ...rest }) => rest);
        
        console.log(`🏆 /api/en-uygun-depolar - Found ${result.length} depots, ranked by score`);
        
        return res.json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (error) {
        console.error('❌ Error fetching best depots:', error.message);
        console.error('❌ Full error:', error);
        return res.status(500).json({
            success: false,
            error: 'En uygun depolar hesaplanırken bir hata oluştu.',
            message: error.message
        });
    }
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
 * Creates a new product in the database and optionally creates/updates stock
 * Required fields: ad, kategori_id, birim_fiyat, hacim_db, adet, lokasyon_id
 */
router.post('/urunler', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const pool = db.getPool();
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { ad, kategori_id, birim_fiyat, hacim_db, adet, lokasyon_id } = req.body;
        
        // Validate required fields
        if (!ad || ad.trim() === '') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Ürün adı zorunludur.'
            });
        }
        
        if (!kategori_id) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Kategori seçimi zorunludur.'
            });
        }
        
        if (birim_fiyat === undefined || birim_fiyat === null || birim_fiyat < 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir birim fiyat girilmelidir.'
            });
        }
        
        if (hacim_db === undefined || hacim_db === null || hacim_db < 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Geçerli bir depo birimi (hacim) girilmelidir.'
            });
        }
        
        // Validate stock fields if provided
        if (adet !== undefined && adet !== null) {
            if (adet < 1 || !Number.isInteger(Number(adet))) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    error: 'Adet/Stok en az 1 olmalıdır ve tam sayı olmalıdır.'
                });
            }
            
            if (!lokasyon_id) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    error: 'Depo seçimi zorunludur (adet belirtildiğinde).'
                });
            }
        }
        
        // Insert new product
        const insertProductSql = `
            INSERT INTO urunler (ad, kategori_id, birim_fiyat, hacim_db, kritik_stok, aktif_mi)
            VALUES (?, ?, ?, ?, 0, 1)
        `;
        
        const [productResult] = await connection.execute(insertProductSql, [
            ad.trim(), 
            kategori_id, 
            birim_fiyat, 
            hacim_db
        ]);
        
        const urun_id = productResult.insertId;
        
        // If adet and lokasyon_id provided, create/update stock
        if (adet !== undefined && adet !== null && lokasyon_id) {
            const upsertStockSql = `
                INSERT INTO stoklar (urun_id, lokasyon_id, miktar)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE miktar = miktar + VALUES(miktar)
            `;
            
            await connection.execute(upsertStockSql, [urun_id, lokasyon_id, adet]);
            
            console.log(`📦 Stock created/updated: ${adet} units of product ${urun_id} in location ${lokasyon_id}`);
        }
        
        // Commit transaction
        await connection.commit();
        
        // Calculate updated occupancy for the selected location (if stock was added)
        let locationOccupancy = null;
        if (adet !== undefined && adet !== null && lokasyon_id) {
            const occupancySql = `
                SELECT
                    l.lokasyon_id,
                    l.ad,
                    l.kullanilabilir_kapasite_db AS capacity_db,
                    COALESCE(SUM(s.miktar * u.hacim_db), 0) AS used_db,
                    CASE WHEN l.kullanilabilir_kapasite_db = 0 THEN 0
                         ELSE ROUND((COALESCE(SUM(s.miktar * u.hacim_db), 0) / l.kullanilabilir_kapasite_db) * 100, 2)
                    END AS doluluk_yuzde
                FROM lokasyonlar l
                LEFT JOIN stoklar s ON s.lokasyon_id = l.lokasyon_id
                LEFT JOIN urunler u ON u.urun_id = s.urun_id AND u.aktif_mi = 1
                WHERE l.lokasyon_id = ?
                GROUP BY l.lokasyon_id
            `;
            
            const [occupancyResult] = await db.query(occupancySql, [lokasyon_id]);
            if (occupancyResult && occupancyResult.length > 0) {
                locationOccupancy = {
                    lokasyon_id: occupancyResult[0].lokasyon_id,
                    ad: occupancyResult[0].ad,
                    capacity_db: parseFloat(occupancyResult[0].capacity_db || 0),
                    used_db: parseFloat(occupancyResult[0].used_db || 0),
                    doluluk_yuzde: parseFloat(occupancyResult[0].doluluk_yuzde || 0)
                };
            }
        }
        
        console.log(`✅ /api/urunler POST - Created product: ${ad} (ID: ${urun_id})`);
        
        return res.status(201).json({
            success: true,
            message: 'Ürün başarıyla eklendi.',
            data: {
                urun_id: urun_id,
                ad: ad.trim(),
                kategori_id: kategori_id,
                birim_fiyat: birim_fiyat,
                hacim_db: hacim_db,
                ...(adet !== undefined && lokasyon_id ? {
                    adet: adet,
                    lokasyon_id: lokasyon_id,
                    location_occupancy: locationOccupancy
                } : {})
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error creating product:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Ürün eklenirken bir hata oluştu.',
            message: error.message
        });
    } finally {
        connection.release();
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
 * Soft deletes a product by setting aktif_mi = 0 and removes current stock records
 * Preserves historical sales data by not deleting from satislar table
 */
router.delete('/urunler/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const { id } = req.params;
    const pool = db.getPool();
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Geçersiz ürün ID.'
            });
        }
        
        // Check if product exists and get its name for logging
        const checkSql = 'SELECT urun_id, ad, aktif_mi FROM urunler WHERE urun_id = ?';
        const [existing] = await connection.execute(checkSql, [id]);
        
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: 'Ürün bulunamadı.'
            });
        }
        
        const productName = existing[0].ad;
        
        // Soft delete: Set product as inactive
        const softDeleteSql = 'UPDATE urunler SET aktif_mi = 0 WHERE urun_id = ?';
        const [updateResult] = await connection.execute(softDeleteSql, [id]);
        
        // Check if product was updated
        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: 'Ürün pasifleştirilemedi.'
            });
        }
        
        // Delete current stock records (safe to remove, preserves sales history)
        const deleteStockSql = 'DELETE FROM stoklar WHERE urun_id = ?';
        const [stockDeleteResult] = await connection.execute(deleteStockSql, [id]);
        
        // Check if depo_stoklari table exists and delete from there too
        // Using a try-catch to handle gracefully if table doesn't exist
        try {
            const deleteDepoStockSql = 'DELETE FROM depo_stoklari WHERE urun_id = ?';
            await connection.execute(deleteDepoStockSql, [id]);
            console.log(`📦 Deleted stock from depo_stoklari for product ${id}`);
        } catch (depoStockError) {
            // Table might not exist, which is fine - just log and continue
            if (depoStockError.code !== 'ER_NO_SUCH_TABLE') {
                // If it's a different error, log it but don't fail the transaction
                console.warn(`⚠️ Could not delete from depo_stoklari: ${depoStockError.message}`);
            }
        }
        
        // Commit transaction
        await connection.commit();
        
        console.log(`🗑️ /api/urunler DELETE - Soft deleted product: ${productName} (ID: ${id}), removed ${stockDeleteResult.affectedRows} stock records`);
        
        return res.json({
            success: true,
            message: 'Ürün pasifleştirildi.',
            data: {
                urun_id: parseInt(id),
                ad: productName,
                stock_records_deleted: stockDeleteResult.affectedRows
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error deleting product:', error.message);
        console.error('❌ Full error:', error);
        
        // Return detailed error message
        return res.status(500).json({
            success: false,
            error: 'Ürün silinirken bir hata oluştu.',
            message: error.message,
            sqlError: error.code || null
        });
    } finally {
        connection.release();
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
          WHERE tur = 'depo' AND (aktif_mi = 1 OR aktif_mi IS NULL);
        `;

        const result = await db.query(query); // If your DB module uses pool, use pool.query
        res.json(result.rows || result);
    } catch (err) {
        console.error('Depo verileri alınırken hata:', err);
        res.status(500).json({ error: 'Depo verileri alınırken bir hata oluştu.' });
    }
});

module.exports = router;

