package com.campus.canteen.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name="food_item")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FoodItem {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="item_id") private Long id;
 @Column(nullable=false) private String name;
 @Column(nullable=false) private String category;
 @Column(nullable=false) private BigDecimal price;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="canteen_id",nullable=false) private Canteen canteen;
 @Column(nullable=false) private Boolean available;
}
