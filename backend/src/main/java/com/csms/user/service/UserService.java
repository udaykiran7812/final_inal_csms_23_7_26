package com.csms.user.service;

import com.csms.user.dto.request.CreateUserRequest;
import com.csms.user.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(CreateUserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, CreateUserRequest request);

    void resetPassword(Long id, String newPassword);

    void deleteUser(Long id);
}