package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // This interface will automatically provide CRUD operations for Feedback entity
    // Additional custom query methods can be defined here if needed
    List<Feedback> findAllByBookId(Long bookId);
}
