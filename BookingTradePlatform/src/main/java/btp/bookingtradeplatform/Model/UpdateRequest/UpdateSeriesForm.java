package btp.bookingtradeplatform.Model.UpdateRequest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSeriesForm {
    private String name;
    private String description;
    private List<Long> bookIds;
}
