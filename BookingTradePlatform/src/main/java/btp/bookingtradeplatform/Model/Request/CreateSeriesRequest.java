package btp.bookingtradeplatform.Model.Request;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateSeriesRequest {
    private String name;
    private String description;
    private List<Long> bookIds;
}
