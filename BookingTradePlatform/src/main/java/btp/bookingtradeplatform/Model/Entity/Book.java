package btp.bookingtradeplatform.Model.Entity;

import btp.bookingtradeplatform.Model.Enum.BookFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String author;
    private String language;
    private int pageCount;

    private String coverImage;

    @ElementCollection
    private List<String> additionalImages = new ArrayList<>();

    private BigDecimal price;
    private int stock;

    @ManyToOne
    private Seller seller;

    @ManyToOne
    private Series series;

    @Enumerated(EnumType.STRING)
    private BookFormat format;

    @ManyToMany
    @JoinTable(
            name = "book_category",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories = new ArrayList<>();

    private boolean isActive = true;
}

