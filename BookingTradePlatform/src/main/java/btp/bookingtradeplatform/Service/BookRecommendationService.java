package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Model.DTO.BookSummaryDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookRecommendationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();
    private final BookService bookService;

    @Value("${ai.api.url}")
    private String aiApiUrl;

    @Value("${ai.api.key}")
    private String aiApiKey;

    /**
     * Gợi ý sách dựa trên mô tả người dùng
     */
    public List<BookSummaryDTO> recommendBooks(String userDescription) {
        try {
            // Lấy danh sách sách tóm tắt
            List<BookSummaryDTO> bookSummaries = bookService.getAllBookSummaries();

            // Convert list sang JSON
            String bookJson = mapper.writeValueAsString(bookSummaries);

            // Prompt gửi lên AI
            String prompt =
                    "Dựa trên danh sách sách dưới đây, hãy chọn ra các cuốn sách phù hợp với mô tả người dùng: \""
                            + userDescription + "\"\n" +
                            "Yêu cầu:\n" +
                            "- Trả về JSON dạng [{\"id\":..., \"title\":..., \"description\":...}]\n" +
                            "- Không thêm text ngoài JSON\n" +
                            "- Không dùng Markdown\n\n" +
                            "Danh sách sách JSON:\n" + bookJson;

            // Payload theo format Gemini
            Map<String, Object> payload = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of("text", prompt)
                                    )
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity =
                    new HttpEntity<>(mapper.writeValueAsString(payload), headers);

            String url = aiApiUrl + "?key=" + aiApiKey;

            // Gọi AI
            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            // Parse JSON trả về
            JsonNode root = mapper.readTree(response.getBody());

            // Lấy text chứa JSON array
            String textResult = root
                    .get("candidates").get(0)
                    .get("content")
                    .get("parts").get(0)
                    .get("text")
                    .asText();

            // Convert JSON text thành List<BookSummaryDTO>
            return mapper.readValue(textResult, new TypeReference<List<BookSummaryDTO>>() {});

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
