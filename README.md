# Campus Canteen Analytics — Complete DBMS Project

This package implements the proposed DBMS project from the Review 1 report:
Canteen, Food_Item, Sale, Customer and Rating; relational integrity; analytical SQL; views; indexes; lightweight Spring Boot connectivity; and a polished React analytics interface.

## Architecture
React/Vite -> Spring Boot REST API -> Spring Data JPA/JDBC -> MySQL

The database is the central component. The frontend is a visualization/connectivity layer, not a food-ordering/payment/delivery system.

## Main analytics
- Most sold food items
- Peak demand hours
- Best-performing canteens
- Average food ratings
- Sales versus ratings
- Estimated revenue
- Daily sales
- Date/canteen comparisons
- KPI dashboard

## DBMS concepts demonstrated
DDL, DML, PK/FK, constraints, referential integrity, normalized table separation, SELECT, WHERE, ORDER BY, GROUP BY, JOIN, SUM, AVG, COUNT, MAX, MIN, subquery, views and indexes.

## Setup

### 1. MySQL Workbench
Run:
1. `database/schema.sql`
2. `database/seed.sql`

Database name: `campus_canteen`

### 2. IntelliJ / Spring Boot
Open the `backend` folder in IntelliJ as a Maven project.

Edit:
`backend/src/main/resources/application.properties`

Set your MySQL password:
`spring.datasource.password=YOUR_MYSQL_PASSWORD`

Run:
`CampusCanteenAnalyticsApplication`

Backend:
`http://localhost:8080`

Health:
`http://localhost:8080/api/health`

### 3. React
Open terminal inside `frontend`:
```bash
npm install
npm run dev
```

Open:
`http://localhost:5173`

### 4. SQL demonstration
Open `database/queries.sql` to demonstrate the analytical queries used by the project.

See `SETUP_ORDER.txt` for the short startup sequence.

## Owner Insights

The frontend now includes an **Owner Insights** workspace. Search for any food item such as `Tea` and the application loads live item-level information from MySQL:

- current price, category, canteen and availability
- total units sold and estimated revenue
- transaction count and average rating
- last sale date
- daily sales trend
- demand by hour
- recent transaction rows
- customer ratings and review text

The same page also provides forms to record a new sale and add customer feedback. After saving, the selected item's analysis refreshes from the database.
