package btp.bookingtradeplatform.Model.DeleteRequest;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RemoveCartItemRequest {
    private Long userId;
    private Long bookId;
}
