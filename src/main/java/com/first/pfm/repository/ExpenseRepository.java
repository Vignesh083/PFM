package com.first.pfm.repository;

import com.first.pfm.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);

    List<Expense> findByUserIdAndDateOrderByCreatedAtDesc(Long userId, LocalDate date);

    @Query("SELECT e.categoryId, SUM(e.amount) FROM Expense e WHERE e.userId = :userId AND e.date BETWEEN :start AND :end GROUP BY e.categoryId")
    List<Object[]> sumByCategoryBetween(@Param("userId") Long userId,
                                         @Param("start") LocalDate start,
                                         @Param("end") LocalDate end);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.userId = :userId AND e.date BETWEEN :start AND :end")
    BigDecimal totalBetween(@Param("userId") Long userId,
                             @Param("start") LocalDate start,
                             @Param("end") LocalDate end);

    @Query("SELECT e FROM Expense e WHERE e.userId = :userId " +
           "AND (:categoryId IS NULL OR e.categoryId = :categoryId) " +
           "AND e.date BETWEEN :start AND :end " +
           "AND (:keyword IS NULL OR LOWER(e.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY e.date DESC, e.createdAt DESC")
    List<Expense> search(@Param("userId") Long userId,
                          @Param("categoryId") Long categoryId,
                          @Param("start") LocalDate start,
                          @Param("end") LocalDate end,
                          @Param("keyword") String keyword);

    List<Expense> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    @Query("SELECT DAY(e.date), SUM(e.amount) FROM Expense e WHERE e.userId = :userId AND e.date BETWEEN :start AND :end GROUP BY DAY(e.date)")
    List<Object[]> sumByDayBetween(@Param("userId") Long userId,
                                    @Param("start") LocalDate start,
                                    @Param("end") LocalDate end);

    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
