INSERT INTO books (id, title, author, description, publisher, language, publication_date, price, stock, cover_image_url, categories, type) VALUES
-- Romantikus
(gen_random_uuid(), 'Büszkeség és balítélet', 'Jane Austen', 'A klasszikus szerelmi történet.', 'Helikon', 'magyar', '2020-12-12', 3990.00, 100, 'https://via.placeholder.com/150', ARRAY['Romantikus'], 'physical'),
(gen_random_uuid(), 'Csillagfény a Dunánál', 'Kiss Júlia', 'Egy váratlan találkozás a rakparton új esélyt hoz a szerelemben.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 3490.00, 100, 'https://via.placeholder.com/150', ARRAY['Romantikus'], 'physical'),

-- Sci-fi
(gen_random_uuid(), 'Alapítvány', 'Isaac Asimov', 'A galaktikus birodalom hanyatlása és az új kezdet.', 'Gabo', 'magyar', '2020-12-12', 4990.00, 100, 'https://via.placeholder.com/150', ARRAY['Sci-fi'], 'physical'),
(gen_random_uuid(), 'A jövő árnyai', 'Molnár Levente', 'A mesterséges intelligencia uralta világban egy lázadó embercsoport küzdelme.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 4690.00, 100, 'https://via.placeholder.com/150', ARRAY['Sci-fi'], 'physical'),

-- Fantasy
(gen_random_uuid(), 'A Gyűrűk Ura I. - A Gyűrű Szövetsége', 'J. R. R. Tolkien', 'Egy varázslatos világ kezdete.', 'Európa', 'magyar', '2020-12-12', 5990.00, 100, 'https://via.placeholder.com/150', ARRAY['Fantasy'], 'physical'),
(gen_random_uuid(), 'Az Ezüst Sárkány Krónikái', 'Kovács Gergely', 'Egy mágikus világban egy kovácsfiú sorsa összefonódik a sárkányokkal.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 4290.00, 100, 'https://via.placeholder.com/150', ARRAY['Fantasy'], 'physical'),

-- Életrajz
(gen_random_uuid(), 'Steve Jobs', 'Walter Isaacson', 'Az Apple társalapítójának élete.', 'Vince', 'magyar', '2020-12-12', 6490.00, 100, 'https://via.placeholder.com/150', ARRAY['Életrajz'], 'physical'),
(gen_random_uuid(), 'Egy tanár vallomásai', 'Tóth Eszter', 'Egy vidéki magyar tanár személyes történetei.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 3790.00, 100, 'https://via.placeholder.com/150', ARRAY['Életrajz'], 'physical'),

-- Önfejlesztés
(gen_random_uuid(), 'A szokások ereje', 'Charles Duhigg', 'Hogyan alakítják szokásaink az életünket.', 'HVG Könyvek', 'magyar', '2020-12-12', 4990.00, 100, 'https://via.placeholder.com/150', ARRAY['Önfejlesztés'], 'physical'),
(gen_random_uuid(), 'A fókusz művészete', 'Nagy András', 'Hogyan koncentráljunk a céljainkra a zajos világban.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 3590.00, 100, 'https://via.placeholder.com/150', ARRAY['Önfejlesztés'], 'physical'),


-- Történelem
(gen_random_uuid(), 'A második világháború története', 'Antony Beevor', 'A háború teljes története.', 'Corvina', 'magyar', '2020-12-12', 6990.00, 100, 'https://via.placeholder.com/150', ARRAY['Történelem'], 'physical'),
(gen_random_uuid(), 'Árpád népe', 'Szabó Tamás', 'A honfoglalás és az államalapítás kora regényes formában.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 4490.00, 100, 'https://via.placeholder.com/150', ARRAY['Történelem'], 'physical'),

-- Gyermekkönyv
(gen_random_uuid(), 'Micimackó', 'A. A. Milne', 'Klasszikus mesekönyv Micimackóról és barátairól.', 'Ciceró', 'magyar', '2020-12-12', 2990.00, 100, 'https://via.placeholder.com/150', ARRAY['Gyermekkönyv'], 'physical'),
(gen_random_uuid(), 'A kis mókus kalandjai', 'Bognár Anna', 'Tanulságos mesék a barátságról.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 2590.00, 100, 'https://via.placeholder.com/150', ARRAY['Gyermekkönyv'], 'physical'),

-- Ifjúsági
(gen_random_uuid(), 'Harry Potter és a bölcsek köve', 'J. K. Rowling', 'Harry első kalandja a varázsvilágban.', 'Animus', 'magyar', '2020-12-12', 3990.00, 100, 'https://via.placeholder.com/150', ARRAY['Ifjúsági'], 'physical'),
(gen_random_uuid(), 'Az elveszett idő nyomában', 'Tóth Máté', 'Időutazó kamaszok kalandos története.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 3690.00, 100, 'https://via.placeholder.com/150', ARRAY['Ifjúsági'], 'physical'),

-- Thriller
(gen_random_uuid(), 'A Da Vinci-kód', 'Dan Brown', 'Egy összeesküvés és egy titkos társaság története.', 'Gabo', 'magyar', '2020-12-12', 4590.00, 100, 'https://via.placeholder.com/150', ARRAY['Thriller'], 'physical'),
(gen_random_uuid(), 'A csend labirintusa', 'Horváth Lilla', 'Egy újságírónő veszélyes összeesküvés nyomába ered.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 3890.00, 100, 'https://via.placeholder.com/150', ARRAY['Thriller'], 'physical'),

-- Üzleti
(gen_random_uuid(), 'Gazdag papa, szegény papa', 'Robert T. Kiyosaki', 'Pénzügyi intelligencia alapjai.', 'Bagolyvár', 'magyar', '2020-12-12', 4990.00, 100, 'https://via.placeholder.com/150', ARRAY['Üzleti'], 'physical'),
(gen_random_uuid(), 'A siker képlete', 'Farkas Zoltán', 'Modern üzleti stratégiák vállalkozóknak.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 4590.00, 100, 'https://via.placeholder.com/150', ARRAY['Üzleti'], 'physical'),

-- Egészség és életmód
(gen_random_uuid(), 'Teljes élet cukor nélkül', 'Sarah Wilson', 'Élet cukor nélkül.', 'HVG Könyvek', 'magyar', '2020-12-12', 3990.00, 100, 'https://via.placeholder.com/150', ARRAY['Egészség és életmód'], 'physical'),
(gen_random_uuid(), 'Lélegezz mélyen!', 'Kiss Adrienn', 'Mindfulness és légzőgyakorlatok a hétköznapokra.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 3290.00, 100, 'https://via.placeholder.com/150', ARRAY['Egészség és életmód'], 'physical'),

-- Utazás
(gen_random_uuid(), 'Lonely Planet - Olaszország', 'Lonely Planet', 'Útikönyv Olaszországról.', 'Lonely Planet', 'magyar', '2020-12-12', 6990.00, 100, 'https://via.placeholder.com/150', ARRAY['Utazás'], 'physical'),
(gen_random_uuid(), 'Titkos Magyarország', 'Varga Bence', 'Ismeretlen hazai tájak felfedezése.', 'Fiktív Kiadó', 'magyar', '2020-12-12', 3790.00, 100, 'https://via.placeholder.com/150', ARRAY['Utazás'], 'physical');
