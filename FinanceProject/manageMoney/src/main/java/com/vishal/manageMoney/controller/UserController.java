package com.vishal.manageMoney.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vishal.manageMoney.dto.ProfileDTO;
import com.vishal.manageMoney.dto.UpdateFullName;
import com.vishal.manageMoney.dto.UpdateProfileDTO;
import com.vishal.manageMoney.dto.UserResponse;
import com.vishal.manageMoney.exception.UserNotFoundException;
import com.vishal.manageMoney.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;

import jakarta.servlet.http.HttpServletRequest;



@RestController
@RequestMapping("/api/users")
public class UserController {
   private final UserService userService;

    public UserController(UserService userService) {
         this.userService = userService;
    }

    
    // to get one user by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        UserResponse userResponse ;
        try {
           userResponse = userService.getUserProfile(id);    
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
        return ResponseEntity.ok(userResponse);
    }

    
    // to change username
    @PutMapping("change-username/{id}")
    public ResponseEntity<?> changeFullName(@PathVariable Long id, @RequestBody UpdateFullName request) {
        try {
            UserResponse user = userService.changeFullName(id, request);
            return ResponseEntity.status(200).body(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Username could not be changed : " + e.getMessage());
        }
        
    }

    // to update user profile (full name and phone)
    @PutMapping("/update-profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UpdateProfileDTO request) {
        try {
            UserResponse user = userService.updateProfile(id, request);
            return ResponseEntity.status(200).body(user);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(404).body("User not found: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Invalid input: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Profile could not be updated : " + e.getMessage());
        }
    }

    // to get profile details by token
    @GetMapping("/me")
    public ResponseEntity<?> getProfileDetails(HttpServletRequest request) {
        ProfileDTO profileDetails;
        try {
            profileDetails = userService.getProfleDetails(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not fetch profile details: " + e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.OK).body(profileDetails);
    }
}
