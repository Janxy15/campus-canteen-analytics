USE campus_canteen;

-- 1 Most sold items
SELECT fi.name AS food_item,c.name AS canteen,SUM(s.quantity) AS units_sold
FROM sale s JOIN food_item fi ON fi.item_id=s.item_id JOIN canteen c ON c.canteen_id=fi.canteen_id
GROUP BY fi.item_id,fi.name,c.name ORDER BY units_sold DESC;

-- 2 Peak hours
SELECT HOUR(sale_time) AS sale_hour,SUM(quantity) AS units_sold,COUNT(*) AS transactions
FROM sale GROUP BY HOUR(sale_time) ORDER BY units_sold DESC;

-- 3 Best canteen
SELECT c.name,SUM(s.quantity) AS units_sold,SUM(s.quantity*s.unit_price) AS revenue
FROM sale s JOIN food_item fi ON fi.item_id=s.item_id JOIN canteen c ON c.canteen_id=fi.canteen_id
GROUP BY c.canteen_id,c.name ORDER BY revenue DESC;

-- 4 Average rating
SELECT fi.name,ROUND(AVG(r.rating),2) AS average_rating,COUNT(r.rating_id) AS rating_count
FROM food_item fi JOIN rating r ON r.item_id=fi.item_id
GROUP BY fi.item_id,fi.name ORDER BY average_rating DESC;

-- 5 Sales versus ratings
SELECT fi.name,COALESCE(SUM(s.quantity),0) AS units_sold,COALESCE(ROUND(AVG(r.rating),2),0) AS average_rating
FROM food_item fi LEFT JOIN sale s ON s.item_id=fi.item_id LEFT JOIN rating r ON r.item_id=fi.item_id
GROUP BY fi.item_id,fi.name ORDER BY units_sold DESC;

-- 6 Date comparison
SELECT sale_date,SUM(quantity) AS units_sold,SUM(quantity*unit_price) AS revenue
FROM sale GROUP BY sale_date ORDER BY sale_date;

-- 7 Subquery: items above average total quantity
SELECT fi.name,SUM(s.quantity) AS units_sold
FROM food_item fi JOIN sale s ON s.item_id=fi.item_id
GROUP BY fi.item_id,fi.name
HAVING SUM(s.quantity) > (SELECT AVG(t.item_total) FROM (SELECT SUM(quantity) item_total FROM sale GROUP BY item_id) t);

-- 8 Views
SELECT * FROM vw_item_performance ORDER BY units_sold DESC;
SELECT * FROM vw_canteen_performance ORDER BY estimated_revenue DESC;
SELECT * FROM vw_daily_sales ORDER BY sale_date;

-- 9 Indexes
SHOW INDEX FROM food_item;
SHOW INDEX FROM sale;
SHOW INDEX FROM rating;

-- 10. Owner item drill-down: replace 'Tea' with any food item name
SELECT fi.name AS item,
       c.name AS canteen,
       COALESCE(SUM(s.quantity),0) AS units_sold,
       COALESCE(SUM(s.quantity*s.unit_price),0) AS revenue,
       COALESCE(AVG(r.rating),0) AS average_rating,
       COUNT(DISTINCT r.rating_id) AS rating_count
FROM food_item fi
JOIN canteen c ON c.canteen_id = fi.canteen_id
LEFT JOIN sale s ON s.item_id = fi.item_id
LEFT JOIN rating r ON r.item_id = fi.item_id
WHERE fi.name = 'Tea'
GROUP BY fi.item_id, fi.name, c.name;
