package btp.bookingtradeplatform.Model.Entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Series {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @OneToMany(mappedBy = "series")
    private List<Book> books;
}
