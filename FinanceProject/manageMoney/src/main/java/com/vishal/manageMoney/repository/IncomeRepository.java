package com.vishal.manageMoney.repository;

import com.vishal.manageMoney.entity.Income;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
    public List<Income> findByUserId(Long id);
}