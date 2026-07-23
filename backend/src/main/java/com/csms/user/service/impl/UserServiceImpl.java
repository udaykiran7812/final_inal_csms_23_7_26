package com.csms.user.service.impl;

import com.csms.role.entity.Role;
import com.csms.role.exception.RoleNotFoundException;
import com.csms.role.repository.RoleRepository;
import com.csms.user.dto.request.CreateUserRequest;
import com.csms.user.dto.response.UserResponse;
import com.csms.user.entity.User;
import com.csms.user.exception.UserAlreadyExistsException;
import com.csms.user.exception.UserNotFoundException;
import com.csms.user.mapper.UserMapper;
import com.csms.user.repository.UserRepository;
import com.csms.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RoleNotFoundException("Role not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String currentEmail = auth.getName();
            User currentUser = userRepository.findByEmailWithRole(currentEmail).orElse(null);
            if (currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().getName())) {
                String targetRole = role.getName().toUpperCase();
                if ("ADMIN".equals(targetRole) || "SUPER_ADMIN".equals(targetRole)) {
                    throw new org.springframework.security.access.AccessDeniedException("Admin users cannot create Admin or Super Admin accounts");
                }
            }
        }

        User user = userMapper.toEntity(request, role);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String currentEmail = auth.getName();
            User currentUser = userRepository.findByEmailWithRole(currentEmail).orElse(null);
            if (currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().getName())) {
                String targetRole = user.getRole().getName().toUpperCase();
                if ("ADMIN".equals(targetRole) || "SUPER_ADMIN".equals(targetRole)) {
                    throw new org.springframework.security.access.AccessDeniedException("Admin users cannot modify Admin or Super Admin accounts");
                }
            }
        }

        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RoleNotFoundException("Role not found"));
            user.setRole(role);
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String currentEmail = auth.getName();
            User currentUser = userRepository.findByEmailWithRole(currentEmail).orElse(null);
            if (currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().getName())) {
                String targetRole = user.getRole().getName().toUpperCase();
                if ("ADMIN".equals(targetRole) || "SUPER_ADMIN".equals(targetRole)) {
                    throw new org.springframework.security.access.AccessDeniedException("Admin users cannot reset Admin or Super Admin passwords");
                }
            }
        }

        String encoded = passwordEncoder.encode(newPassword != null && !newPassword.isBlank() ? newPassword.trim() : "admin123");
        user.setPassword(encoded);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String currentEmail = auth.getName();
            User currentUser = userRepository.findByEmailWithRole(currentEmail).orElse(null);
            if (currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().getName())) {
                String targetRole = user.getRole().getName().toUpperCase();
                if ("ADMIN".equals(targetRole) || "SUPER_ADMIN".equals(targetRole)) {
                    throw new org.springframework.security.access.AccessDeniedException("Admin users cannot delete Admin or Super Admin accounts");
                }
            }
        }

        user.setActive(false);
        userRepository.save(user);
    }
}