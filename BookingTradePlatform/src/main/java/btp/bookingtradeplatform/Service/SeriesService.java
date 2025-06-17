package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.Series;
import btp.bookingtradeplatform.Model.Request.CreateSeriesRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateSeriesForm;
import btp.bookingtradeplatform.Repository.SerieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeriesService {

    @Autowired
    private SerieRepository seriesRepository;

    public ResponseEntity<ResponseData<List<Series>>> getAllSeries() {
        List<Series> seriesList = seriesRepository.findAll();

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        seriesList
                ));
    }

    public ResponseEntity<ResponseData<Series>> getSeriesById(Long id) {
        Series series = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        series
                ));
    }

    public ResponseEntity<ResponseData<Series>> createSeries(CreateSeriesRequest request) {
        if (seriesRepository.existsByName(request.getName())) {
            throw new BusinessException(AppException.ALREADY_EXISTS);
        }
        Series requestEntity = new Series();
        requestEntity.setName(request.getName());
        requestEntity.setDescription(request.getDescription());

        Series savedSeries = seriesRepository.save(requestEntity);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        savedSeries
                ));
    }

    public ResponseEntity<ResponseData<Series>> updateSeries(Long id, UpdateSeriesForm request) {
        Series existing = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        if (request.getName() != null) existing.setName(request.getName());
        if (request.getDescription() != null) existing.setDescription(request.getDescription());

        Series updated = seriesRepository.save(existing);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        updated
                ));
    }

}
