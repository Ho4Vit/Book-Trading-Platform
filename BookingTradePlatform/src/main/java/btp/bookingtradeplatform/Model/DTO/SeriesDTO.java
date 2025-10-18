package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Series;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeriesDTO {
    private Long id;
    private String name;
    private String description;
    private List<BookDTO> books;

    public static SeriesDTO fromEntity(Series series) {
        return new SeriesDTO(
                series.getId(),
                series.getName(),
                series.getDescription(),
                series.getBooks() != null
                        ? series.getBooks().stream()
                        .map(BookDTO::fromEntity)
                        .collect(Collectors.toList())
                        : null
        );
    }
}
