package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.Feedback;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    public ResponseEntity<ResponseData<List<Feedback>>> getAllFeedbacks() {
        List<Feedback> list = feedbackRepository.findAll();
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched all feedbacks",
                list
        ));
    }

    public ResponseEntity<ResponseData<Feedback>> getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched feedback successfully",
                feedback
        ));
    }

    public ResponseEntity<ResponseData<Feedback>> createFeedback(Feedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Feedback submitted successfully",
                saved
        ));
    }
}
