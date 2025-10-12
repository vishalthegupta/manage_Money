package com.vishal.manageMoney.repository;

import com.vishal.manageMoney.entity.Investment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    public List<Investment> findAllByUserId(Long userId);
}