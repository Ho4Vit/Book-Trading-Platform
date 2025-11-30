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
            "JOIN o.orderItems oi " +
            "WHERE oi.sellerId = :sellerId")
    List<Order> findOrdersBySellerIdAndStatus(
            @Param("sellerId") Long sellerId
    );
    
    Optional<Order> findByTransactionId(String transactionId);


}
