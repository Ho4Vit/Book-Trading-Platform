package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.SellerDTO;
import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Request.RegisterSellerRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateSellerForm;
import btp.bookingtradeplatform.Service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sellers")
public class SellerController {
    @Autowired
    private SellerService sellerService;

    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<SellerDTO>>> getAllSellers() {
        return sellerService.getAllSeller();
    }

    @GetMapping("/getbyid/{id}")
    public ResponseEntity<ResponseData<SellerDTO>> getSellerById(@PathVariable Long id) {
        return sellerService.getSellerById(id);
    }

    @GetMapping("/getbyemail")
    public ResponseEntity<ResponseData<SellerDTO>> getSellerByEmail(@RequestBody EmailRequest email) {
        return sellerService.getSellerByEmail(email);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseData<SellerDTO>> registerSeller(@RequestBody RegisterSellerRequest request) {
        return sellerService.createSeller(request);
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ResponseData<SellerDTO>> updateSeller(@PathVariable Long id, @RequestBody UpdateSellerForm updateForm) {
        return sellerService.updateSeller(id, updateForm);
    }
}
