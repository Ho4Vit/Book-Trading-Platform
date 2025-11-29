package btp.bookingtradeplatform.Repository;

import btp.bookingtradeplatform.Model.Entity.SellerSalesReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerSalesReportRepository extends JpaRepository<SellerSalesReport,Long> {
    List<SellerSalesReport> findBySellerId(Long sellerId);
}
