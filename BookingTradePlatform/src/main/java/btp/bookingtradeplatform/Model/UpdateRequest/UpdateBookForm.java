package btp.bookingtradeplatform.Model.UpdateRequest;

import btp.bookingtradeplatform.Model.Enum.BookFormat;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateBookForm {
    private String title;
    private String description;
    private String author;
    private String language;
    private Integer pageCount;
    private String coverImage;
    private List<String> additionalImages;
    private BigDecimal price;
    private Integer stock;

    private Long seriesId;
    private BookFormat format;

    private List<Long> categoryIds;
}
