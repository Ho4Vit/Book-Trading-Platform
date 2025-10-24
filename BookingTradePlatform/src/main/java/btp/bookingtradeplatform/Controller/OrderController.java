package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.OrderDTO;
import btp.bookingtradeplatform.Model.Entity.Order;
import btp.bookingtradeplatform.Model.Request.CreateOrderRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateOrderStatus;
import btp.bookingtradeplatform.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Lấy tất cả đơn hàng
    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<OrderDTO>>> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Lấy chi tiết 1 đơn hàng theo ID
    @GetMapping("/getbyid/{id}")
    public ResponseEntity<ResponseData<OrderDTO>> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    // Tạo đơn hàng mới
    @PostMapping("/create")
    public ResponseEntity<ResponseData<OrderDTO>> createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    // Cập nhật trạng thái đơn hàng
    @PutMapping("status/{id}")
    public ResponseEntity<ResponseData<OrderDTO>> updateOrderStatus(@PathVariable Long id,
                                                                 @RequestBody UpdateOrderStatus request) {
        return orderService.updateOrderStatus(id, request);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ResponseData<List<OrderDTO>>> getOrdersByCustomerId(@PathVariable Long customerId) {
        return orderService.getOrdersByCustomerId(customerId);
    }

    @PostMapping("/cancel/{id}")
    public ResponseEntity<ResponseData<Void>> cancelOrder(@PathVariable Long id) {
        return orderService.CancelOrder(id);
    }

    @GetMapping("/seller/pending/{sellerId}")
    public ResponseEntity<ResponseData<List<OrderDTO>>> getPendingOrdersBySeller(
            @PathVariable Long sellerId) {
        return orderService.getOrdersBySellerId(sellerId);
    }

}
