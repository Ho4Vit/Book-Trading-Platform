package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
}
