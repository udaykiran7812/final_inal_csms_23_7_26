package com.csms.role.exception;

public class RoleAlreadyExistsException extends RuntimeException {

    public RoleAlreadyExistsException(String message) {
        super(message);
    }
}