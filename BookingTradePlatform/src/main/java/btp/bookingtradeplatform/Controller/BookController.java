package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.BookDTO;
import btp.bookingtradeplatform.Model.Request.CreateBookRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateBookForm;
import btp.bookingtradeplatform.Service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<BookDTO>>> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<BookDTO>> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseData<BookDTO>> createBook(@RequestBody CreateBookRequest request) {
        return bookService.createBook(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<BookDTO>> updateBook(
            @PathVariable Long id,
            @RequestBody UpdateBookForm request) {
        return bookService.updateBook(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        return bookService.deleteBook(id);
    }
}
