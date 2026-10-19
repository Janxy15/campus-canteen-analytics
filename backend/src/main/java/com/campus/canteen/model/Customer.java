package com.campus.canteen.model;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="customer")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Customer {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="customer_id") private Long id;
 @Column(nullable=false) private String name;
 @Column(name="student_type",nullable=false) private String studentType;
 private String department;
 @Column(name="year_level") private Integer yearLevel;
}
