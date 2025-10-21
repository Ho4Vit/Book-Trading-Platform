package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Model.DTO.BookDTO;
import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Model.Request.CreateBookRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateBookForm;
import btp.bookingtradeplatform.Service.BookImageService;
import btp.bookingtradeplatform.Service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookImageService bookImageService;

    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<BookDTO>>> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseData<BookDTO>> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @PostMapping("/create")
//    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ResponseData<BookDTO>> createBook(@RequestBody CreateBookRequest request) {
        return bookService.createBook(request);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseData<BookDTO>> updateBook(
            @PathVariable Long id,
            @RequestBody UpdateBookForm request) {
        return bookService.updateBook(id, request);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        return bookService.deleteBook(id);
    }

    @PostMapping("/image/{bookId}")
    public ResponseEntity<ResponseData<Void>> uploadImages(
            @PathVariable Long bookId,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestPart(value = "additionalImages", required = false) List<MultipartFile> additionalImages
    ) throws IOException {
        Book updatedBook = bookImageService.uploadBookImages(bookId, coverImage, additionalImages);
        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        "Upload images successfully",
                        null
                ));
    }

    @GetMapping("/search")
    public ResponseEntity<ResponseData<List<BookDTO>>> searchBooks(@RequestParam("q") String keyword) {
        return bookService.searchBooks(keyword);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ResponseData<List<BookDTO>>> getBooksBySeller(@PathVariable Long sellerId) {
        return bookService.getBooksbySeller(sellerId);
    }

}
