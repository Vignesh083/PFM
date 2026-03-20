package com.first.pfm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryDto {
    private Long id;
    @NotBlank
    private String name;
    private String color;
    private String icon;
    private boolean isDefault;
}
