package com.campus.canteen.repository;
import com.campus.canteen.model.Canteen;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CanteenRepository extends JpaRepository<Canteen,Long> {}
