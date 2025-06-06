package btp.bookingtradeplatform.Model.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Seller extends User {
    private String storeName;
    private String storeAddress;
    private String storeDescription;
    private String phone;

    @OneToMany(mappedBy = "seller")
    private List<Book> books;
}

