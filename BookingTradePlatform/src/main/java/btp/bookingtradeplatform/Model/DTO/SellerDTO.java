package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Seller;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SellerDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String profileImage;
    private String storeName;
    private String storeAddress;
    private String storeDescription;

    public static SellerDTO fromEntity(Seller seller) {
        return SellerDTO.builder()
                .id(seller.getId())
                .email(seller.getEmail())
                .fullName(seller.getFullName())
                .profileImage(seller.getProfileImage())
                .storeName(seller.getStoreName())
                .storeAddress(seller.getStoreAddress())
                .storeDescription(seller.getStoreDescription())
                .phoneNumber(seller.getPhone())
                .build();
    }
}
