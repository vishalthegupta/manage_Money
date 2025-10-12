package com.vishal.manageMoney.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class LoanRequestDTO {

    @NotBlank(message = "Loan type is required.")
    @Size(max = 100, message = "Loan type must not exceed 100 characters.")
    private String type;

    @NotBlank(message = "Lender name is required.")
    @Size(max = 255, message = "Lender name must not exceed 255 characters.")
    private String lender;

    @NotBlank(message = "Description is required.")
    @Size(max = 500, message = "Description must not exceed 500 characters.")
    private String description;

    @NotNull(message = "Principal amount is required.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Principal amount must be greater than 0.")
    private Double principal;

    @NotNull(message = "Interest rate is required.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Interest rate must be greater than 0.")
    private Double interestRate;

    @NotNull(message = "EMI is required.")
    @DecimalMin(value = "0.0", inclusive = false, message = "EMI must be greater than 0.")
    private Double emi;

    @NotNull(message = "Start date is required.")
    private LocalDate startDate;

    @NotNull(message = "End date is required.")
    private LocalDate endDate;
}