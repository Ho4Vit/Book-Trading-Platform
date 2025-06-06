package btp.bookingtradeplatform.Exception;

import btp.bookingtradeplatform.Model.Response.ResponseError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalHandleException {

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ResponseError> handleNullPointerException(NullPointerException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseError.builder()
                        .statusCode(HttpStatus.BAD_REQUEST.value())
                        .message(AppException.INTERNAL_SERVER_ERROR.getMessage())
                        .error(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseError> handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseError.builder()
                        .statusCode(HttpStatus.BAD_REQUEST.value())
                        .message(AppException.INTERNAL_SERVER_ERROR.getMessage())
                        .error(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseError> handleGenericException(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ResponseError.builder()
                        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message(AppException.INTERNAL_SERVER_ERROR.getMessage())
                        .error(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}
