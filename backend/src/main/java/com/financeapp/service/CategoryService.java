package com.financeapp.service;

import com.financeapp.dto.request.CategoryRequest;
import com.financeapp.dto.response.CategoryResponse;
import com.financeapp.entity.Category;
import com.financeapp.entity.User;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public List<CategoryResponse> getAllCategories() {
        Long userId = userService.getCurrentUserId();
        return categoryRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getCategoriesByType(String type) {
        Long userId = userService.getCurrentUserId();
        return categoryRepository.findByUserIdAndType(userId, type.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User user = userService.getCurrentUser();
        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType().toUpperCase())
                .icon(request.getIcon())
                .color(request.getColor())
                .user(user)
                .build();
        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = getCategoryEntity(id);
        category.setName(request.getName());
        category.setType(request.getType().toUpperCase());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryEntity(id);
        categoryRepository.delete(category);
    }

    public Category getCategoryEntity(Long id) {
        Long userId = userService.getCurrentUserId();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (!category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        return category;
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .build();
    }
}
