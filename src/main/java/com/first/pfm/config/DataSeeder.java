package com.first.pfm.config;

import com.first.pfm.model.Category;
import com.first.pfm.repository.CategoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    public DataSeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!categoryRepository.findByUserIdIsNull().isEmpty()) return;

        List<Object[]> defaults = List.of(
                new Object[]{"Food",          "#f97316", "food"},
                new Object[]{"Snacks",        "#eab308", "snacks"},
                new Object[]{"Fuel",          "#3b82f6", "fuel"},
                new Object[]{"Grocery",       "#22c55e", "grocery"},
                new Object[]{"Clothing",      "#a855f7", "clothing"},
                new Object[]{"Entertainment", "#ec4899", "entertainment"},
                new Object[]{"Healthcare",    "#06b6d4", "healthcare"},
                new Object[]{"Utilities",     "#64748b", "utilities"},
                new Object[]{"Other",         "#94a3b8", "other"}
        );

        for (Object[] row : defaults) {
            Category cat = new Category();
            cat.setName((String) row[0]);
            cat.setColor((String) row[1]);
            cat.setIcon((String) row[2]);
            cat.setDefault(true);
            cat.setUserId(null);
            categoryRepository.save(cat);
        }
    }
}
