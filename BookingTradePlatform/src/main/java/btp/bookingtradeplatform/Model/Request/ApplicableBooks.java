package btp.bookingtradeplatform.Model.Request;

import lombok.Data;
import java.util.List;

@Data
public class ApplicableBooks {
    private List<Long> bookIds;
}
