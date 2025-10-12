package com.vishal.manageMoney.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    
    public AuthResponse(String token, Long id, String email, String fullName) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
    }
}