package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // This interface will automatically provide CRUD operations for Feedback entity
    // Additional custom query methods can be defined here if needed
}
