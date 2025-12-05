package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.SellerDTO;
import btp.bookingtradeplatform.Model.Entity.Seller;
import btp.bookingtradeplatform.Model.Enum.Role;
import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Request.RegisterSellerRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateSellerForm;
import btp.bookingtradeplatform.Repository.SellerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Transactional
@Service
public class SellerService {
    @Autowired
    private SellerRepository sellerRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public ResponseEntity<ResponseData<List<SellerDTO>>> getAllSeller() {
        List<Seller> seller = sellerRepository.findAll();
        List<SellerDTO> sellerDTOS = seller.stream()
                .map(SellerDTO::fromEntity)
                .toList();
        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        sellerDTOS
                ));
    }

    public ResponseEntity<ResponseData<SellerDTO>> getSellerById(Long id) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.SELLER_NOT_FOUND));
        SellerDTO sellerDTO = SellerDTO.fromEntity(seller);
        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        sellerDTO
                ));
    }

    public ResponseEntity<ResponseData<SellerDTO>> getSellerByEmail(EmailRequest emailRequest) {
        Seller seller = sellerRepository.findByEmail(emailRequest.getEmail())
                .orElseThrow(() -> new BusinessException(AppException.SELLER_NOT_FOUND));
        SellerDTO sellerDTO = SellerDTO.fromEntity(seller);
        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        sellerDTO
                ));
    }

    public ResponseEntity<ResponseData<SellerDTO>> createSeller(RegisterSellerRequest sellers) {
        if (sellerRepository.existsByEmail(sellers.getEmail())) {
            throw new BusinessException(AppException.EMAIL_ALREADY_EXISTS);
        }
        if (sellerRepository.existsByUsername(sellers.getUsername())) {
            throw new BusinessException(AppException.USERNAME_ALREADY_EXISTS);
        }
        Seller seller = new Seller();
        seller.setUsername(sellers.getUsername());
        seller.setEmail(sellers.getEmail());
        seller.setPassword(passwordEncoder.encode(sellers.getPassword()));
        seller.setFullName(sellers.getFullName());
        seller.setProfileImage(sellers.getProfileImage());
        seller.setPhone(sellers.getPhone());
        seller.setStoreName(sellers.getStoreName());
        seller.setStoreAddress(sellers.getStoreAddress());
        seller.setStoreDescription(sellers.getStoreDescription());
        seller.setRole(Role.SELLER);
        seller.setIsActive(true);
        seller.setIsEmailVerified(true);
        seller.setCreatedAt(LocalDateTime.now());

        Seller savedSeller = sellerRepository.save(seller);
        SellerDTO savedSellerDTO = SellerDTO.fromEntity(savedSeller);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        savedSellerDTO
                ));
    }

    public ResponseEntity<ResponseData<SellerDTO>> updateSeller(Long id, UpdateSellerForm request) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.SELLER_NOT_FOUND));

        if (request.getFullName() != null) seller.setFullName(request.getFullName());
        if (request.getProfileImage() != null) seller.setProfileImage(request.getProfileImage());
        if (request.getPhone() != null) seller.setPhone(request.getPhone());
        if (request.getStoreName() != null) seller.setStoreName(request.getStoreName());
        if (request.getStoreAddress() != null) seller.setStoreAddress(request.getStoreAddress());
        if (request.getStoreDescription() != null) seller.setStoreDescription(request.getStoreDescription());

        Seller updatedSeller = sellerRepository.save(seller);
        SellerDTO sellerDTO = SellerDTO.fromEntity(updatedSeller);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        sellerDTO
                ));
    }



}
