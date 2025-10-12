package com.vishal.manageMoney.service;

import com.vishal.manageMoney.dto.LoanRequestDTO;
import com.vishal.manageMoney.dto.LoanResponseDTO;
import com.vishal.manageMoney.dto.LoanUpdateDTO;
import com.vishal.manageMoney.entity.Loan;
import com.vishal.manageMoney.entity.User;
import com.vishal.manageMoney.repository.LoanRepository;
import com.vishal.manageMoney.repository.UserRepository;
import com.vishal.manageMoney.utils.JwtUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    // Constructor injection
    public LoanService(LoanRepository loanRepository, UserRepository userRepository, JwtUtils jwtUtils) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    // Converts a Loan entity to a LoanResponseDTO
    private LoanResponseDTO mapToResponseDTO(Loan loan) {
        LoanResponseDTO responseDTO = new LoanResponseDTO();

        responseDTO.setId(loan.getId());
        responseDTO.setType(loan.getType());
        responseDTO.setLender(loan.getLender());
        responseDTO.setDescription(loan.getDescription());
        responseDTO.setPrincipal(loan.getPrincipal());
        responseDTO.setInterestRate(loan.getInterestRate());
        responseDTO.setEmi(loan.getEmi());
        responseDTO.setStartDate(loan.getStartDate());
        responseDTO.setEndDate(loan.getEndDate());
       
        return responseDTO;
    }


    // Adds a new loan record to the database
    @Transactional
    public LoanResponseDTO addLoan(LoanRequestDTO loanRequestDTO) {
        HttpServletRequest httpRequest = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        Long userId = jwtUtils.getUserIdFromJwtToken(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Loan loan = new Loan();
        loan.setType(loanRequestDTO.getType());
        loan.setLender(loanRequestDTO.getLender());
        loan.setDescription(loanRequestDTO.getDescription());
        loan.setPrincipal(loanRequestDTO.getPrincipal());
        loan.setInterestRate(loanRequestDTO.getInterestRate());
        loan.setEmi(loanRequestDTO.getEmi());
        loan.setStartDate(loanRequestDTO.getStartDate());
        loan.setEndDate(loanRequestDTO.getEndDate());
        loan.setUser(user);

        Loan savedLoan = loanRepository.save(loan);
        return mapToResponseDTO(savedLoan);
    }


    // Retrieves all loan records for the authenticated user
    @Transactional(readOnly = true)
    public List<LoanResponseDTO> getAllLoans(Long userId) {
        List<Loan> loans = loanRepository.findLoanByUserId(userId);
        return loans.stream().map(this::mapToResponseDTO).toList();
    }


    // Retrieves a specific loan record by its ID
    @Transactional(readOnly = true)
    public LoanResponseDTO getLoanById(Long id) {
        return loanRepository.findById(id).map(this::mapToResponseDTO).orElseThrow(() -> new RuntimeException("Could not find loan with this id"));
    }

    // Updates an existing loan record by its ID
    @Transactional
    public LoanResponseDTO updateLoan(Long id, LoanUpdateDTO loanUpdateDTO) {
       Loan loan = loanRepository.findById(id).orElseThrow(() -> new RuntimeException("Could not retrieve loan with this id"));


       if(loanUpdateDTO.getDescription() != null)  {
             loan.setDescription(loanUpdateDTO.getDescription());
       }
       if (loanUpdateDTO.getInterestRate() != null) {
           loan.setInterestRate(loanUpdateDTO.getInterestRate());
       }
       if (loanUpdateDTO.getLender() != null) {
           loan.setLender(loanUpdateDTO.getLender());
       }
       if (loanUpdateDTO.getPrincipal() != null) {
           loan.setPrincipal(loanUpdateDTO.getPrincipal());
       }
       if (loanUpdateDTO.getStartDate() != null) {
           loan.setStartDate(loanUpdateDTO.getStartDate());
       }
       if (loanUpdateDTO.getEndDate() != null) {
           loan.setEndDate(loanUpdateDTO.getEndDate());
       }
       if (loanUpdateDTO.getType() != null) {
           loan.setType(loanUpdateDTO.getType());
       }

       Loan updatedLoan = loanRepository.save(loan);
       return mapToResponseDTO(updatedLoan);
    }

    // Deletes a loan record by its ID
    @Transactional
    public String deleteLoan(Long id) {
        if (loanRepository.existsById(id)) {
            loanRepository.deleteById(id);
            return "Loan deleted successfully";
        }
        return "Loan not found";
    }
}