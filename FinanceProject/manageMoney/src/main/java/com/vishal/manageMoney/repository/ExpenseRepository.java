package com.vishal.manageMoney.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vishal.manageMoney.entity.Expense;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense , Long>{
    public List<Expense> findExpenseByUserId(Long userId);
}