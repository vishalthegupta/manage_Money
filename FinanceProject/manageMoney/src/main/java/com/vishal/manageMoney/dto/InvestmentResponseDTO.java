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
public class InvestmentResponseDTO {

    private Long id;
    private String type;
    private String institution;
    private String description;
    private Double amount;
    private LocalDate date;
}