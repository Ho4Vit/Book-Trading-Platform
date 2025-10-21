package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.FeedbackDTO;
import btp.bookingtradeplatform.Model.Entity.Feedback;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // ✅ Lấy tất cả feedback
    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<FeedbackDTO>>> getAllFeedbacks() {
        return feedbackService.getAllFeedbacks();
    }

    // ✅ Lấy feedback theo ID
    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseData<FeedbackDTO>> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id);
    }

    // ✅ Tạo mới feedback
    @PostMapping("/create")
    public ResponseEntity<ResponseData<FeedbackDTO>> createFeedback(@RequestBody Feedback feedback) {
        return feedbackService.createFeedback(feedback);
    }

    // ✅ Xóa feedback theo ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteFeedback(@PathVariable Long id) {
        return feedbackService.deleteFeedback(id);
    }

    // ✅ Lấy trung bình rating của một sách
    @GetMapping("/average-rating/{bookId}")
    public ResponseEntity<ResponseData<Double>> getAverageRatingByBook(@PathVariable Long bookId) {
        return feedbackService.getAverageRatingByBook(bookId);
    }
}
