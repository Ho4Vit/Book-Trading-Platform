package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.CustomerDTO;
import btp.bookingtradeplatform.Model.Entity.Customer;
import btp.bookingtradeplatform.Model.Enum.Role;
import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Request.RegiterCustomerRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateCustomerForm;
import btp.bookingtradeplatform.Repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
@Transactional
@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ResponseEntity<ResponseData<List<CustomerDTO>>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        List<CustomerDTO> customerDTOS = customers.stream()
                .map(CustomerDTO::fromEntity)
                .toList();

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        customerDTOS
                ));
    }

    public ResponseEntity<ResponseData<CustomerDTO>> getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.USER_NOT_FOUND));

        CustomerDTO dto = CustomerDTO.fromEntity(customer);
        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        dto
                ));
    }

    public ResponseEntity<ResponseData<CustomerDTO>> getCustomerByEmail(EmailRequest emailRequest) {
        Customer customer = customerRepository.findByEmail(emailRequest.getEmail())
                .orElseThrow(() -> new BusinessException(AppException.USER_NOT_FOUND));

        CustomerDTO dto = CustomerDTO.fromEntity(customer);
        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        dto
                ));
    }

    public ResponseEntity<ResponseData<CustomerDTO>> createCustomer(RegiterCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(AppException.EMAIL_ALREADY_EXISTS);
        }
        if (customerRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(AppException.USERNAME_ALREADY_EXISTS);
        }

        Customer customer = new Customer();
        customer.setUsername(request.getUsername());
        customer.setEmail(request.getEmail());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setFullName(request.getFullName());
        customer.setProfileImage(request.getProfileImage());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setRole(Role.CUSTOMER);
        customer.setIsActive(true);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setLastLoginAt(LocalDateTime.now());
        customer.setIsEmailVerified(true);

        Customer savedCustomer = customerRepository.save(customer);
        CustomerDTO dto = CustomerDTO.fromEntity(savedCustomer);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        dto
                ));
    }

    public ResponseEntity<ResponseData<CustomerDTO>> updateCustomer(Long id, UpdateCustomerForm request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.USER_NOT_FOUND));

        if (request.getFullName() != null) customer.setFullName(request.getFullName());
        if (request.getProfileImage() != null) customer.setProfileImage(request.getProfileImage());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getDateOfBirth() != null) customer.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) customer.setGender(request.getGender());

        Customer updatedCustomer = customerRepository.save(customer);
        CustomerDTO dto = CustomerDTO.fromEntity(updatedCustomer);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        dto
                ));
    }
}
