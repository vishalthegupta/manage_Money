package com.vishal.manageMoney.controller;

import com.vishal.manageMoney.dto.InvestmentRequestDTO;
import com.vishal.manageMoney.dto.InvestmentResponseDTO;
import com.vishal.manageMoney.dto.InvestmentUpdateDTO;
import com.vishal.manageMoney.service.InvestmentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investment")
@Validated
public class InvestmentController {

    
    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    // Adds a new investment record
    @PostMapping()
    public ResponseEntity<?> addInvestment(@Valid @RequestBody InvestmentRequestDTO investmentRequestDTO) {
        InvestmentResponseDTO createdInvestment;
        try {
            createdInvestment = investmentService.addInvestment(investmentRequestDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not add investment");
        }
        
        return ResponseEntity.status(200).body(createdInvestment);
    }


    // Retrieves all investment records for the authenticated user
    @GetMapping("user/{id}/all")
    public ResponseEntity<?> getAllInvestments(@PathVariable Long id) {
        List<InvestmentResponseDTO> investments;
        try {
            investments = investmentService.getAllInvestmentsByUserId(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not retrieve investments");
        }
        return ResponseEntity.status(200).body(investments);
    }



    // Retrieves a specific investment record by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getInvestmentById(@PathVariable Long id) {
        InvestmentResponseDTO responseDTO;
        try {
            responseDTO = investmentService.getInvestmentById(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not retrieve investment");
        }
        return ResponseEntity.status(200).body(responseDTO);
    }



    // Updates an existing investment record by ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvestment(@PathVariable Long id, @RequestBody @Validated InvestmentUpdateDTO investmentUpdateDTO) {
        InvestmentResponseDTO responseDTO;
        try {
            responseDTO = investmentService.updateInvestment(id, investmentUpdateDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not update investment : " + e.getMessage());
        }
        return ResponseEntity.status(200).body(responseDTO);
    }


    // Deletes an investment record by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvestment(@PathVariable Long id) {
        String response = "";
        try {
            response = investmentService.deleteInvestment(id);
        } catch (Exception e) {
           ResponseEntity.status(500).body("Could not delete investment");
        }
        return ResponseEntity.status(200).body(response);
    }
}