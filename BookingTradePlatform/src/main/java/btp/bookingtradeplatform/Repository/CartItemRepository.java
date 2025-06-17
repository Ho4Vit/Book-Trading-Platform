package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    CartItem findByCartIdAndBookId(Long cartId, Long bookId);
}
