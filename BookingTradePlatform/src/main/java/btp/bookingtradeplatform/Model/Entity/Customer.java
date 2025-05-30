package btp.bookingtradeplatform.Model.Entity;

import jakarta.persistence.Entity;

@Entity
public class Customer extends User {
    private String phone;
    private String address;
}
