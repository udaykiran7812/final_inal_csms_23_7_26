package com.csms.auth.service.impl;

import com.csms.auth.dto.request.LoginRequest;
import com.csms.auth.dto.response.LoginResponse;
import com.csms.auth.service.AuthService;
import com.csms.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(request.getEmail());

        User user = userRepository.findByEmailWithRole(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new LoginResponse(
                token,
                "Bearer",
                user.getEmail(),
                user.getRole().getName()
        );
    }
}