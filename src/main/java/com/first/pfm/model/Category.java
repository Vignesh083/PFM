package com.first.pfm.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categories")
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = system default category (shared for all users)
    private Long userId;

    private String name;

    private String color;  // hex e.g. "#f97316"

    private String icon;   // e.g. "food", "fuel"

    private boolean isDefault;
}
