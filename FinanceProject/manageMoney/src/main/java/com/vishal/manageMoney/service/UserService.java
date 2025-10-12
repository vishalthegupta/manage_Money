package com.vishal.manageMoney.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.vishal.manageMoney.dto.ProfileDTO;
import com.vishal.manageMoney.dto.UpdateFullName;
import com.vishal.manageMoney.dto.UpdateProfileDTO;
import com.vishal.manageMoney.dto.UserResponse;
import com.vishal.manageMoney.entity.User;
import com.vishal.manageMoney.exception.DatabaseException;
import com.vishal.manageMoney.exception.UserNotFoundException;
import com.vishal.manageMoney.repository.UserRepository;
import com.vishal.manageMoney.utils.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

   // convert user to user-response
   public UserResponse convertToUserResponse(User user) {
    UserResponse userResponse = new UserResponse();
    userResponse.setEmail(user.getEmail());
    userResponse.setFullName(user.getFullName());   
    userResponse.setPhone(user.getPhone());
    return userResponse;
   }


   // to fetch a user profile by their ID
    public UserResponse getUserProfile(Long userId) {
        // Validate input
        if (userId == null) {
            logger.error("Attempted to fetch user profile with null userId");
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        if (userId <= 0) {
            logger.error("Attempted to fetch user profile with invalid userId: {}", userId);
            throw new IllegalArgumentException("User ID must be a positive number");
        }

        try {
            logger.info("Fetching user profile for userId: {}", userId);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.warn("User not found with id: {}", userId);
                        return new UserNotFoundException("User not found with id: " + userId);
                    });

            logger.info(user.toString());
            logger.info("Successfully retrieved user profile for userId: {}", userId);
            return new UserResponse(user.getEmail(), user.getFullName(), user.getPhone());
            
        } catch (DataAccessException e) {
            logger.error("Database error while fetching user profile for userId: {}", userId, e);
            throw new DatabaseException("Failed to fetch user profile due to database error", e);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching user profile for userId: {}", userId, e);
            throw new RuntimeException("An unexpected error occurred while fetching user profile", e);
        }
    }


    // to change username
    public UserResponse changeFullName(Long userId, UpdateFullName request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("User not found with id: {}", userId);
                    return new UserNotFoundException("User not found with id: " + userId);
                });
        logger.info("Changing full name for user: {} to newUser : {}", user, request.getNewfullName());
        user.setFullName(request.getNewfullName());
        return convertToUserResponse(userRepository.save(user));
    }


    // to return authenticated user's information
    public ProfileDTO getProfleDetails(HttpServletRequest request) {
        // Extract JWT token from Authorization header
        String jwt = getJwtFromRequest(request);
        
        if (jwt == null) {
            logger.error("No JWT token found in request headers");
            throw new IllegalArgumentException("Authorization token is required");
        }
        
        // Validate the JWT token
        if (!jwtUtils.validateJwtToken(jwt)) {
            logger.error("Invalid JWT token provided");
            throw new IllegalArgumentException("Invalid or expired token");
        }
        
        try {
            // Extract user ID from the token
            Long userId = jwtUtils.getUserIdFromJwtToken(jwt);
            logger.info("Extracting profile details for userId: {}", userId);
            
            // Fetch user from database
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.warn("User not found with id: {}", userId);
                        return new UserNotFoundException("User not found with id: " + userId);
                    });
            
            logger.info("Successfully retrieved profile details for userId: {}", userId);
            return new ProfileDTO(user.getId(), user.getEmail(), user.getFullName(), user.getPhone());
            
        } catch (DataAccessException e) {
            logger.error("Database error while fetching profile details", e);
            throw new DatabaseException("Failed to fetch profile details due to database error", e);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching profile details", e);
            throw new RuntimeException("An unexpected error occurred while fetching profile details", e);
        }
    }

    // to update user profile
    public UserResponse updateProfile(Long userId, UpdateProfileDTO request) {
        // Validate input
        if (userId == null) {
            logger.error("Attempted to update profile with null userId");
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        if (request == null) {
            logger.error("Attempted to update profile with null request");
            throw new IllegalArgumentException("Update request cannot be null");
        }

        try {
            logger.info("Updating profile for userId: {}", userId);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.warn("User not found with id: {}", userId);
                        return new UserNotFoundException("User not found with id: " + userId);
                    });

            // Update fields if provided
            if (StringUtils.hasText(request.getFullName())) {
                user.setFullName(request.getFullName());
                logger.info("Updated full name for userId: {}", userId);
            }
            
            if (StringUtils.hasText(request.getPhone())) {
                user.setPhone(request.getPhone());
                logger.info("Updated phone for userId: {}", userId);
            }

            User savedUser = userRepository.save(user);
            logger.info("Successfully updated profile for userId: {}", userId);
            
            return convertToUserResponse(savedUser);
            
        } catch (DataAccessException e) {
            logger.error("Database error while updating profile for userId: {}", userId, e);
            throw new DatabaseException("Failed to update profile due to database error", e);
        } catch (Exception e) {
            logger.error("Unexpected error while updating profile for userId: {}", userId, e);
            throw new RuntimeException("An unexpected error occurred while updating profile", e);
        }
    }
    
    // Helper method to extract JWT token from request headers
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
