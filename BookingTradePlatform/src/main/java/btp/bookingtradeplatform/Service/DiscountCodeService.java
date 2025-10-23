package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.DiscountCode;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.DiscountCodeRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class DiscountCodeService {

    @Autowired
    private DiscountCodeRepository discountCodeRepository;

    /**
     * 🔹 Tự động vô hiệu hóa các mã đã hết hạn mỗi 0h hàng ngày
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void deactivateExpiredDiscounts() {
        LocalDateTime now = LocalDateTime.now();
        List<DiscountCode> allCodes = discountCodeRepository.findAll();

        for (DiscountCode code : allCodes) {
            if (code.isActive() && code.getExpiryDate() != null && code.getExpiryDate().isBefore(now)) {
                code.setActive(false);
            }
        }

        discountCodeRepository.saveAll(allCodes);
    }

    /**
     * 🔹 Thêm userId vào danh sách được cung cấp của mã giảm giá
     */
    public void addUserIdToProvidedList(Long codeId, Long userId) {
        DiscountCode code = discountCodeRepository.findById(codeId)
                .orElseThrow(() -> new BusinessException(AppException.DISCOUNT_NOT_FOUND));

        if (code.getProvidedUserIds() == null) {
            code.setProvidedUserIds(new ArrayList<>());
        }

        if (!code.getProvidedUserIds().contains(userId)) {
            code.getProvidedUserIds().add(userId);
            discountCodeRepository.save(code);
        }
    }

    /**
     * 🔹 Lấy danh sách mã giảm giá hợp lệ cho người dùng
     */
    public ResponseEntity<ResponseData<List<DiscountCode>>> getAvailableDiscountsForUser(Long userId, BigDecimal orderValue) {
        deactivateExpiredDiscounts();

        LocalDateTime now = LocalDateTime.now();
        List<DiscountCode> validCodes = discountCodeRepository.findAll().stream()
                .filter(code ->
                        code.isActive()
                                && (code.getExpiryDate() == null || code.getExpiryDate().isAfter(now))
                                && (code.getMinOrderValue() == null || orderValue.compareTo(code.getMinOrderValue()) >= 0)
                                && (code.getProvidedUserIds() == null || !code.getProvidedUserIds().contains(userId))
                )
                .toList();

        if (validCodes.isEmpty()) {
            throw new BusinessException(AppException.NOT_FOUND);
        }

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched available discount codes successfully",
                validCodes
        ));
    }

    /**
     * 🔹 Tạo mới một mã giảm giá
     */
    public ResponseEntity<ResponseData<DiscountCode>> createDiscountCode(DiscountCode discountCode) {
        discountCode.setCreatedAt(LocalDateTime.now());
        discountCode.setActive(true);
        DiscountCode saved = discountCodeRepository.save(discountCode);
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Discount code created successfully",
                saved
        ));
    }

    /**
     * 🔹 Xóa mã giảm giá theo ID
     */
    public ResponseEntity<ResponseData<String>> deleteDiscountCode(Long id) {
        DiscountCode code = discountCodeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.DISCOUNT_NOT_FOUND));

        discountCodeRepository.delete(code);
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Discount code deleted successfully",
                "Deleted ID: " + id
        ));
    }

    public ResponseEntity<ResponseData<List<DiscountCode>>> getAllDiscountCodes() {
        List<DiscountCode> allCodes = discountCodeRepository.findAll();
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched all discount codes successfully",
                allCodes
        ));
    }

}
