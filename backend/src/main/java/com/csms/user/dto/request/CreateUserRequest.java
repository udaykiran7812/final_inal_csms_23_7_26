package com.csms.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {

    @NotBlank
    private String firstName;

    private String lastName;

    @Email
    private String email;

    @NotBlank
    private String password;

    private String phone;

    private Long roleId;

}