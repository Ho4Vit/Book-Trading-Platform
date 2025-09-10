package btp.bookingtradeplatform.Model.Request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateFeedbackRequest {
    private Long customerId;
    private Long bookId;
    private int rating;
    private String comment;
}
