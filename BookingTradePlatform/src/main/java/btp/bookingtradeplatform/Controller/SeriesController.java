package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.Entity.Series;
import btp.bookingtradeplatform.Model.Request.CreateSeriesRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateSeriesForm;
import btp.bookingtradeplatform.Service.SeriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/series")
public class SeriesController {

    @Autowired
    private SeriesService seriesService;

    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<Series>>> getAllSeries() {
        return seriesService.getAllSeries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<Series>> getSeriesById(@PathVariable Long id) {
        return seriesService.getSeriesById(id);
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseData<Series>> createSeries(@RequestBody CreateSeriesRequest request) {
        return seriesService.createSeries(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<Series>> updateSeries(
            @PathVariable Long id,
            @RequestBody UpdateSeriesForm request) {
        return seriesService.updateSeries(id, request);
    }
}
