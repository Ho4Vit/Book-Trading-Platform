package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Book;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

        @Query("SELECT b FROM Book b " +
                "JOIN b.seller s " +
                "WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "   OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "   OR LOWER(s.storeName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
        List<Book> searchByKeyword(@Param("keyword") String keyword);

        List<Book> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
}

