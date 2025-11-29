package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Model.DTO.SellerDTO;
import btp.bookingtradeplatform.Model.DTO.SellerSalesReportDTO;
import btp.bookingtradeplatform.Model.Entity.SellerSalesReport;
import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Request.RegisterSellerRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateSellerForm;
import btp.bookingtradeplatform.Service.BookImageService;
import btp.bookingtradeplatform.Service.SellerSalesReportService;
import btp.bookingtradeplatform.Service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sellers")
public class SellerController {
    @Autowired
    private SellerService sellerService;

    @Autowired
    private BookImageService bookImageService;

    @Autowired
    private SellerSalesReportService reportService;

    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<SellerDTO>>> getAllSellers() {
        return sellerService.getAllSeller();
    }

    @GetMapping("/getbyid/{id}")
    public ResponseEntity<ResponseData<SellerDTO>> getSellerById(@PathVariable Long id) {
        return sellerService.getSellerById(id);
    }

    @GetMapping("/getbyemail")
    public ResponseEntity<ResponseData<SellerDTO>> getSellerByEmail(@RequestBody EmailRequest email) {
        return sellerService.getSellerByEmail(email);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseData<SellerDTO>> registerSeller(@RequestBody RegisterSellerRequest request) {
        return sellerService.createSeller(request);
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ResponseData<SellerDTO>> updateSeller(@PathVariable Long id, @RequestBody UpdateSellerForm updateForm) {
        return sellerService.updateSeller(id, updateForm);
    }

    @PostMapping("/avartat/{id}")
    public ResponseEntity<ResponseData<Void>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        bookImageService.updateAvatar(id, file);
        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        "Upload images successfully",
                        null
                ));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ResponseData<SellerSalesReportDTO>> getMonthlyReport(
            @RequestParam Long sellerId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        SellerSalesReportDTO reportDTO = reportService.generateMonthlyReport(sellerId, month, year);
        return ResponseEntity.ok(
                new ResponseData<>("SUC_200", "Monthly report fetched successfully", reportDTO)
        );
    }

    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<SellerSalesReportDTO>>> getAllReports() {
        List<SellerSalesReportDTO> reports = reportService.getAllReportsDTO();
        return ResponseEntity.ok(
                new ResponseData<>("SUC_200", "Fetched all reports successfully", reports)
        );
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ResponseData<List<SellerSalesReportDTO>>> getReportsBySeller(
            @PathVariable Long sellerId
    ) {
        List<SellerSalesReportDTO> reports = reportService.getReportsBySellerDTO(sellerId);
        return ResponseEntity.ok(
                new ResponseData<>("SUC_200", "Fetched reports for seller successfully", reports)
        );
    }
}
