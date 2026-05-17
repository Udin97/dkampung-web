-- ──────────────────────────────────────────────────────────────────────────────
-- Seed image_url on existing menu items with Unsplash stock photos.
--
-- Run once in the Supabase SQL editor (Project → SQL → New query → paste → Run).
-- Idempotent: re-running overwrites image_url with the same values.
--
-- These are placeholder stock photos picked for general visual fit, not exact
-- matches for our actual kuih. To swap with real photos, use the admin
-- dashboard (Admin → Menu → Edit → Muat Naik Gambar).
-- ──────────────────────────────────────────────────────────────────────────────

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1716579899416-72375f69ada7?w=600&q=75&auto=format&fit=crop' WHERE name = 'Apam Putih';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1716579895359-e9ac8ce97461?w=600&q=75&auto=format&fit=crop' WHERE name = 'Apam Pandan';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1675227977042-a572dac762be?w=600&q=75&auto=format&fit=crop' WHERE name = 'Apam Keladi';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1590330813083-fc22d4b6a48c?w=600&q=75&auto=format&fit=crop' WHERE name = 'Kaswi Jagung';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1772004839638-fcad4bcc2b89?w=600&q=75&auto=format&fit=crop' WHERE name = 'Kaswi Pandan';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1693082146554-a21b994df70a?w=600&q=75&auto=format&fit=crop' WHERE name = 'Kaswi Coklat';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1590330813083-fc22d4b6a48c?w=600&q=75&auto=format&fit=crop' WHERE name = 'Kaswi Ubi';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1716579895359-e9ac8ce97461?w=600&q=75&auto=format&fit=crop' WHERE name = 'Tepung Pelita';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1675227977042-a572dac762be?w=600&q=75&auto=format&fit=crop' WHERE name = 'Kuih Talam';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1716579899416-72375f69ada7?w=600&q=75&auto=format&fit=crop' WHERE name = 'Serimuka Pulut';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1624957389019-0c814505746d?w=600&q=75&auto=format&fit=crop' WHERE name = 'Nasi Lemak Che Dil';
