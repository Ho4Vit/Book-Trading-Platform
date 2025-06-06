package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Boolean existsByEmail(String email);
    Optional<Seller> findByEmail(String email);
    Boolean existsByUsername(String username);
}
