package com.vishal.manageMoney.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseUpdateDTO {
    private String description;
    private String category;
    private Double amount;
    private LocalDate date;
    private String paymentMode;
}

