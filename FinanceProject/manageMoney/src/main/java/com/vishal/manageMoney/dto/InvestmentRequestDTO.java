package com.vishal.manageMoney.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InvestmentRequestDTO {

    @NotBlank(message = "Investment type is required.")
    @Size(max = 100, message = "Investment type must not exceed 100 characters.")
    private String type;

    @NotBlank(message = "Institution name is required.")
    @Size(max = 255, message = "Institution name must not exceed 255 characters.")
    private String institution;

    @NotBlank(message = "Description is required.")
    @Size(max = 500, message = "Description must not exceed 500 characters.")
    private String description;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0.")
    private Double amount;

    @NotNull(message = "Investment date is required.")
    private LocalDate date;
}