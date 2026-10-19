package com.campus.canteen.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins="http://localhost:5173")
public class AnalyticsController {
    private final JdbcTemplate jdbc;
    public AnalyticsController(JdbcTemplate jdbc){ this.jdbc=jdbc; }

    @GetMapping("/health")
    public Map<String,Object> health(){
        Map<String,Object> r=new LinkedHashMap<>();
        try { jdbc.queryForObject("SELECT 1",Integer.class); r.put("status","UP"); r.put("database","CONNECTED"); }
        catch(Exception e){ r.put("status","DOWN"); r.put("database","DISCONNECTED"); }
        return r;
    }

    @GetMapping("/dashboard/summary")
    public Map<String,Object> summary(){
        Map<String,Object> r=new LinkedHashMap<>();
        r.put("canteens",jdbc.queryForObject("SELECT COUNT(*) FROM canteen",Integer.class));
        r.put("items",jdbc.queryForObject("SELECT COUNT(*) FROM food_item",Integer.class));
        r.put("customers",jdbc.queryForObject("SELECT COUNT(*) FROM customer",Integer.class));
        r.put("transactions",jdbc.queryForObject("SELECT COUNT(*) FROM sale",Integer.class));
        r.put("unitsSold",jdbc.queryForObject("SELECT COALESCE(SUM(quantity),0) FROM sale",Long.class));
        r.put("revenue",jdbc.queryForObject("SELECT COALESCE(SUM(quantity*unit_price),0) FROM sale",Double.class));
        r.put("averageRating",jdbc.queryForObject("SELECT COALESCE(AVG(rating),0) FROM rating",Double.class));
        return r;
    }

    @GetMapping("/analytics/top-items")
    public List<Map<String,Object>> topItems(){
        return jdbc.queryForList("SELECT fi.name item,c.name canteen,SUM(s.quantity) unitsSold,ROUND(SUM(s.quantity*s.unit_price),2) revenue FROM sale s JOIN food_item fi ON fi.item_id=s.item_id JOIN canteen c ON c.canteen_id=fi.canteen_id GROUP BY fi.item_id,fi.name,c.name ORDER BY unitsSold DESC LIMIT 8");
    }

    @GetMapping("/analytics/peak-hours")
    public List<Map<String,Object>> peakHours(){
        return jdbc.queryForList("SELECT HOUR(sale_time) hour,SUM(quantity) unitsSold,COUNT(*) transactions FROM sale GROUP BY HOUR(sale_time) ORDER BY hour");
    }

    @GetMapping("/analytics/canteen-performance")
    public List<Map<String,Object>> canteens(){
        return jdbc.queryForList("SELECT canteen,location,item_count itemCount,units_sold unitsSold,ROUND(estimated_revenue,2) revenue,ROUND(average_rating,2) averageRating FROM vw_canteen_performance ORDER BY revenue DESC");
    }

    @GetMapping("/analytics/rating-performance")
    public List<Map<String,Object>> ratings(){
        return jdbc.queryForList("SELECT fi.name item,c.name canteen,ROUND(COALESCE(AVG(r.rating),0),2) averageRating,COUNT(DISTINCT r.rating_id) ratingCount,COALESCE((SELECT SUM(s2.quantity) FROM sale s2 WHERE s2.item_id=fi.item_id),0) unitsSold FROM food_item fi JOIN canteen c ON c.canteen_id=fi.canteen_id LEFT JOIN rating r ON r.item_id=fi.item_id GROUP BY fi.item_id,fi.name,c.name ORDER BY averageRating DESC");
    }



    @GetMapping("/analytics/item-insights")
    public Map<String,Object> itemInsights(@RequestParam("item") String item) {
        String term = "%" + item.trim() + "%";
        List<Map<String,Object>> matches = jdbc.queryForList("""
            SELECT fi.item_id id, fi.name item, fi.category, fi.price, fi.available,
                   c.name canteen, c.location
            FROM food_item fi
            JOIN canteen c ON c.canteen_id = fi.canteen_id
            WHERE LOWER(fi.name) LIKE LOWER(?)
            ORDER BY CASE WHEN LOWER(fi.name)=LOWER(?) THEN 0 ELSE 1 END, fi.name
            LIMIT 1
        """, term, item.trim());
        if (matches.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Food item not found");
        }
        Map<String,Object> base = matches.get(0);
        Long id = ((Number) base.get("id")).longValue();
        Map<String,Object> result = new LinkedHashMap<>();
        result.putAll(base);
        Map<String,Object> summary = jdbc.queryForMap("""
            SELECT COALESCE(SUM(s.quantity),0) unitsSold,
                   COALESCE(SUM(s.quantity*s.unit_price),0) revenue,
                   COUNT(s.sale_id) transactionCount,
                   COALESCE((SELECT AVG(r.rating) FROM rating r WHERE r.item_id=?),0) averageRating,
                   (SELECT COUNT(*) FROM rating r WHERE r.item_id=?) ratingCount,
                   (SELECT DATE_FORMAT(MAX(s2.sale_date),'%Y-%m-%d') FROM sale s2 WHERE s2.item_id=?) lastSaleDate
            FROM sale s WHERE s.item_id=?
        """, id, id, id, id);
        result.put("summary", summary);
        result.put("dailySales", jdbc.queryForList("""
            SELECT DATE_FORMAT(sale_date,'%Y-%m-%d') saleDate,
                   SUM(quantity) unitsSold,
                   ROUND(SUM(quantity*unit_price),2) revenue
            FROM sale WHERE item_id=?
            GROUP BY sale_date ORDER BY sale_date
        """, id));
        result.put("hourlyDemand", jdbc.queryForList("""
            SELECT HOUR(sale_time) hour, SUM(quantity) unitsSold, COUNT(*) transactions
            FROM sale WHERE item_id=? GROUP BY HOUR(sale_time) ORDER BY hour
        """, id));
        result.put("recentSales", jdbc.queryForList("""
            SELECT DATE_FORMAT(sale_date,'%Y-%m-%d') saleDate,
                   DATE_FORMAT(sale_time,'%H:%i') saleTime,
                   quantity, unit_price unitPrice,
                   ROUND(quantity*unit_price,2) revenue
            FROM sale WHERE item_id=? ORDER BY sale_date DESC, sale_time DESC LIMIT 20
        """, id));
        result.put("reviews", jdbc.queryForList("""
            SELECT c.name customer, r.rating, r.review_text reviewText,
                   DATE_FORMAT(r.rating_date,'%Y-%m-%d') ratingDate
            FROM rating r JOIN customer c ON c.customer_id=r.customer_id
            WHERE r.item_id=? ORDER BY r.rating_date DESC, r.rating_id DESC LIMIT 20
        """, id));
        return result;
    }

    @GetMapping("/analytics/daily-sales")
    public List<Map<String,Object>> daily(){
        return jdbc.queryForList("SELECT DATE_FORMAT(sale_date,'%Y-%m-%d') saleDate,units_sold unitsSold,ROUND(estimated_revenue,2) revenue,transaction_count transactions FROM vw_daily_sales ORDER BY sale_date");
    }
}
