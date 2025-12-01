package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.DiscountCode;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {
    Optional<DiscountCode> findByCodeAndActiveTrue(String code);

    List<DiscountCode> findByExpiryDateBefore(LocalDateTime now);

    @Query("""
        SELECT d FROM DiscountCode d
        WHERE d.active = true
          AND (d.expiryDate IS NULL OR d.expiryDate > :now)
          AND (d.minOrderValue IS NULL OR d.minOrderValue <= :orderValue)
    """)
    List<DiscountCode> findValidDiscountCodes(
            @Param("orderValue") BigDecimal orderValue,
            @Param("now") LocalDateTime now
    );

    DiscountCode findByCode(String code);
}
