package com.vishal.manageMoney.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class IncomeResponseDTO {
    private Long id;
    private String source;
    private String category;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
}