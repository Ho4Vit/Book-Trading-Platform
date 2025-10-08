package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Model.Entity.User;
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.UserRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class BookImageService {

    private final Cloudinary cloudinary;
    private final BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    // Upload file lên Cloudinary với custom filename
    private String uploadFile(MultipartFile file, String fileName) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "books",
                        "public_id", fileName,
                        "overwrite", true
                ));
        return uploadResult.get("secure_url").toString();
    }

    public Book uploadBookImages(Long bookId, MultipartFile coverImage, List<MultipartFile> additionalImages) throws IOException {
        Optional<Book> optionalBook = bookRepository.findById(bookId);
        if (optionalBook.isEmpty()) {
            throw new RuntimeException("Book not found with ID: " + bookId);
        }

        Book book = optionalBook.get();
        if (coverImage != null && !coverImage.isEmpty()) {
            String coverFileName = "book_" + bookId + "_cover";
            String coverUrl = uploadFile(coverImage, coverFileName);
            book.setCoverImage(coverUrl);
        }

        if (additionalImages != null && !additionalImages.isEmpty()) {
            List<String> urls = new ArrayList<>();
            int index = 1;
            for (MultipartFile img : additionalImages) {
                String fileName = "book_" + bookId + "_extra_" + index;
                String url = uploadFile(img, fileName);
                urls.add(url);
                index++;
            }
            book.setAdditionalImages(urls);
        }

        return bookRepository.save(book);
    }

    public User updateAvatar(Long userId, MultipartFile avatarFile) throws IOException {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        User user = optionalUser.get();

        if (avatarFile != null && !avatarFile.isEmpty()) {
            // Đặt tên file dễ nhớ
            String fileName = "user_" + userId + "_avatar";

            Map uploadResult = cloudinary.uploader().upload(
                    avatarFile.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "users",
                            "public_id", fileName,
                            "overwrite", true
                    )
            );

            String avatarUrl = uploadResult.get("secure_url").toString();
            user.setProfileImage(avatarUrl);
        }

        return userRepository.save(user);
    }

}