package com.vishal.manageMoney.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vishal.manageMoney.dto.ExpenseRequestDTO;
import com.vishal.manageMoney.dto.ExpenseResponseDTO;
import com.vishal.manageMoney.dto.ExpenseUpdateDTO;
import com.vishal.manageMoney.service.ExpenseService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
@RequestMapping("/api/expense")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // to add an expense
    @PostMapping()
    public ResponseEntity<?> addExpense(@RequestBody ExpenseRequestDTO requestDTO) {
        ExpenseResponseDTO responseDTO;
        try {
           responseDTO = expenseService.addExpense(requestDTO);
        } catch(Exception e) {
            return ResponseEntity.status(500).body("Expense could not be added : " + e.getMessage());
        }
        return ResponseEntity.status(201).body(responseDTO);
    }

    // to get all expense of a user by id
    @GetMapping("user/{id}/all")
    public ResponseEntity<?> getAllExpensesByUserId(@PathVariable Long id) {
        List<ExpenseResponseDTO> expenses;
        try {
            expenses = expenseService.getAllExpensesByUserId(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not retrieve expenses: " + e.getMessage());
        }
        return ResponseEntity.status(200).body(expenses);
    }


    // to edit an expense by id
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody ExpenseUpdateDTO dto) {
        ExpenseResponseDTO responseDTO;
        try {
            responseDTO = expenseService.updateExpense(id, dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not update expense: " + e.getMessage());
        }
        return ResponseEntity.status(200).body(responseDTO);
    }


    // to delete an expense
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        String message;
        try {
            message = expenseService.deleteExpense(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not delete expense: " + e.getMessage());
        }
        return ResponseEntity.status(200).body(message);
    }


    // to get an expense by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id) {
        ExpenseResponseDTO expense;
        try {
            expense = expenseService.getExpenseById(id);
        } catch(Exception e) {
            return ResponseEntity.status(500).body("Could not fetch expense");
        }
        return ResponseEntity.status(200).body(expense);
    }
}