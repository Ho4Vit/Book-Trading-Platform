package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.FeedbackDTO;
import btp.bookingtradeplatform.Model.Entity.Feedback;
import btp.bookingtradeplatform.Model.Response.AvarageRating;
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

    public ResponseEntity<ResponseData<List<FeedbackDTO>>> getFeedbacksByBookId(Long bookId) {
        List<FeedbackDTO> feedbacks = feedbackRepository.findAllByBookId(bookId)
                .stream()
                .map(FeedbackDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched feedbacks for the book successfully",
                feedbacks
        ));
    }

    public ResponseEntity<ResponseData<AvarageRating>> getAverageRatingByBook(Long bookId) {
        List<Feedback> feedbacks = feedbackRepository.findAllByBookId(bookId);

        AvarageRating result = new AvarageRating();

        if (feedbacks.isEmpty()) {
            result.setAverageRating(0.0);
            result.setCount(0);
            return ResponseEntity.ok(new ResponseData<>(
                    AppException.SUCCESS.getCode(),
                    "No feedback found for this book",
                    result
            ));
        }

        double average = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);

        result.setAverageRating(average);
        result.setCount(feedbacks.size());

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Average rating calculated successfully",
                result
        ));
    }

}
