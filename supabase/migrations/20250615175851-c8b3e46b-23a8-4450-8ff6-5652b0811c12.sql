
UPDATE public.stores
SET logo_url = 'https://brandslogos.com/wp-content/uploads/images/large/kroger-logo.png'
WHERE name ILIKE 'Kroger';

UPDATE public.stores
SET logo_url = 'https://logos-world.net/wp-content/uploads/2022/01/Aldi-Logo.png'
WHERE name ILIKE 'Aldi';

UPDATE public.stores
SET logo_url = 'https://logos-world.net/wp-content/uploads/2021/10/Sams-Club-Logo-1993-2006.png'
WHERE name ILIKE 'Sam''s Club';
