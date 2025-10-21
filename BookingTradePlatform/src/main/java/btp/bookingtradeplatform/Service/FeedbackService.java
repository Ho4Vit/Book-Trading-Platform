package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.FeedbackDTO;
import btp.bookingtradeplatform.Model.Entity.Feedback;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // ✅ Lấy tất cả feedback
    public ResponseEntity<ResponseData<List<FeedbackDTO>>> getAllFeedbacks() {
        List<FeedbackDTO> list = feedbackRepository.findAll()
                .stream()
                .map(FeedbackDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched all feedbacks",
                list
        ));
    }

    // ✅ Lấy feedback theo ID
    public ResponseEntity<ResponseData<FeedbackDTO>> getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched feedback successfully",
                FeedbackDTO.fromEntity(feedback)
        ));
    }

    // ✅ Tạo mới feedback
    public ResponseEntity<ResponseData<FeedbackDTO>> createFeedback(Feedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Feedback submitted successfully",
                FeedbackDTO.fromEntity(saved)
        ));
    }

    // ✅ Xóa feedback theo ID
    public ResponseEntity<ResponseData<Void>> deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        feedbackRepository.delete(feedback);
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Feedback deleted successfully",
                null
        ));
    }

    // ✅ Tính trung bình rating của một cuốn sách theo bookId
    public ResponseEntity<ResponseData<Double>> getAverageRatingByBook(Long bookId) {
        List<Feedback> feedbacks = feedbackRepository.findAllByBookId(bookId);

        if (feedbacks.isEmpty()) {
            return ResponseEntity.ok(new ResponseData<>(
                    AppException.SUCCESS.getCode(),
                    "No feedback found for this book",
                    0.0
            ));
        }

        double average = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Average rating calculated successfully",
                average
        ));
    }
}
