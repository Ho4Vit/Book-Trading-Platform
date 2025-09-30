package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Model.Entity.Category;
import btp.bookingtradeplatform.Model.Enum.BookFormat;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookDTO {
    private Long id;
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
    private List<String> categoryNames;
    private boolean isActive;
    private int soldCount;

    public static BookDTO fromEntity(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .description(book.getDescription())
                .author(book.getAuthor())
                .language(book.getLanguage())
                .pageCount(book.getPageCount())
                .coverImage(book.getCoverImage())
                .additionalImages(book.getAdditionalImages())
                .price(book.getPrice())
                .stock(book.getStock())
                .sellerId(book.getSeller() != null ? book.getSeller().getId() : null)
                .seriesId(book.getSeries() != null ? book.getSeries().getId() : null)
                .format(book.getFormat())
                .categoryNames(book.getCategories().stream().map(Category::getName).collect(Collectors.toList()))
                .isActive(book.isActive())
                .soldCount(book.getSoldCount())
                .build();
    }
}
