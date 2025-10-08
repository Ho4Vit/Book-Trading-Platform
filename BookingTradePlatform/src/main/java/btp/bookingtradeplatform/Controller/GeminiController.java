package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class GeminiController {

    private final GeminiService geminiService;

    @GetMapping
    public String chat(@RequestParam String message) {
        return geminiService.chat(message);
    }

}
