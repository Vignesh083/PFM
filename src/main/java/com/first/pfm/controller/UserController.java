package com.first.pfm.controller;

import com.first.pfm.config.JwtUtil;
import com.first.pfm.config.SecurityUtils;
import com.first.pfm.model.User;
import com.first.pfm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final SecurityUtils securityUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserController(SecurityUtils securityUtils,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.securityUtils = securityUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        User user = securityUtils.getCurrentUser();
        Map<String, Object> result = new HashMap<>();
        result.put("username", user.getUsername());
        result.put("role", user.getRole());
        result.put("usernameChangedAt", user.getUsernameChangedAt());
        return result;
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        User user = securityUtils.getCurrentUser();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    @PutMapping("/me/username")
    public ResponseEntity<?> changeUsername(@RequestBody Map<String, String> body) {
        String newUsername = body.get("username");
        if (newUsername == null || newUsername.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        newUsername = newUsername.trim();
        if (newUsername.length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username must be at least 3 characters"));
        }
        if (newUsername.length() > 30) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username must be 30 characters or less"));
        }

        User user = securityUtils.getCurrentUser();

        // Same username — no-op
        if (user.getUsername().equalsIgnoreCase(newUsername)) {
            return ResponseEntity.badRequest().body(Map.of("error", "That is already your username"));
        }

        // 30-day cooldown check
        if (user.getUsernameChangedAt() != null) {
            long daysSince = ChronoUnit.DAYS.between(user.getUsernameChangedAt(), LocalDateTime.now());
            if (daysSince < 30) {
                long daysLeft = 30 - daysSince;
                return ResponseEntity.badRequest().body(
                        Map.of("error", "You can change your username in " + daysLeft + " more day(s)"));
            }
        }

        // Uniqueness check
        if (userRepository.findByUsername(newUsername).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken"));
        }

        user.setUsername(newUsername);
        user.setUsernameChangedAt(LocalDateTime.now());
        userRepository.save(user);

        // Issue a fresh JWT with the new username
        String newToken = jwtUtil.generateToken(newUsername);
        return ResponseEntity.ok(Map.of("token", newToken, "message", "Username updated successfully"));
    }
}
