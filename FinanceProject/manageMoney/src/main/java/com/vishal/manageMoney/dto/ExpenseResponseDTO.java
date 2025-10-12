package com.vishal.manageMoney.dto;

import java.time.LocalDate;

import com.vishal.manageMoney.entity.Expense;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseResponseDTO {

    private Long id;
    private String description;
    private String category;
    private Double amount;
    private LocalDate date;
    private String paymentMode;

    public ExpenseResponseDTO(Expense expense) {
        this.id = expense.getId();
        this.description = expense.getDescription();
        this.category = expense.getCategory();
        this.amount = expense.getAmount();
        this.date = expense.getDate();
        this.paymentMode = expense.getPaymentMode();
    }
}