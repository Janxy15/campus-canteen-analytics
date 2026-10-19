package com.campus.canteen.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity @Table(name="sale")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Sale {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="sale_id") private Long id;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="item_id",nullable=false) private FoodItem item;
 @Column(name="sale_date",nullable=false) private LocalDate saleDate;
 @Column(name="sale_time",nullable=false) private LocalTime saleTime;
 @Column(nullable=false) private Integer quantity;
 @Column(name="unit_price",nullable=false) private BigDecimal unitPrice;
}
