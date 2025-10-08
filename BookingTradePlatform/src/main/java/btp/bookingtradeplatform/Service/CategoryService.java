package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.CategoryDTO;
import btp.bookingtradeplatform.Model.Entity.Category;
import btp.bookingtradeplatform.Model.Request.CreateCategoryRequest;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateCategoryForm;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Transactional
@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public ResponseEntity<ResponseData<List<CategoryDTO>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDTO> dtos = categories.stream()
                .map(CategoryDTO::fromEntity)
                .toList();

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        dtos
                ));
    }

    public ResponseEntity<ResponseData<CategoryDTO>> getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        CategoryDTO.fromEntity(category)
                ));
    }

    public ResponseEntity<ResponseData<CategoryDTO>> createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BusinessException(AppException.ALREADY_EXISTS);
        }

        Category category = new Category();
        category.setName(request.getName());

        Category saved = categoryRepository.save(category);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        CategoryDTO.fromEntity(saved)
                ));
    }

    public ResponseEntity<ResponseData<CategoryDTO>> updateCategory(Long id, UpdateCategoryForm request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        if (request.getName() != null && !request.getName().isEmpty()) {
            category.setName(request.getName());
        }

        Category updated = categoryRepository.save(category);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        CategoryDTO.fromEntity(updated)
                ));
    }

}
