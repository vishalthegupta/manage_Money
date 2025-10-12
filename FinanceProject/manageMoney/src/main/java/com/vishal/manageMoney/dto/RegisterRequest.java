package com.vishal.manageMoney.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class RegisterRequest {
   
    private String email;
    private String password;
    private String fullName;
    private String phone;

}
