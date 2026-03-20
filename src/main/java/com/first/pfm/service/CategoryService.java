package com.first.pfm.service;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.dto.CategoryDto;
import com.first.pfm.exception.ResourceNotFoundException;
import com.first.pfm.model.Category;
import com.first.pfm.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

    public CategoryService(CategoryRepository categoryRepository, SecurityUtils securityUtils) {
        this.categoryRepository = categoryRepository;
        this.securityUtils = securityUtils;
    }

    public List<CategoryDto> getAllForCurrentUser() {
        Long userId = securityUtils.getCurrentUser().getId();
        List<Category> all = new ArrayList<>();
        all.addAll(categoryRepository.findByUserIdIsNull());   // system defaults
        all.addAll(categoryRepository.findByUserId(userId));   // user-created
        return all.stream().map(this::toDto).toList();
    }

    @Transactional
    public CategoryDto create(CategoryDto dto) {
        Long userId = securityUtils.getCurrentUser().getId();
        Category cat = new Category();
        cat.setUserId(userId);
        cat.setName(dto.getName());
        cat.setColor(dto.getColor() != null ? dto.getColor() : "#6366f1");
        cat.setIcon(dto.getIcon());
        cat.setDefault(false);
        return toDto(categoryRepository.save(cat));
    }

    @Transactional
    public CategoryDto update(Long id, CategoryDto dto) {
        Long userId = securityUtils.getCurrentUser().getId();
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!userId.equals(cat.getUserId())) {
            throw new IllegalArgumentException("Cannot edit a system default category");
        }
        cat.setName(dto.getName());
        if (dto.getColor() != null) cat.setColor(dto.getColor());
        if (dto.getIcon() != null) cat.setIcon(dto.getIcon());
        return toDto(categoryRepository.save(cat));
    }

    @Transactional
    public void delete(Long id) {
        Long userId = securityUtils.getCurrentUser().getId();
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!userId.equals(cat.getUserId())) {
            throw new IllegalArgumentException("Cannot delete a system default category");
        }
        categoryRepository.delete(cat);
    }

    public CategoryDto toDto(Category cat) {
        CategoryDto dto = new CategoryDto();
        dto.setId(cat.getId());
        dto.setName(cat.getName());
        dto.setColor(cat.getColor());
        dto.setIcon(cat.getIcon());
        dto.setDefault(cat.isDefault());
        return dto;
    }
}
