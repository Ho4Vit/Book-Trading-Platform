package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // This interface will automatically provide CRUD operations for Payment entity
    // Additional custom query methods can be defined here if needed
    Payment findByOrderId(Long orderId);
}
