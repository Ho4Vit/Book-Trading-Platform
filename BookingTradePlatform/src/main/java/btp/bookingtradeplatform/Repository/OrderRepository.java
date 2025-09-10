package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId) ;
    // Custom query methods can be defined here if needed
}
