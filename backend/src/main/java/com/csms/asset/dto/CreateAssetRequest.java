package com.csms.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAssetRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String assetTag;

    @NotBlank
    private String type;

    @NotBlank
    private String location;

    @NotNull
    private Long departmentId;

    @NotBlank
    private String status; // e.g. "ACTIVE", "MAINTENANCE", "RETIRED"
}
