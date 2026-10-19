package com.campus.canteen.repository;
import com.campus.canteen.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FoodItemRepository extends JpaRepository<FoodItem,Long> {}
