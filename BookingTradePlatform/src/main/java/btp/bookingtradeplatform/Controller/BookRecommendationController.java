package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.BookSummaryDTO;
import btp.bookingtradeplatform.Service.BookRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
public class BookRecommendationController {

    private final BookRecommendationService recommendationService;

    @PostMapping
    public List<BookSummaryDTO> recommend(@RequestParam String description) {
        return recommendationService.recommendBooks(description);
    }
}
