package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Feedback;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDTO {
    private Long id;
    private Long customerId;
    private Long bookId;
    private int rating;
    private String content;
    private LocalDateTime createdAt;

    public static FeedbackDTO fromEntity(Feedback feedback) {
        return FeedbackDTO.builder()
                .id(feedback.getId())
                .customerId(feedback.getCustomer().getId())
                .bookId(feedback.getBook().getId())
                .rating(feedback.getRating())
                .content(feedback.getContent())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
