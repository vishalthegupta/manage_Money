package com.vishal.manageMoney.controller;

import com.vishal.manageMoney.dto.IncomeRequestDTO;
import com.vishal.manageMoney.dto.IncomeResponseDTO;
import com.vishal.manageMoney.service.IncomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api/income")
@Validated
public class IncomeController {

   
    private IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    // Adds a new income record
    @PostMapping()
    public ResponseEntity<?> addIncome(@RequestBody IncomeRequestDTO incomeRequestDTO) {
        IncomeResponseDTO createdIncome;
        try {
            createdIncome = incomeService.addIncome(incomeRequestDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not add income");
        }
        return ResponseEntity.status(200).body(createdIncome);
    }

    // Retrieves a specific income record by ID
    @GetMapping("/{id}")
    public ResponseEntity<IncomeResponseDTO> getIncomeById(@PathVariable Long id) {
        Optional<IncomeResponseDTO> income = incomeService.getIncomeById(id);
        return income.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }


    // Retrieves all income of a user by its id
    @GetMapping("user/{id}/all")
    public ResponseEntity<?> getAllIncomeByUserId(@PathVariable Long id) {
        List<IncomeResponseDTO> incomeList;
        try {
            incomeList = incomeService.getAllIncomeByUserId(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not retrieve income records");
        }
        
        return ResponseEntity.status(200).body(incomeList);
    }


   

    // Updates an existing income record by ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncome(@PathVariable Long id, @RequestBody @Validated IncomeRequestDTO incomeRequestDTO) {
        IncomeResponseDTO updatedIncome;
        try {
            updatedIncome = incomeService.updateIncome(id, incomeRequestDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not update Income");
        }
        return ResponseEntity.status(200).body(updatedIncome);
    }

    // Deletes an income record by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id) {
       try {
           incomeService.deleteIncome(id);
       } catch (Exception e) {
        return ResponseEntity.status(500).body("Could not delete Income");
       }
       return ResponseEntity.status(200).body("Income deleted successfully");
    }
}