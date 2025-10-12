package com.vishal.manageMoney.repository;
import com.vishal.manageMoney.entity.Loan;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findLoanByUserId(Long userId);
}