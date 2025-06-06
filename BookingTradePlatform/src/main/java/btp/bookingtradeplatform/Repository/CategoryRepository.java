package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);

    // Additional query methods can be defined here if needed
    // For example, to find categories by name:
    // List<Category> findByName(String name);
}
