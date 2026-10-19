package com.campus.canteen.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity @Table(name="canteen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Canteen {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="canteen_id") private Long id;
 @Column(nullable=false,unique=true) private String name;
 @Column(nullable=false) private String location;
 @Column(name="opening_time",nullable=false) private LocalTime openingTime;
 @Column(name="closing_time",nullable=false) private LocalTime closingTime;
 @Column(nullable=false) private Boolean active;
}
