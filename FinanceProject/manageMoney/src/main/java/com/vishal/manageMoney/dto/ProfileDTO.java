package com.vishal.manageMoney.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@Setter
@Getter
public class ProfileDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;


    public ProfileDTO(Long id, String email , String fullName , String phone) {
        this.id = id;
        this.email = email;
        this.phone = phone;
        this.fullName = fullName;
    }
}