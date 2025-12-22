-- Migration: Fix kullanilabilir_oran column type to support fractions [0,1]
-- Issue: DECIMAL(3,2) can only store values up to 9.99, causing "80" to be clamped to 9.99
-- Solution: Change to DECIMAL(5,4) to store fractions like 0.8000 precisely

-- Step 1: Alter column type to support fractions [0,1]
ALTER TABLE lokasyonlar
    MODIFY kullanilabilir_oran DECIMAL(5,4) NOT NULL DEFAULT 0.8000;

-- Step 2: Fix existing bad rows that are 9.99 (should be 0.80)
-- This fixes rows where someone entered "80" (meaning 80%) and it got clamped to 9.99
UPDATE lokasyonlar 
SET kullanilabilir_oran = 0.8000 
WHERE kullanilabilir_oran = 9.99;

-- Step 3: Verify the generated column kullanilabilir_kapasite_db is working correctly
-- This column is GENERATED ALWAYS AS (kapasite_db * kullanilabilir_oran) STORED
-- After migration, verify with:
-- SELECT lokasyon_id, kapasite_db, kullanilabilir_oran, kullanilabilir_kapasite_db 
-- FROM lokasyonlar 
-- WHERE tur = 'depo';

