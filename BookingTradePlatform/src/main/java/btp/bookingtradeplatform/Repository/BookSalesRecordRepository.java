package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.BookSalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookSalesRecordRepository extends JpaRepository<BookSalesRecord, Long> {

    @Query("SELECT b.book.id AS bookId, SUM(b.quantity) AS totalQuantity " +
            "FROM BookSalesRecord b " +
            "GROUP BY b.book.id")
    List<Object[]> getTotalSalesByBook();
}
