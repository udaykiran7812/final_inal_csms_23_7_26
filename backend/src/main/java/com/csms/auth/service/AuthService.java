package com.csms.auth.service;

import com.csms.auth.dto.request.LoginRequest;
import com.csms.auth.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

}