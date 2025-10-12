package com.vishal.manageMoney.service;

import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.vishal.manageMoney.dto.ExpenseRequestDTO;
import com.vishal.manageMoney.dto.ExpenseResponseDTO;
import com.vishal.manageMoney.dto.ExpenseUpdateDTO;
import com.vishal.manageMoney.entity.Expense;
import com.vishal.manageMoney.entity.User;
import com.vishal.manageMoney.repository.UserRepository;
import com.vishal.manageMoney.utils.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;

import com.vishal.manageMoney.repository.ExpenseRepository;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    // setting up logger instance
    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);

    // constructor injection
    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository, JwtUtils jwtUtils) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    // Convert Expense to ExpenseResponseDTO
    public ExpenseResponseDTO convertToResponseDTO(Expense expense) {
        ExpenseResponseDTO responseDTO = new ExpenseResponseDTO(expense);
        return responseDTO;
    }

    // methods for adding expenses
    public ExpenseResponseDTO addExpense(ExpenseRequestDTO request) {

        // Extract token from current request
        HttpServletRequest httpRequest = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                .getRequest();
        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix
        Long userId = jwtUtils.getUserIdFromJwtToken(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();

        logger.info(user.toString());

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());
        expense.setCategory(request.getCategory());
        expense.setPaymentMode(request.getPaymentMode());

        expense.setUser(user);

        logger.info("Saving expense: " + expense);
        return convertToResponseDTO(expenseRepository.save(expense));
    }

    // get all expense of a user by id
    public List<ExpenseResponseDTO> getAllExpensesByUserId(Long userId) {
        List<Expense> expenses = expenseRepository.findExpenseByUserId(userId);
        return expenses.stream()
                .map(this::convertToResponseDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    // to update an expense
    public ExpenseResponseDTO updateExpense(Long id, ExpenseUpdateDTO dto) {
        // Fetch the existing expense from the database
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        
        if (dto.getDescription() != null)
            expense.setDescription(dto.getDescription());
        if (dto.getCategory() != null)
            expense.setCategory(dto.getCategory());
        if (dto.getAmount() != null)
            expense.setAmount(dto.getAmount());
        if (dto.getDate() != null)
            expense.setDate(dto.getDate());
        if (dto.getPaymentMode() != null)
            expense.setPaymentMode(dto.getPaymentMode());

        // Save the updated entity (JPA will update the record if the entity is managed)
        Expense updatedExpense = expenseRepository.save(expense);

        // Convert the updated entity to a response DTO and return it
        return convertToResponseDTO(updatedExpense);
    }


    // to delete an expense
    public String deleteExpense(Long id) {
        expenseRepository.deleteById(id);
        return "Expense deleted successfully";
    }

    // to get an expense by id
    public ExpenseResponseDTO getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return convertToResponseDTO(expense);
    }
}
