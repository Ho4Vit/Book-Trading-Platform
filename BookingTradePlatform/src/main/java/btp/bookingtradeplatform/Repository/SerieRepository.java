package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Series;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SerieRepository extends JpaRepository<Series, Long> {
    boolean existsByName(String name);
    // Additional query methods can be defined here if needed
}
