package com.vishal.manageMoney.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoanUpdateDTO {

    @Size(max = 100, message = "Loan type must not exceed 100 characters.")
    private String type;

    @Size(max = 255, message = "Lender name must not exceed 255 characters.")
    private String lender;

    @Size(max = 500, message = "Description must not exceed 500 characters.")
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Principal amount must be greater than 0.")
    private Double principal;

    @DecimalMin(value = "0.0", inclusive = false, message = "Interest rate must be greater than 0.")
    private Double interestRate;

    @DecimalMin(value = "0.0", inclusive = false, message = "EMI must be greater than 0.")
    private Double emi;

    private LocalDate startDate;
    private LocalDate endDate;
}