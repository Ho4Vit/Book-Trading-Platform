package btp.bookingtradeplatform.Model.Request;

import btp.bookingtradeplatform.Model.Enum.BookFormat;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateBookRequest {
    private String title;
    private String description;
    private String author;
    private String language;
    private int pageCount;
    private String coverImage;
    private List<String> additionalImages;
    private BigDecimal price;
    private int stock;

    private Long sellerId;
    private Long seriesId;

    private BookFormat format;

    private List<Long> categoryIds;
}
