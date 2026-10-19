package com.campus.canteen.controller;
import com.campus.canteen.model.Rating;
import com.campus.canteen.repository.RatingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins="http://localhost:5173")
public class RatingController {
 private final RatingRepository repository;
 public RatingController(RatingRepository repository){this.repository=repository;}
 @GetMapping public List<Rating> all(){return repository.findAll();}
 @GetMapping("/{id}") public ResponseEntity<Rating> one(@PathVariable Long id){return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());}
 @PostMapping public Rating create(@RequestBody Rating value){return repository.save(value);}
 @PutMapping("/{id}") public ResponseEntity<Rating> update(@PathVariable Long id,@RequestBody Rating value){if(!repository.existsById(id))return ResponseEntity.notFound().build();value.setId(id);return ResponseEntity.ok(repository.save(value));}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){if(!repository.existsById(id))return ResponseEntity.notFound().build();repository.deleteById(id);return ResponseEntity.noContent().build();}
}
