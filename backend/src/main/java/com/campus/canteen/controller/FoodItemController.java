package com.campus.canteen.controller;
import com.campus.canteen.model.FoodItem;
import com.campus.canteen.repository.FoodItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins="http://localhost:5173")
public class FoodItemController {
 private final FoodItemRepository repository;
 public FoodItemController(FoodItemRepository repository){this.repository=repository;}
 @GetMapping public List<FoodItem> all(){return repository.findAll();}
 @GetMapping("/{id}") public ResponseEntity<FoodItem> one(@PathVariable Long id){return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());}
 @PostMapping public FoodItem create(@RequestBody FoodItem value){return repository.save(value);}
 @PutMapping("/{id}") public ResponseEntity<FoodItem> update(@PathVariable Long id,@RequestBody FoodItem value){if(!repository.existsById(id))return ResponseEntity.notFound().build();value.setId(id);return ResponseEntity.ok(repository.save(value));}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){if(!repository.existsById(id))return ResponseEntity.notFound().build();repository.deleteById(id);return ResponseEntity.noContent().build();}
}
