-- Этап 8: веб-верификация каталога компаний (Минск + Москва).
-- Удаление дублей/непроверяемых, актуализация адресов/цен/контактов,
-- 4 новые компании Минска + UberClean Москвы, обновление рейтингов Яндекс.Карт.
-- Применение: npx wrangler d1 execute cleaning-rating-db --remote --file=migrations/seed-stage8.sql
-- Идемпотентно: DELETE + UPDATE по id, INSERT OR REPLACE для новых и рейтингов.

-- ============ 1. Удаление: freshclean (дубль телефона), ladyclean (заглушка УНП), skyclean (решение владельца) ============
DELETE FROM `company_categories` WHERE `company_id` IN ('freshclean', 'ladyclean', 'skyclean');
DELETE FROM `rating_sources` WHERE `company_id` IN ('freshclean', 'ladyclean', 'skyclean');
DELETE FROM `cleaning_companies` WHERE `id` IN ('freshclean', 'ladyclean', 'skyclean');

-- ============ 2. Минск: актуализация существующих ============
UPDATE `cleaning_companies` SET `price_from` = 2.7, `updated_at` = 1795604131197 WHERE `id` = 'spectrclean';

UPDATE `cleaning_companies` SET `name` = 'Чистый Кит', `legal_name` = 'ООО «ВИРИКС Групп»', `address` = 'ул. Макаёнка, 12Г', `phone` = '+375 29 132-82-53', `price_unit` = '1-комн.', `updated_at` = 1795604131197 WHERE `id` = 'kitt';

UPDATE `cleaning_companies` SET `phone` = '+375 29 684-67-55', `email` = 'clean-clean.minsk@yandex.by', `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'cleanclean';

UPDATE `cleaning_companies` SET `price_unit` = '1-комн.', `updated_at` = 1795604131197 WHERE `id` = 'freshroom';

UPDATE `cleaning_companies` SET `legal_name` = 'ЧУП «ЗАУБЕР ГРУПП»', `address` = 'ул. Платонова, 10, оф. 102', `price_from` = 99, `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'sauber';

UPDATE `cleaning_companies` SET `address` = 'ул. Беломорская, 23', `price_unit` = 'мес', `updated_at` = 1795604131197 WHERE `id` = 'cleanoff';

UPDATE `cleaning_companies` SET `price_from` = 115, `price_unit` = '1-комн.', `updated_at` = 1795604131197 WHERE `id` = 'purifi';

UPDATE `cleaning_companies` SET `legal_name` = 'ООО «ГРЯЗИ НЕТ»', `price_from` = 3, `updated_at` = 1795604131197 WHERE `id` = 'gryazi-net';

UPDATE `cleaning_companies` SET `description` = 'Клининг для бизнеса в Минске с 2021 года. Регулярная и генеральная уборка офисов, уборка после ремонта, сезонная мойка окон. Работа с помещениями до 2000+ м².', `price_from` = 10, `experience_years` = 4, `updated_at` = 1795604131197 WHERE `id` = 'nesoda';

UPDATE `cleaning_companies` SET `price_from` = 1, `updated_at` = 1795604131197 WHERE `id` = 'cleanup';

-- ============ 3. Минск: новые компании ============
INSERT OR REPLACE INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('getclean', 'getclean', 'GetClean', 'ООО «Гетклин»', 'BY', 'Минская', 'Минск', 'ул. Притыцкого, 29', 'Уборка квартир и домов в Минске с онлайн-бронированием: поддерживающая, генеральная, после ремонта, мойка окон. Разовая уборка 1-комнатной от 76 BYN, по абонементу дешевле.', 'https://getclean.by', '+375 29 133-12-13', NULL, NULL, 76, '1-комн.', NULL, NULL, '["Онлайн-бронирование","Абонемент со скидкой","500+ отзывов на картах"]', NULL, 0, 0, 'published', 1795604131197, 1795604131197);
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('getclean', 'apartments');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('getclean', 'deep-cleaning');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('getclean', 'post-renovation');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('getclean', 'windows');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('getclean', 'upholstery');

INSERT OR REPLACE INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('greencleaning', 'greencleaning', 'GreenCleaning', 'ООО «Гринклининг»', 'BY', 'Минская', 'Минск', 'ул. Алеся Гаруна, 25, корп. 1Н', 'Клининг для бизнеса и частных клиентов в Минске: уборка офисов, уборка после ремонта от 4 BYN/м², химчистка мебели и ковров от 5 BYN/м².', 'https://greencleaning.by', '+375 29 638-38-20', NULL, NULL, 4, 'м²', NULL, NULL, '["B2B и частные клиенты","Химчистка от 5 BYN/м²"]', NULL, 0, 0, 'published', 1795604131197, 1795604131197);
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('greencleaning', 'offices');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('greencleaning', 'post-renovation');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('greencleaning', 'deep-cleaning');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('greencleaning', 'upholstery');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('greencleaning', 'apartments');

INSERT OR REPLACE INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('alfaclean', 'alfaclean', 'Альфа Клининг', NULL, 'BY', 'Минская', 'Минск', 'ул. Карла Либкнехта, 66', 'Клининговая компания в Минске с 2018 года: уборка квартир от 39 BYN, офисы и коммерческие помещения, работа круглосуточно.', 'https://alfaclean.by', '+375 44 546-61-79', NULL, NULL, 39, 'уборка', 7, NULL, '["Работаем 24/7","С 2018 года"]', NULL, 0, 0, 'published', 1795604131197, 1795604131197);
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('alfaclean', 'apartments');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('alfaclean', 'offices');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('alfaclean', 'deep-cleaning');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('alfaclean', 'post-renovation');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('alfaclean', 'windows');

INSERT OR REPLACE INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('cleantry', 'cleantry', 'Клинтри', NULL, 'BY', 'Минская', 'Минск', 'ул. Мележа, 1, оф. 615', 'Уборка квартир и офисов в Минске: поддерживающая и генеральная уборка, мойка окон, химчистка мебели. Однокомнатная квартира от 150 BYN.', 'https://cleantry.by', '+375 29 336-81-33', NULL, NULL, 150, '1-комн.', NULL, NULL, '["Квартиры и офисы","Химчистка мебели"]', NULL, 0, 0, 'published', 1795604131197, 1795604131197);
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleantry', 'apartments');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleantry', 'offices');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleantry', 'windows');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleantry', 'upholstery');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleantry', 'deep-cleaning');

-- ============ 4. Москва: цены, контакты, адреса ============
UPDATE `cleaning_companies` SET `address` = 'ул. Ольховская, 15', `description` = 'Клининговая компания в Москве: уборка квартир и офисов, генеральная и послестроительная уборка, химчистка мебели и мытьё окон.', `price_from` = 80, `price_unit` = 'м²', `tags` = '["Квартиры и офисы","Химчистка мебели"]', `updated_at` = 1795604131197 WHERE `id` = 'cleanon';

UPDATE `cleaning_companies` SET `price_from` = 80, `price_unit` = 'м²', `updated_at` = 1795604131197 WHERE `id` = 'colibri-cleaning';

UPDATE `cleaning_companies` SET `price_from` = 80, `price_unit` = 'м²', `updated_at` = 1795604131197 WHERE `id` = 'klining24';

UPDATE `cleaning_companies` SET `price_from` = 3900, `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'domovenok';

UPDATE `cleaning_companies` SET `address` = 'ул. Вятская, 27, стр. 15', `price_from` = 2790, `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'qlean';

UPDATE `cleaning_companies` SET `price_from` = 70, `price_unit` = 'м²', `updated_at` = 1795604131197 WHERE `id` = 'uborka24';

UPDATE `cleaning_companies` SET `price_from` = 2990, `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'siriusclean';

UPDATE `cleaning_companies` SET `address` = 'Большой Каретный пер., 22, стр. 3', `phone` = '+7 495 212-93-54', `email` = 'order2@annushka.su', `price_from` = 2999, `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'annushka';

UPDATE `cleaning_companies` SET `legal_name` = 'ООО «Чистюля»', `address` = 'ул. Большая Филёвская, 32, корп. 3', `phone` = '+7 495 151-25-30', `price_from` = 3390, `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'chistyulya';

UPDATE `cleaning_companies` SET `name` = 'CleanYou', `address` = 'Москворецкая наб., 7', `phone` = '+7 495 120-60-79', `price_from` = 4500, `price_unit` = 'уборка', `updated_at` = 1795604131197 WHERE `id` = 'cleanyou';

-- ============ 5. Москва: новая компания UberClean ============
INSERT OR REPLACE INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('uberclean', 'uberclean', 'UberClean', 'ИП Седов А.А.', 'RU', 'Московская', 'Москва', 'ул. Угрешская, 2, стр. 11', 'Клининговая компания в Москве: поддерживающая и генеральная уборка квартир, уборка после ремонта, химчистка мебели и ковров, уборка офисов. Онлайн-заказ круглосуточно.', 'https://uberclean24.ru', '+7 495 159-78-70', 'feedback@uberclean24.ru', NULL, 3390, 'уборка', NULL, NULL, '["Онлайн-заказ 24/7","Химчистка мебели и ковров"]', NULL, 0, 0, 'published', 1795604131197, 1795604131197);
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('uberclean', 'apartments');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('uberclean', 'offices');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('uberclean', 'deep-cleaning');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('uberclean', 'post-renovation');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('uberclean', 'upholstery');
INSERT OR REPLACE INTO `company_categories` (`company_id`, `category_id`) VALUES ('uberclean', 'windows');

-- ============ 6. Рейтинги Яндекс.Карт: актуализация + новые источники ============
INSERT OR REPLACE INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('cleanon-rating', 'cleanon', 'yandex', 'https://yandex.ru/maps/org/cleanon/80475233880/', 5.0, 1438, 1795604131197);
INSERT OR REPLACE INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('klining24-rating', 'klining24', 'yandex', 'https://yandex.ru/maps/org/klining24/96060614610/', 5.0, 214, 1795604131197);
INSERT OR REPLACE INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('qlean-rating', 'qlean', 'yandex', 'https://yandex.ru/maps/org/qlean/49428629026/', 4.2, 2299, 1795604131197);
INSERT OR REPLACE INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('annushka-rating', 'annushka', 'yandex', 'https://yandex.ru/maps/org/annushka/54514778664/', 4.9, 1703, 1795604131197);
INSERT OR REPLACE INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('chistyulya-rating', 'chistyulya', 'yandex', 'https://yandex.ru/maps/org/chistyulya/170101114128/', 4.7, 70, 1795604131197);
INSERT OR REPLACE INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('uberclean-rating', 'uberclean', 'yandex', 'https://yandex.ru/maps/org/uberclean/54478485356/', 5.0, 551, 1795604131197);
