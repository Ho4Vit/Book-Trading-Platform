package btp.bookingtradeplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableAsync
public class BookingTradePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookingTradePlatformApplication.class, args);
    }

}
