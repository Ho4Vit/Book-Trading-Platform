package btp.bookingtradeplatform.Model.Entity;

import btp.bookingtradeplatform.Model.Enum.BookFormat;
import jakarta.persistence.*;

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
    private double price;
    private int stock;

    @ManyToOne
    private Seller seller;

    @ManyToOne
    private Series series;

    @Enumerated(EnumType.STRING)
    private BookFormat format; // PAPERBACK, HARDCOVER, EBOOK
}
