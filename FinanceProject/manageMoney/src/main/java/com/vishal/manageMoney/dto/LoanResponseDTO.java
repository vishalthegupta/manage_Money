package com.vishal.manageMoney.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoanResponseDTO {

    private Long id;
    private String type;
    private String lender;
    private String description;
    private Double principal;
    private Double interestRate;
    private Double emi;
    private LocalDate startDate;
    private LocalDate endDate;
}