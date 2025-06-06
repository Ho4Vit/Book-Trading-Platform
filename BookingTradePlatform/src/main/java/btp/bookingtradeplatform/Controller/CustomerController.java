package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.CustomerDTO;
import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Request.RegisterSellerRequest;
import btp.bookingtradeplatform.Model.Request.RegiterCustomerRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateCustomerForm;
import btp.bookingtradeplatform.Service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<CustomerDTO>>> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @GetMapping("/getbyid/{id}")
    public ResponseEntity<ResponseData<CustomerDTO>> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id);
    }

    @GetMapping("/getbyemail")
    public ResponseEntity<ResponseData<CustomerDTO>> getCustomerByEmail(@RequestBody EmailRequest emailRequest) {
        return customerService.getCustomerByEmail(emailRequest);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseData<CustomerDTO>> registerCustomer(@RequestBody RegiterCustomerRequest request) {
        return customerService.createCustomer(request);
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ResponseData<CustomerDTO>> updateCustomer(@PathVariable Long id, @RequestBody UpdateCustomerForm updateForm) {
        return customerService.updateCustomer(id, updateForm);
    }
}
