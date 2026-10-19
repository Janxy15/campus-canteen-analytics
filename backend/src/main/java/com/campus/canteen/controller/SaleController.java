package com.campus.canteen.controller;
import com.campus.canteen.model.Sale;
import com.campus.canteen.repository.SaleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins="http://localhost:5173")
public class SaleController {
 private final SaleRepository repository;
 public SaleController(SaleRepository repository){this.repository=repository;}
 @GetMapping public List<Sale> all(){return repository.findAll();}
 @GetMapping("/{id}") public ResponseEntity<Sale> one(@PathVariable Long id){return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());}
 @PostMapping public Sale create(@RequestBody Sale value){return repository.save(value);}
 @PutMapping("/{id}") public ResponseEntity<Sale> update(@PathVariable Long id,@RequestBody Sale value){if(!repository.existsById(id))return ResponseEntity.notFound().build();value.setId(id);return ResponseEntity.ok(repository.save(value));}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){if(!repository.existsById(id))return ResponseEntity.notFound().build();repository.deleteById(id);return ResponseEntity.noContent().build();}
}
