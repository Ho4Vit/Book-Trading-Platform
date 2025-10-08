package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.BookDTO;
import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Model.Entity.Category;
import btp.bookingtradeplatform.Model.Entity.Seller;
import btp.bookingtradeplatform.Model.Request.CreateBookRequest;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateBookForm;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.CategoryRepository;
import btp.bookingtradeplatform.Repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Transactional
@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public ResponseEntity<ResponseData<List<BookDTO>>> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        List<BookDTO> bookDTOs = books.stream().map(BookDTO::fromEntity).toList();

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        bookDTOs
                ));
    }

    public ResponseEntity<ResponseData<BookDTO>> getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        BookDTO.fromEntity(book)
                ));
    }


    public ResponseEntity<ResponseData<BookDTO>> createBook(CreateBookRequest request) {
        Seller seller = sellerRepository.findById(request.getSellerId())
                .orElseThrow(() -> new BusinessException(AppException.SELLER_NOT_FOUND));

        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());

        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setDescription(request.getDescription());
        book.setAuthor(request.getAuthor());
        book.setLanguage(request.getLanguage());
        book.setPageCount(request.getPageCount());
        book.setCoverImage(request.getCoverImage());
        book.setAdditionalImages(request.getAdditionalImages());
        book.setPrice(request.getPrice());
        book.setStock(request.getStock());
        book.setSeller(seller);
//        book.setSeries(request.getSeries()); // có thể null nếu không có series
        book.setFormat(request.getFormat());
        book.setCategories(categories);

        Book saved = bookRepository.save(book);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        BookDTO.fromEntity(saved)
                ));
    }

    public ResponseEntity<ResponseData<BookDTO>> updateBook(Long id, UpdateBookForm request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));

        if (request.getTitle() != null) book.setTitle(request.getTitle());
        if (request.getDescription() != null) book.setDescription(request.getDescription());
        if (request.getAuthor() != null) book.setAuthor(request.getAuthor());
        if (request.getLanguage() != null) book.setLanguage(request.getLanguage());
        if (request.getPageCount() != null) book.setPageCount(request.getPageCount());
        if (request.getCoverImage() != null) book.setCoverImage(request.getCoverImage());
        if (request.getAdditionalImages() != null) book.setAdditionalImages(request.getAdditionalImages());
        if (request.getPrice() != null) book.setPrice(request.getPrice());
        if (request.getStock() != null) book.setStock(request.getStock());
        if (request.getFormat() != null) book.setFormat(request.getFormat());

        if (request.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            book.setCategories(categories);
        }

        Book updated = bookRepository.save(book);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        BookDTO.fromEntity(updated)
                ));
    }

    public ResponseEntity<?> deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));

        bookRepository.delete(book);

        return ResponseEntity.ok("Deleted successfully.");
    }

    public ResponseEntity<ResponseData<List<BookDTO>>> searchBooks(String keyword) {
        List<Book> search = bookRepository.searchByKeyword(keyword);
        List<BookDTO> bookDTOs = search.stream().map(BookDTO::fromEntity).toList();

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        bookDTOs
                ));
    }
}
