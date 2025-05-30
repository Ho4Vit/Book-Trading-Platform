package btp.bookingtradeplatform.Model.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.List;

@Entity
public class Seller extends User {
    private String storeName;
    private String storeDescription;

    @OneToMany(mappedBy = "seller")
    private List<Book> books;
}

