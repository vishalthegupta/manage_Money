package com.vishal.manageMoney.service;

import com.vishal.manageMoney.dto.IncomeRequestDTO;
import com.vishal.manageMoney.dto.IncomeResponseDTO;
import com.vishal.manageMoney.entity.Income;
import com.vishal.manageMoney.entity.User;
import com.vishal.manageMoney.repository.IncomeRepository;
import com.vishal.manageMoney.repository.UserRepository;
import com.vishal.manageMoney.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;


    // Converts an Income entity to an IncomeResponseDTO
    private IncomeResponseDTO mapToResponseDTO(Income income) {
        IncomeResponseDTO responseDTO = new IncomeResponseDTO();

        responseDTO.setId(income.getId());
        responseDTO.setCategory(income.getCategory());
        responseDTO.setDescription(income.getDescription());
        responseDTO.setAmount(income.getAmount());
        responseDTO.setDate(income.getDate());
        responseDTO.setSource(income.getSource());
        
        return responseDTO;
    }

    // Adds a new income record to the database
    @Transactional
    public IncomeResponseDTO addIncome(IncomeRequestDTO incomeRequestDTO) {
        // Extract token from current request
        HttpServletRequest httpRequest = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix
        Long userId = jwtUtils.getUserIdFromJwtToken(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Income income = new Income();
        income.setCategory(incomeRequestDTO.getCategory());
        income.setDescription(incomeRequestDTO.getDescription());
        income.setAmount(incomeRequestDTO.getAmount());
        income.setDate(incomeRequestDTO.getDate());
        income.setSource(incomeRequestDTO.getSource());
        income.setUser(user);


        Income savedIncome = incomeRepository.save(income);
        return mapToResponseDTO(savedIncome);
    }


    // Retrieves a specific income record by its ID
    @Transactional(readOnly = true)
    public Optional<IncomeResponseDTO> getIncomeById(Long id) {
        return incomeRepository.findById(id).map(this::mapToResponseDTO);
    }


    // Retrieves all income records for a specific user by their ID
    public List<IncomeResponseDTO> getAllIncomeByUserId(Long userId) {
        return incomeRepository.findByUserId(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // Updates an existing income record by its ID
    @Transactional
    public IncomeResponseDTO updateIncome(Long id, IncomeRequestDTO incomeRequestDTO) {
        Income income = incomeRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Income not found with id: " + id));

       if (incomeRequestDTO.getCategory() != null) income.setCategory(incomeRequestDTO.getCategory());
       if (incomeRequestDTO.getDescription() != null) income.setDescription(incomeRequestDTO.getDescription());
       if (incomeRequestDTO.getAmount() != null) income.setAmount(incomeRequestDTO.getAmount());
       if (incomeRequestDTO.getDate() != null) income.setDate(incomeRequestDTO.getDate());
       if (incomeRequestDTO.getSource() != null) income.setSource(incomeRequestDTO.getSource());

        Income updatedIncome = incomeRepository.save(income);
        return mapToResponseDTO(updatedIncome);
    }

    // Deletes an income record by its ID
    @Transactional
    public boolean deleteIncome(Long id) {
        if (incomeRepository.existsById(id)) {
            incomeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}