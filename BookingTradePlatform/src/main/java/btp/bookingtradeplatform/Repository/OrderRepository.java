package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Order;
import btp.bookingtradeplatform.Model.Enum.OrderStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId) ;
    // Custom query methods can be defined here if needed
    @Query("SELECT DISTINCT o FROM Order o " +
            "JOIN o.orderItems ci " +
            "JOIN ci.book b " +
            "WHERE b.seller.id = :sellerId ")
    List<Order> findOrdersBySellerIdAndStatus(
            @Param("sellerId") Long sellerId
    );
    
    Optional<Order> findByTransactionId(String transactionId);

    @Query("""
        SELECT o FROM Order o
        JOIN o.orderItems ci
        JOIN ci.book b
        WHERE o.Paid = true
        AND b.seller.id = :sellerId
    """)
    List<Order> findPaidOrdersBySeller(Long sellerId);


    // Lấy theo tháng + năm
    @Query("""
        SELECT o FROM Order o
        JOIN o.orderItems ci
        JOIN ci.book b
        WHERE o.Paid = true
        AND b.seller.id = :sellerId
        AND MONTH(o.orderDate) = :month
        AND YEAR(o.orderDate) = :year
    """)
    List<Order> findPaidOrdersBySellerAndMonth(
            Long sellerId,
            int month,
            int year
    );


    // Lấy theo năm
    @Query("""
        SELECT o FROM Order o
        JOIN o.orderItems ci
        JOIN ci.book b
        WHERE o.Paid = true
        AND b.seller.id = :sellerId
        AND YEAR(o.orderDate) = :year
    """)
    List<Order> findPaidOrdersBySellerAndYear(
            Long sellerId,
            int year
    );
}
