package btp.bookingtradeplatform.Model.UpdateRequest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSellerForm {
    private String fullName;
    private String profileImage;

    private String phone;
    private String storeName;
    private String storeAddress;
    private String storeDescription;
}
