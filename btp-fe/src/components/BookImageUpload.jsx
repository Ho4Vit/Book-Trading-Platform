import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

const BookImageUpload = forwardRef(({
    coverImagePreview,
    setCoverImagePreview,
    additionalImagesPreviews,
    setAdditionalImagesPreviews,
    setCoverImageFile,
    setAdditionalImagesFiles,
    maxAdditionalImages = 5
}, ref) => {
    const coverImageInputRef = useRef(null);
    const additionalImagesInputRef = useRef(null);

    // Expose refs to parent component
    useImperativeHandle(ref, () => ({
        coverImageInputRef,
        additionalImagesInputRef,
    }));

    const handleCoverImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Vui lòng chọn file ảnh!");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 5MB!");
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setCoverImageFile(file);
        }
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files || []);

        // Check total number of images (existing + new)
        const totalImages = additionalImagesPreviews.length + files.length;
        if (totalImages > maxAdditionalImages) {
            toast.error(`Tối đa ${maxAdditionalImages} ảnh bổ sung!`);
            return;
        }

        // Validate each file
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error("Vui lòng chọn file ảnh!");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 5MB!");
                return;
            }
        }

        // Create previews for new files
        const newPreviews = [];
        let loadedCount = 0;

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                loadedCount++;

                if (loadedCount === files.length) {
                    setAdditionalImagesPreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setAdditionalImagesFiles(prev => [...prev, ...files]);
    };

    const handleRemoveCoverImage = () => {
        setCoverImageFile(null);
        setCoverImagePreview(null);
        if (coverImageInputRef.current) {
            coverImageInputRef.current.value = '';
        }
    };

    const handleRemoveAdditionalImage = (index) => {
        setAdditionalImagesPreviews(prev => prev.filter((_, i) => i !== index));
        setAdditionalImagesFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            {/* Cover Image Upload */}
            <div className="grid gap-2">
                <Label htmlFor="coverImage">Ảnh bìa sách *</Label>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => coverImageInputRef.current?.click()}
                        className="whitespace-nowrap"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Tải lên ảnh bìa
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={coverImageInputRef}
                        onChange={handleCoverImageChange}
                        className="hidden"
                    />
                </div>
                {coverImagePreview && (
                    <div className="relative mt-2 w-fit">
                        <img
                            src={coverImagePreview}
                            alt="Cover Preview"
                            className="h-40 w-auto object-cover rounded-md border"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemoveCoverImage}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Additional Images Upload */}
            <div className="grid gap-2">
                <Label htmlFor="additionalImages">
                    Ảnh bổ sung (Tối đa {maxAdditionalImages} ảnh)
                </Label>
                <div className="flex flex-wrap gap-3">
                    {additionalImagesPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                            <img
                                src={preview}
                                alt={`Additional Preview ${index + 1}`}
                                className="h-24 w-24 object-cover rounded-md border"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveAdditionalImage(index)}
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {additionalImagesPreviews.length < maxAdditionalImages && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => additionalImagesInputRef.current?.click()}
                            className="h-24 w-24 flex flex-col items-center justify-center gap-1"
                        >
                            <Upload className="h-5 w-5" />
                            <span className="text-xs">Thêm ảnh</span>
                        </Button>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={additionalImagesInputRef}
                        onChange={handleAdditionalImagesChange}
                        className="hidden"
                    />
                </div>
            </div>
        </>
    );
});

BookImageUpload.displayName = "BookImageUpload";

export default BookImageUpload;
