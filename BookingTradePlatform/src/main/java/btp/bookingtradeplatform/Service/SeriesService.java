package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Model.Entity.Series;
import btp.bookingtradeplatform.Model.Request.CreateSeriesRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateSeriesForm;
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.SerieRepository;
import btp.bookingtradeplatform.Model.DTO.SeriesDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Transactional
@Service
public class SeriesService {

    @Autowired
    private SerieRepository seriesRepository;

    @Autowired
    private BookRepository bookRepository;

    public ResponseEntity<ResponseData<List<SeriesDTO>>> getAllSeries() {
        List<SeriesDTO> seriesDTOList = seriesRepository.findAll().stream()
                .map(SeriesDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        seriesDTOList
                ));
    }

    public ResponseEntity<ResponseData<SeriesDTO>> getSeriesById(Long id) {
        Series series = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        SeriesDTO.fromEntity(series)
                ));
    }

    public ResponseEntity<ResponseData<SeriesDTO>> createSeries(CreateSeriesRequest request) {
        if (seriesRepository.existsByName(request.getName())) {
            throw new BusinessException(AppException.ALREADY_EXISTS);
        }
        Series series = new Series();
        series.setName(request.getName());
        series.setDescription(request.getDescription());

        if (request.getBookIds() != null && !request.getBookIds().isEmpty()) {
            List<Book> books = bookRepository.findAllById(request.getBookIds());
            for (Book book : books) {
                book.setSeries(series);
            }
            series.setBooks(books);
        }
        Series saved = seriesRepository.save(series);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        SeriesDTO.fromEntity(saved)
                ));
    }


    public ResponseEntity<ResponseData<SeriesDTO>> updateSeries(Long id, UpdateSeriesForm request) {
        Series existing = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        // Cập nhật tên và mô tả
        if (request.getName() != null) existing.setName(request.getName());
        if (request.getDescription() != null) existing.setDescription(request.getDescription());

        if (request.getBookIds() != null) {
            List<Book> currentBooks = existing.getBooks();
            if (currentBooks != null) {
                for (Book book : currentBooks) {
                    if (!request.getBookIds().contains(book.getId())) {
                        book.setSeries(null);
                        bookRepository.save(book);// cập nhật book
                    }
                }
            }

            List<Book> newBooks = bookRepository.findAllById(request.getBookIds());

            // Gán series vào từng book mới
            for (Book book : newBooks) {
                book.setSeries(existing);
                bookRepository.save(book);// cập nhật book
            }

            existing.setBooks(newBooks);
        }

        Series updated = seriesRepository.save(existing);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        SeriesDTO.fromEntity(updated)
                ));
    }



}
