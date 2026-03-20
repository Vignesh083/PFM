package com.first.pfm.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    private String role; // "USER" or "ADMIN"

    // Tracks when username was last changed — enforces 30-day cooldown
    private LocalDateTime usernameChangedAt;
}
