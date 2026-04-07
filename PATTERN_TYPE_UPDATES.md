# Pattern Type Module - Multiple Image Upload Feature

## Overview
Enhanced the Pattern Type dropdown settings module to support multiple pattern image uploads following the project's established code patterns and architecture.

## Files Modified

### 1. Initial State Configuration
**File:** `src/constants/formInitialState/typesInitialState.js`

```javascript
export const typesInitialState = {
  name: "",
  description: "",
  pattern_images: [], // Added for multiple image support
};
```

**Changes:**
- Added `pattern_images` array field to store multiple image files

---

### 2. Validation Schema
**File:** `src/validations/typesSchema.js`

```javascript
export const typesSchema = {
  name: {
    required: true,
    message: "Name is required.",
  },
  description: {
    required: true,
    message: "Description is required.",
  },
  pattern_images: {
    required: true,
    message: "At least one pattern image is required.",
    custom: (value) => {
      if (!value || value.length === 0) {
        return "At least one pattern image is required.";
      }
      return null;
    },
  },
};
```

**Changes:**
- Added validation rules for `pattern_images` field
- Implemented custom validation to ensure at least one image is uploaded
- Uses the project's standard validation pattern with `custom` validator

---

### 3. API Layer
**File:** `src/api/patternTypeApi.js`

**Key Changes:**
- Updated `update` method to detect and handle FormData payloads
- Automatically sets `Content-Type: multipart/form-data` header when FormData is detected
- Maintains backward compatibility with regular JSON payloads

```javascript
update: async (id, payload) => {
  try {
    const headers = payload instanceof FormData 
      ? { "Content-Type": "multipart/form-data" }
      : {};
    const response = await api.put(`/pattern-type/${id}`, payload, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

---

### 4. Add Pattern Type Page
**File:** `src/pages/DropDownSettings/PatternType/AddPatternType.jsx`

**Key Changes:**
1. **Import:** Added `FileUpload` component
   ```javascript
   import FileUpload from "../../../components/form/FileUpload";
   ```

2. **Form Field:** Added FileUpload component to the form
   ```javascript
   <FileUpload
     label="Pattern Images"
     name="pattern_images"
     value={formData.pattern_images}
     onChange={handleChange}
     acceptedTypes="image/*"
     multiple={true}
     error={errors.pattern_images}
     required
   />
   ```

3. **Form Submission:** Updated to use FormData for multipart upload
   ```javascript
   const formDataToSend = new FormData();
   formDataToSend.append("name", formData.name);
   formDataToSend.append("description", formData.description);
   
   formData.pattern_images.forEach((file, index) => {
     formDataToSend.append(`pattern_images[${index}]`, file);
   });

   await patternTypeService.create(formDataToSend);
   ```

**Features:**
- Multiple image selection
- File type validation (images only)
- File size validation (25MB max per file)
- Individual file removal before submission
- Real-time preview of uploaded files
- Error handling and display

---

### 5. Edit Pattern Type Page
**File:** `src/pages/DropDownSettings/PatternType/EditPatternType.jsx`

**Key Changes:**
1. **Import:** Added `FileUpload` component
   ```javascript
   import FileUpload from "../../../components/form/FileUpload";
   ```

2. **State Management:** Added state for existing images
   ```javascript
   const [existingImages, setExistingImages] = useState([]);
   ```

3. **Data Fetching:** Updated to handle existing images
   ```javascript
   const fetchPatternType = async () => {
     try {
       const response = await patternTypeApi.show(id);
       const data = response.data;
       setFormData({
         name: data.name || "",
         description: data.description || "",
         pattern_images: [],
       });
       setExistingImages(data.pattern_images || []);
     } catch (error) {
       setServerError("Failed to load pattern type.");
     } finally {
       setIsLoading(false);
     }
   };
   ```

4. **Existing Images Display:** Shows current pattern images in a grid
   ```javascript
   {existingImages.length > 0 && (
     <div className="px-6 mb-4">
       <label className="text-primary text-sm font-semibold flex items-center mb-2">
         Existing Pattern Images
       </label>
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {existingImages.map((image, index) => (
           <div key={index} className="relative border border-gray-300 rounded p-2">
             <img
               src={image.url || image}
               alt={`Pattern ${index + 1}`}
               className="w-full h-32 object-cover rounded"
             />
           </div>
         ))}
       </div>
     </div>
   )}
   ```

5. **New Images Upload:** FileUpload component for adding new images
   ```javascript
   <FileUpload
     label="Add New Pattern Images"
     name="pattern_images"
     value={formData.pattern_images}
     onChange={handleChange}
     acceptedTypes="image/*"
     multiple={true}
     error={errors.pattern_images}
     required={existingImages.length === 0}
   />
   ```

6. **Conditional Validation:** New images required only if no existing images
   ```javascript
   const validationSchema = {
     ...typesSchema,
     pattern_images: {
       ...typesSchema.pattern_images,
       required: existingImages.length === 0,
       custom: (value) => {
         if (existingImages.length === 0 && (!value || value.length === 0)) {
           return "At least one pattern image is required.";
         }
         return null;
       },
     },
   };
   ```

7. **Form Submission:** Updated to handle FormData with new images
   ```javascript
   const formDataToSend = new FormData();
   formDataToSend.append("name", formData.name);
   formDataToSend.append("description", formData.description);
   
   if (formData.pattern_images.length > 0) {
     formData.pattern_images.forEach((file, index) => {
       formDataToSend.append(`pattern_images[${index}]`, file);
     });
   }

   await patternTypeApi.update(id, formDataToSend);
   ```

---

## Implementation Details

### Code Patterns Followed
1. **Component Structure:** Follows AdminLayout wrapper pattern used throughout the project
2. **State Management:** Uses React hooks (useState, useEffect) consistently
3. **Form Handling:** Implements standard handleChange and handleSubmit patterns
4. **Validation:** Uses project's validateForm utility with custom validators
5. **Error Handling:** Follows try-catch pattern with error state management
6. **Success Feedback:** Uses AlertMessage component for user feedback
7. **Navigation:** Uses react-router-dom's useNavigate for redirects
8. **Loading States:** Implements loading and submitting states for better UX

### FileUpload Component Integration
- Reuses existing `FileUpload` component from `src/components/form/FileUpload.jsx`
- Configured for image-only uploads (`acceptedTypes="image/*"`)
- Enabled multiple file selection (`multiple={true}`)
- Integrated with form validation system
- Follows same styling and error display patterns as other form components

### API Communication
- Uses FormData for multipart/form-data uploads
- Images sent as array: `pattern_images[0]`, `pattern_images[1]`, etc.
- Maintains existing API endpoint structure
- Backward compatible with existing API responses

---

## Features Implemented

✅ **Multiple Image Upload**
- Users can select and upload multiple pattern images at once
- Drag-and-drop support (inherited from FileUpload component)

✅ **File Validation**
- Type validation: Only image files accepted
- Size validation: Maximum 25MB per file
- Quantity validation: At least one image required

✅ **Image Preview**
- Shows uploaded files with file name and size
- Individual file removal before submission
- Icon indicators for different file types

✅ **Existing Images Display (Edit Mode)**
- Grid layout showing current pattern images
- Responsive design (2-4 columns based on screen size)
- Maintains existing images when adding new ones

✅ **Conditional Validation**
- New images required only when no existing images present
- Flexible update workflow for users

✅ **Error Handling**
- Field-level validation errors
- Server error display
- User-friendly error messages

✅ **Success Feedback**
- Success alert on successful creation/update
- Auto-redirect after successful submission
- Smooth scroll to top for alerts

---

## Usage Guide

### Adding a New Pattern Type
1. Navigate to `/admin/settings/pattern-type/new`
2. Fill in required fields:
   - Pattern Type Title (required)
   - Description (required)
   - Pattern Images (required, multiple)
3. Click "Choose Files" or drag-and-drop images
4. Review uploaded files in the preview section
5. Remove any unwanted files using the × button
6. Click "Save" to create the pattern type
7. Success message appears and redirects to pattern type list

### Editing an Existing Pattern Type
1. Navigate to `/admin/settings/pattern-type/edit/:id`
2. View existing pattern images in the grid display
3. Update Name or Description if needed
4. Optionally add new pattern images
5. Click "Update" to save changes
6. Success message appears and redirects to pattern type list

---

## Technical Notes

### FormData Structure
```javascript
FormData {
  name: "Pattern Name",
  description: "Pattern Description",
  pattern_images[0]: File,
  pattern_images[1]: File,
  pattern_images[2]: File,
  // ... more images
}
```

### Expected API Response Structure (Edit)
```javascript
{
  data: {
    id: 1,
    name: "Pattern Name",
    description: "Pattern Description",
    pattern_images: [
      { url: "https://example.com/image1.jpg" },
      { url: "https://example.com/image2.jpg" }
      // or just strings: "https://example.com/image1.jpg"
    ]
  }
}
```

### Browser Compatibility
- Modern browsers with File API support
- FormData API support
- ES6+ JavaScript features

---

## Testing Checklist

- [ ] Create new pattern type with single image
- [ ] Create new pattern type with multiple images
- [ ] Validation error when no images uploaded
- [ ] Validation error when name is empty
- [ ] Validation error when description is empty
- [ ] File size validation (>25MB)
- [ ] File type validation (non-image files)
- [ ] Remove individual files before submission
- [ ] Edit pattern type without adding new images
- [ ] Edit pattern type and add new images
- [ ] View existing images on edit page
- [ ] Success message and redirect after creation
- [ ] Success message and redirect after update
- [ ] Error handling for API failures
- [ ] Form reset functionality
- [ ] Responsive layout on mobile devices

---

## Future Enhancements (Optional)

- Image cropping/resizing before upload
- Drag-and-drop reordering of images
- Delete individual existing images
- Image preview modal/lightbox
- Bulk image upload from zip file
- Image optimization/compression
- Progress bar for large uploads
- Image metadata display (dimensions, format)

---

## Dependencies

No new dependencies added. Uses existing project dependencies:
- React 19.2.0
- react-router-dom 7.13.0
- axios 1.13.4
- Existing form components and utilities

---

## Conclusion

The Pattern Type module has been successfully enhanced with multiple image upload functionality while maintaining consistency with the project's code patterns, architecture, and user experience standards. All changes are backward compatible and follow React best practices.
