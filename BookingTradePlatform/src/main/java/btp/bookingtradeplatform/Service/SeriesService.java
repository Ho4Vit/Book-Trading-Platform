package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.Series;
import btp.bookingtradeplatform.Model.Request.CreateSeriesRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateSeriesForm;
import btp.bookingtradeplatform.Repository.SerieRepository;
import btp.bookingtradeplatform.Model.DTO.SeriesDTO;
import btp.bookingtradeplatform.Model.DTO.BookDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeriesService {

    @Autowired
    private SerieRepository seriesRepository;

    public ResponseEntity<ResponseData<List<SeriesDTO>>> getAllSeries() {
        List<SeriesDTO> seriesDTOList = seriesRepository.findAll().stream()
                .map(series -> new SeriesDTO(
                        series.getId(),
                        series.getName(),
                        series.getDescription(),
                        series.getBooks().stream()
                                .map(BookDTO::fromEntity)
                                .collect(Collectors.toList())
                ))
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

        SeriesDTO seriesDTO = new SeriesDTO(
                series.getId(),
                series.getName(),
                series.getDescription(),
                series.getBooks().stream()
                        .map(BookDTO::fromEntity)
                        .collect(Collectors.toList())
        );

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        seriesDTO
                ));
    }

    public ResponseEntity<ResponseData<SeriesDTO>> createSeries(CreateSeriesRequest request) {
        if (seriesRepository.existsByName(request.getName())) {
            throw new BusinessException(AppException.ALREADY_EXISTS);
        }
        Series requestEntity = new Series();
        requestEntity.setName(request.getName());
        requestEntity.setDescription(request.getDescription());

        Series savedSeries = seriesRepository.save(requestEntity);

        SeriesDTO seriesDTO = new SeriesDTO(
                savedSeries.getId(),
                savedSeries.getName(),
                savedSeries.getDescription(),
                savedSeries.getBooks().stream()
                        .map(BookDTO::fromEntity)
                        .collect(Collectors.toList())
        );

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        seriesDTO
                ));
    }

    public ResponseEntity<ResponseData<SeriesDTO>> updateSeries(Long id, UpdateSeriesForm request) {
        Series existing = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        if (request.getName() != null) existing.setName(request.getName());
        if (request.getDescription() != null) existing.setDescription(request.getDescription());

        Series updated = seriesRepository.save(existing);

        SeriesDTO seriesDTO = new SeriesDTO(
                updated.getId(),
                updated.getName(),
                updated.getDescription(),
                updated.getBooks().stream()
                        .map(BookDTO::fromEntity)
                        .collect(Collectors.toList())
        );

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        seriesDTO
                ));
    }

}
