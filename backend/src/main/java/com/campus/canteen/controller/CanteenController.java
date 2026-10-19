package com.campus.canteen.controller;
import com.campus.canteen.model.Canteen;
import com.campus.canteen.repository.CanteenRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/canteens")
@CrossOrigin(origins="http://localhost:5173")
public class CanteenController {
 private final CanteenRepository repository;
 public CanteenController(CanteenRepository repository){this.repository=repository;}
 @GetMapping public List<Canteen> all(){return repository.findAll();}
 @GetMapping("/{id}") public ResponseEntity<Canteen> one(@PathVariable Long id){return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());}
 @PostMapping public Canteen create(@RequestBody Canteen value){return repository.save(value);}
 @PutMapping("/{id}") public ResponseEntity<Canteen> update(@PathVariable Long id,@RequestBody Canteen value){if(!repository.existsById(id))return ResponseEntity.notFound().build();value.setId(id);return ResponseEntity.ok(repository.save(value));}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){if(!repository.existsById(id))return ResponseEntity.notFound().build();repository.deleteById(id);return ResponseEntity.noContent().build();}
}
