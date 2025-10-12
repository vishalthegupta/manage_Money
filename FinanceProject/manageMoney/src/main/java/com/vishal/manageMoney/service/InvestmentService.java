package com.vishal.manageMoney.service;

import com.vishal.manageMoney.dto.InvestmentRequestDTO;
import com.vishal.manageMoney.dto.InvestmentResponseDTO;
import com.vishal.manageMoney.dto.InvestmentUpdateDTO;
import com.vishal.manageMoney.entity.Investment;
import com.vishal.manageMoney.entity.User;
import com.vishal.manageMoney.repository.InvestmentRepository;
import com.vishal.manageMoney.repository.UserRepository;
import com.vishal.manageMoney.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // Converts an Investment entity to an InvestmentResponseDTO
    private InvestmentResponseDTO mapToResponseDTO(Investment investment) {
        InvestmentResponseDTO responseDTO = new InvestmentResponseDTO();
        
        responseDTO.setId(investment.getId());
        responseDTO.setType(investment.getType());
        responseDTO.setInstitution(investment.getInstitution());
        responseDTO.setDescription(investment.getDescription());
        responseDTO.setAmount(investment.getAmount());
        responseDTO.setDate(investment.getDate());

        return responseDTO;
    }


    // Adds a new investment record to the database
    public InvestmentResponseDTO addInvestment(InvestmentRequestDTO investmentRequestDTO) {
        HttpServletRequest httpRequest = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        Long userId = jwtUtils.getUserIdFromJwtToken(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Investment investment = new Investment();
        investment.setType(investmentRequestDTO.getType());
        investment.setInstitution(investmentRequestDTO.getInstitution());
        investment.setDescription(investmentRequestDTO.getDescription());
        investment.setAmount(investmentRequestDTO.getAmount());
        investment.setDate(investmentRequestDTO.getDate());
        investment.setUser(user);

        Investment savedInvestment = investmentRepository.save(investment);
        return mapToResponseDTO(savedInvestment);
    }



    // Retrieves all investment records for the authenticated user
    public List<InvestmentResponseDTO> getAllInvestmentsByUserId(Long userId) {
        return investmentRepository.findAllByUserId(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }



    // Retrieves a specific investment record by its ID
    
    public InvestmentResponseDTO getInvestmentById(Long id) {
        Investment investment = investmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Investment not found"));

        return mapToResponseDTO(investment);
    }


    // Updates an existing investment record by its ID
    public InvestmentResponseDTO updateInvestment(Long id, InvestmentUpdateDTO investmentUpdateDTO) {
       Investment investment = investmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Could not fetch investment"));

       if (investmentUpdateDTO.getType() != null) {
           investment.setType(investmentUpdateDTO.getType());
       }
       if (investmentUpdateDTO.getInstitution() != null) {
           investment.setInstitution(investmentUpdateDTO.getInstitution());
       }
       if (investmentUpdateDTO.getDescription() != null) {
           investment.setDescription(investmentUpdateDTO.getDescription());
       }
       if (investmentUpdateDTO.getAmount() != null) {
           investment.setAmount(investmentUpdateDTO.getAmount());
       }
       if (investmentUpdateDTO.getDate() != null) {
           investment.setDate(investmentUpdateDTO.getDate());
       }

       Investment updatedInvestment = investmentRepository.save(investment);
       return mapToResponseDTO(updatedInvestment);
    }

    // Deletes an investment record by its ID
    public String deleteInvestment(Long id) {
        if (investmentRepository.existsById(id)) {
            investmentRepository.deleteById(id);
            return "Investment deleted successfully";
        }
        return "Investment not found";
    }
}