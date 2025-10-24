package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.Entity.DiscountCode;
import btp.bookingtradeplatform.Model.Request.ApplicableBooks;
import btp.bookingtradeplatform.Model.Request.DiscountRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Service.DiscountCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountCodeController {

    @Autowired
    private DiscountCodeService discountCodeService;

    /**
     * 🔹 Lấy tất cả mã giảm giá hợp lệ cho user theo giá trị đơn hàng
     */
    @PostMapping("/available")
    public ResponseEntity<ResponseData<List<DiscountCode>>> getAvailableDiscounts(
            @RequestBody DiscountRequest request
    ) {
        return discountCodeService.getAvailableDiscounts(request);
    }


    /**
     * 🔹 Thêm userId vào danh sách đã dùng mã giảm giá (không kiểm tra)
     */
    @PostMapping("/add-user/{codeId}")
    public ResponseEntity<String> addUserToDiscount(
            @PathVariable Long codeId,
            @RequestParam Long userId
    ) {
        discountCodeService.addUserIdToProvidedList(codeId, userId);
        return ResponseEntity.ok("User added to discount code successfully");
    }

    /**
     * 🔹 Tạo mới mã giảm giá
     */
    @PostMapping("/create")
    public ResponseEntity<ResponseData<DiscountCode>> createDiscountCode(
            @RequestBody DiscountCode discountCode
    ) {
        return discountCodeService.createDiscountCode(discountCode);
    }

    /**
     * 🔹 Xóa mã giảm giá theo ID
     */
    @DeleteMapping("/delete/{codeId}")
    public ResponseEntity<ResponseData<String>> deleteDiscountCode(
            @PathVariable Long codeId
    ) {
        return discountCodeService.deleteDiscountCode(codeId);
    }

    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<DiscountCode>>> getAllDiscounts() {
        return discountCodeService.getAllDiscountCodes();
    }

    @PutMapping("books-applicable/{discountId}")
    public ResponseEntity<ResponseData<DiscountCode>> updateApplicableBooks(
            @PathVariable Long discountId,
            @RequestBody ApplicableBooks request
    ) {
        return discountCodeService.updateApplicableBooks(discountId, request.getBookIds());
    }

}
