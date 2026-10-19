# ER Diagram

CANTEEN (1) ---- (N) FOOD_ITEM (1) ---- (N) SALE
                         |
                         |
                         +---- (N) RATING (N) ---- (1) CUSTOMER

Main keys:
- Canteen.canteen_id -> Food_Item.canteen_id
- Food_Item.item_id -> Sale.item_id
- Food_Item.item_id -> Rating.item_id
- Customer.customer_id -> Rating.customer_id
