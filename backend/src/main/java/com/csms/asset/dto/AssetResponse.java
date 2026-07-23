package com.csms.asset.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class AssetResponse {
    private Long id;
    private String name;
    private String assetTag;
    private String type;
    private String location;
    private Long departmentId;
    private String departmentName;
    private String status;
    private Boolean active;
    private LocalDateTime createdAt;
}
