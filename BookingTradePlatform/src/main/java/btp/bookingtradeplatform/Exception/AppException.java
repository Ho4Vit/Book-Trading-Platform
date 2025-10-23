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
    EMAIL_NOT_FOUND("USR_003", "Không tìm thấy email hoặc email nhập sai", HttpStatus.NOT_FOUND),
    WRONG_PASSWORD("USR_004", "Mật khẩu không đúng", HttpStatus.BAD_REQUEST),
    ALREADY_EXISTS("USR_005", "Dữ liệu đã được tạo trước", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("AUTH_001", "Tài khoản hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    ACCOUNT_INACTIVE("AUTH_002", "Tài khoản chưa được kích hoạt", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED("AUTH_003", "Tài khoản đã bị khoá", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("AUTH_004", "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("AUTH_005", "Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    TOKEN_BLACKLISTED("AUTH_006", "Token đã bị thu hồi", HttpStatus.UNAUTHORIZED),
    PERMISSION_DENIED("AUTH_008", "Không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    LOGOUT_SUCCESS("AUTH_009", "Đăng xuất thành công", HttpStatus.OK),
    OTP_REQUIRED("AUTH_010", "Vui lòng nhập mã OTP", HttpStatus.BAD_REQUEST),
    OTP_INVALID("AUTH_011", "Mã OTP không hợp lệ", HttpStatus.BAD_REQUEST),
    // ========== Seller & Customer==========
    SELLER_NOT_FOUND("SEL_001", "Không tìm thấy người bán", HttpStatus.NOT_FOUND),
    CUSTOMER_NOT_FOUND("CUS_001", "Không tìm thấy khách hàng", HttpStatus.NOT_FOUND),


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
    CREATED("SUC_201", "Đã tạo", HttpStatus.CREATED),

    CANNOT_CANCEL_ORDER("ORD_002", "Không thể huỷ đơn hàng đã được xử lý", HttpStatus.BAD_REQUEST),


    // ========== Discount ==========
    DISCOUNT_NOT_FOUND("DSC_001", "Không tìm thấy mã giảm giá", HttpStatus.NOT_FOUND),
    DISCOUNT_INACTIVE_OR_EXPIRED("DSC_002", "Mã giảm giá không còn hiệu lực hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    DISCOUNT_ALREADY_USED_BY_USER("DSC_003", "Người dùng đã sử dụng mã giảm giá này", HttpStatus.BAD_REQUEST),
    DISCOUNT_ORDER_VALUE_TOO_LOW("DSC_004", "Giá trị đơn hàng không đủ điều kiện áp dụng mã giảm giá", HttpStatus.BAD_REQUEST),
    DISCOUNT_USAGE_LIMIT_REACHED("DSC_005", "Mã giảm giá đã đạt giới hạn sử dụng", HttpStatus.BAD_REQUEST),
    DISCOUNT_INVALID_PROVIDER("DSC_006", "Mã giảm giá không áp dụng cho nhà cung cấp này", HttpStatus.BAD_REQUEST);

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
