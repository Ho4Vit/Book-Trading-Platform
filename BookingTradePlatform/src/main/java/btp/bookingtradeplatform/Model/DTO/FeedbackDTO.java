package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Feedback;
import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeedbackDTO {

    private Long id;
    private String content;
    private int rating;
    private LocalDateTime createdAt;
    private Long customerId;
    private Long bookId;
    private boolean visible;

    public static FeedbackDTO fromEntity(Feedback feedback) {
        if (feedback == null) {
            return null;
        }
        return FeedbackDTO.builder()
                .id(feedback.getId())
                .content(feedback.getContent())
                .rating(feedback.getRating())
                .createdAt(feedback.getCreatedAt())
                .customerId(feedback.getCustomerId())
                .bookId(feedback.getBookId())
                .visible(feedback.isVisible())
                .build();
    }
}
