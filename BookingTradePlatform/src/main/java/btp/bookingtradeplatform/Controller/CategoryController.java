package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.CategoryDTO;
import btp.bookingtradeplatform.Model.Request.CreateCategoryRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateCategoryForm;
import btp.bookingtradeplatform.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<CategoryDTO>>> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<CategoryDTO>> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseData<CategoryDTO>> createCategory(@RequestBody CreateCategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<CategoryDTO>> updateCategory(
            @PathVariable Long id,
            @RequestBody UpdateCategoryForm request) {
        return categoryService.updateCategory(id, request);
    }

}
