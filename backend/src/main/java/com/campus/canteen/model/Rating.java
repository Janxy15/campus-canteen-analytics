package com.campus.canteen.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name="rating")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Rating {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="rating_id") private Long id;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="item_id",nullable=false) private FoodItem item;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="customer_id",nullable=false) private Customer customer;
 @Column(nullable=false) private BigDecimal rating;
 @Column(name="review_text") private String reviewText;
 @Column(name="rating_date",nullable=false) private LocalDate ratingDate;
}
