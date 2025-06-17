package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    // Custom query methods can be defined here if needed
    // For example, to find a cart by userId or sessionKey
    Optional<Cart> findByUserId(Long userId);
}
