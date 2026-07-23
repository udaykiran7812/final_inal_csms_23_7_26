package com.csms.common.exception;

import com.csms.common.response.ApiResponse;
import com.csms.role.exception.RoleAlreadyExistsException;
import com.csms.role.exception.RoleNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.csms.user.exception.UserAlreadyExistsException;
import com.csms.user.exception.UserNotFoundException;
import org.springframework.security.access.AccessDeniedException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RoleAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleRoleExists(RoleAlreadyExistsException ex) {

        return ApiResponse.failure(ex.getMessage());

    }

    @ExceptionHandler(RoleNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Object> handleRoleNotFound(RoleNotFoundException ex) {

        return ApiResponse.failure(ex.getMessage());

    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Object> handleAccessDenied(AccessDeniedException ex) {

        return ApiResponse.failure("Access Denied");

    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleException(Exception ex) {

        return ApiResponse.failure(ex.getMessage());

    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        return ApiResponse.failure(ex.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Object> handleUserNotFound(UserNotFoundException ex) {
        return ApiResponse.failure(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ApiResponse.failure(message);
    }

}