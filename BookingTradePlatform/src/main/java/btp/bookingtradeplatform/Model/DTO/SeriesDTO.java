package btp.bookingtradeplatform.Model.DTO;

import java.util.List;

import lombok.Data;

@Data
public class SeriesDTO {
    private Long id;
    private String name;
    private String description;
    private List<BookDTO> books;

    // Constructors
    public SeriesDTO() {}

    public SeriesDTO(Long id, String name, String description, List<BookDTO> books) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.books = books;
    }
}
