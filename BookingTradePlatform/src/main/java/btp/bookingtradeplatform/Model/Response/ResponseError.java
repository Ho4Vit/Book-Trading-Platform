package btp.bookingtradeplatform.Model.Response;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResponseError implements Serializable {
    private int statusCode;
    private String message;
    private String error;
    private LocalDateTime timestamp;
}
