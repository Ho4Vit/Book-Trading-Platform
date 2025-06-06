package btp.bookingtradeplatform.Exception;

import org.springframework.http.HttpStatus;

public enum AppException {

    // ========== Common ==========
    INTERNAL_SERVER_ERROR("ERR_000", "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("ERR_001", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("ERR_002", "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("ERR_003", "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    NOT_FOUND("ERR_004", "Không tìm thấy", HttpStatus.NOT_FOUND),
    VALIDATION_FAILED("ERR_005", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),

    // ========== User / Auth ==========
    EMAIL_ALREADY_EXISTS("USR_001", "Email đã được sử dụng", HttpStatus.BAD_REQUEST),
    USERNAME_ALREADY_EXISTS("USR_002", "Username đã được sử dụng", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("USR_003", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    WRONG_PASSWORD("USR_004", "Mật khẩu không đúng", HttpStatus.BAD_REQUEST),
    ALREADY_EXISTS("USR_005", "Dữ liệu đã được tạo trước", HttpStatus.BAD_REQUEST),

    // ========== Seller ==========
    SELLER_NOT_FOUND("SEL_001", "Không tìm thấy người bán", HttpStatus.NOT_FOUND),

    // ========== Book ==========
    BOOK_NOT_FOUND("BOK_001", "Không tìm thấy sách", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK("BOK_002", "Sách đã hết hàng", HttpStatus.BAD_REQUEST),

    // ========== Cart ==========
    CART_EMPTY("CRT_001", "Giỏ hàng trống", HttpStatus.BAD_REQUEST),
    ITEM_ALREADY_IN_CART("CRT_002", "Sách đã có trong giỏ hàng", HttpStatus.BAD_REQUEST),

    // ========== Order / Payment ==========
    ORDER_NOT_FOUND("ORD_001", "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    PAYMENT_FAILED("PAY_001", "Thanh toán thất bại", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========== Success request ==========
    SUCCESS("SUC_200", "Thành công", HttpStatus.OK),
    CREATED("SUC_201", "Đã tạo", HttpStatus.CREATED);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    AppException(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
