package com.vishal.manageMoney.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "loans")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Loan type is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String type; // e.g., Home, Personal, Education

    @NotBlank(message = "Lender name is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String lender;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    @Column(nullable = false)
    private String description;

    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    @Column(nullable = false)
    private Double principal;

    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Interest rate must be greater than 0")
    @Column(nullable = false)
    private Double interestRate; // in percentage

    @NotNull(message = "EMI is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "EMI must be greater than 0")
    @Column(nullable = false)
    private Double emi; // in rupees

    @NotNull(message = "Start date is required")
    @Column(nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(nullable = false)
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}