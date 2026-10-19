DROP DATABASE IF EXISTS campus_canteen;
CREATE DATABASE campus_canteen;
USE campus_canteen;

CREATE TABLE canteen (
    canteen_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(150) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_canteen_hours CHECK (opening_time < closing_time)
);

CREATE TABLE food_item (
    item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    canteen_id BIGINT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_food_price CHECK (price >= 0),
    CONSTRAINT fk_food_canteen FOREIGN KEY (canteen_id)
        REFERENCES canteen(canteen_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE customer (
    customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    student_type VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    year_level INT,
    CONSTRAINT chk_customer_year CHECK (year_level IS NULL OR year_level BETWEEN 1 AND 5)
);

CREATE TABLE sale (
    sale_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT NOT NULL,
    sale_date DATE NOT NULL,
    sale_time TIME NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_sale_quantity CHECK (quantity > 0),
    CONSTRAINT chk_sale_price CHECK (unit_price >= 0),
    CONSTRAINT fk_sale_item FOREIGN KEY (item_id)
        REFERENCES food_item(item_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE rating (
    rating_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    review_text VARCHAR(500),
    rating_date DATE NOT NULL,
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT fk_rating_item FOREIGN KEY (item_id)
        REFERENCES food_item(item_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_rating_customer FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_food_canteen ON food_item(canteen_id);
CREATE INDEX idx_sale_item_date ON sale(item_id, sale_date);
CREATE INDEX idx_sale_date_time ON sale(sale_date, sale_time);
CREATE INDEX idx_rating_item ON rating(item_id);
CREATE INDEX idx_rating_customer ON rating(customer_id);

CREATE OR REPLACE VIEW vw_item_performance AS
SELECT fi.item_id, fi.name AS food_item, fi.category, c.name AS canteen, fi.price,
       COALESCE((SELECT SUM(s.quantity) FROM sale s WHERE s.item_id=fi.item_id),0) AS units_sold,
       COALESCE((SELECT SUM(s.quantity*s.unit_price) FROM sale s WHERE s.item_id=fi.item_id),0) AS estimated_revenue,
       COALESCE((SELECT AVG(r.rating) FROM rating r WHERE r.item_id=fi.item_id),0) AS average_rating,
       (SELECT COUNT(*) FROM rating r WHERE r.item_id=fi.item_id) AS rating_count
FROM food_item fi JOIN canteen c ON c.canteen_id=fi.canteen_id;

CREATE OR REPLACE VIEW vw_canteen_performance AS
SELECT c.canteen_id, c.name AS canteen, c.location,
       COUNT(DISTINCT fi.item_id) AS item_count,
       COALESCE(SUM(s.quantity),0) AS units_sold,
       COALESCE(SUM(s.quantity*s.unit_price),0) AS estimated_revenue,
       COALESCE(AVG(r.rating),0) AS average_rating
FROM canteen c
LEFT JOIN food_item fi ON fi.canteen_id=c.canteen_id
LEFT JOIN sale s ON s.item_id=fi.item_id
LEFT JOIN rating r ON r.item_id=fi.item_id
GROUP BY c.canteen_id,c.name,c.location;

CREATE OR REPLACE VIEW vw_daily_sales AS
SELECT sale_date,
       SUM(quantity) AS units_sold,
       SUM(quantity*unit_price) AS estimated_revenue,
       COUNT(*) AS transaction_count
FROM sale
GROUP BY sale_date;
