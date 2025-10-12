package com.vishal.manageMoney.service;

import com.vishal.manageMoney.dto.AuthResponse;
import com.vishal.manageMoney.dto.LoginRequest;
import com.vishal.manageMoney.dto.RegisterRequest;
import com.vishal.manageMoney.entity.User;
import com.vishal.manageMoney.repository.UserRepository;
import com.vishal.manageMoney.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest loginRequest) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        // Get user details
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token using id and username
        String jwt = jwtUtils.generateJwtToken(user.getId(), user.getEmail());

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFullName());
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already taken!");
        }

        // Create new user
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setPhone(registerRequest.getPhone());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save user
        User savedUser = userRepository.save(user);

        // Generate JWT token using id and username
        String jwt = jwtUtils.generateJwtToken(savedUser.getId(), savedUser.getEmail());

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName());
    }

   
}