package com.campus.canteen.controller;
import com.campus.canteen.model.Customer;
import com.campus.canteen.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins="http://localhost:5173")
public class CustomerController {
 private final CustomerRepository repository;
 public CustomerController(CustomerRepository repository){this.repository=repository;}
 @GetMapping public List<Customer> all(){return repository.findAll();}
 @GetMapping("/{id}") public ResponseEntity<Customer> one(@PathVariable Long id){return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());}
 @PostMapping public Customer create(@RequestBody Customer value){return repository.save(value);}
 @PutMapping("/{id}") public ResponseEntity<Customer> update(@PathVariable Long id,@RequestBody Customer value){if(!repository.existsById(id))return ResponseEntity.notFound().build();value.setId(id);return ResponseEntity.ok(repository.save(value));}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){if(!repository.existsById(id))return ResponseEntity.notFound().build();repository.deleteById(id);return ResponseEntity.noContent().build();}
}
