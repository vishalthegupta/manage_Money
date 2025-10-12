package com.vishal.manageMoney.controller;

import com.vishal.manageMoney.dto.LoanRequestDTO;
import com.vishal.manageMoney.dto.LoanResponseDTO;
import com.vishal.manageMoney.dto.LoanUpdateDTO;
import com.vishal.manageMoney.service.LoanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan")
public class LoanController {

    private final LoanService loanService;

    // Constructor injection
    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    // Adds a new loan record
    @PostMapping()
    public ResponseEntity<?> addLoan(@RequestBody LoanRequestDTO loanRequestDTO) {
        LoanResponseDTO responseDTO;
        try {
            responseDTO = loanService.addLoan(loanRequestDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not add the loan");
        }
                    
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }


    // Retrieves all loan records for the authenticated user
    @GetMapping("/user/{userId}/all")
    public ResponseEntity<?> getAllLoans(@PathVariable Long userId) {
        List<LoanResponseDTO> loans;
        try {
            loans = loanService.getAllLoans(userId);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not retrieve loans : " + e.getMessage());
        }
        return ResponseEntity.status(200).body(loans);
    }


    // Retrieves a specific loan record by its ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getLoanById(@PathVariable Long id) {
        LoanResponseDTO loan;
        try {
            loan = loanService.getLoanById(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not retrieve loan with this id");
        }
        return ResponseEntity.status(200).body(loan);
    }


    // Updates an existing loan record by its ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLoan(@PathVariable Long id, @RequestBody LoanUpdateDTO loanUpdateDTO) {
        LoanResponseDTO updatedLoan;
        try {
            updatedLoan = loanService.updateLoan(id, loanUpdateDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not update loan with this id");
        }
        return ResponseEntity.status(200).body(updatedLoan);
    }


    // Deletes a loan record by its ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLoan(@PathVariable Long id) {
        String response = "";
        try {
            response = loanService.deleteLoan(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not delete loan with id : " + id);
        }
       return ResponseEntity.status(200).body(response);
    }
}