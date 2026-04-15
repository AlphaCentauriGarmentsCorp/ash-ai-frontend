# Quotation Client - Quick Start Guide

## What is it?
A standalone, public-facing wizard form that allows clients to request t-shirt printing quotations without accessing your internal admin system.

## How to Access
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5174/quotation-client
   ```

3. The form is publicly accessible (no login required)

## How to Use

### For Clients
1. **Step 1 - Front & Back**: Choose where you want designs (front, back, or both)
2. **Step 2 - Designs**: Upload your design files or select from templates
3. **Step 3 - Colors**: Pick your t-shirt color and print colors
4. **Step 4 - Overview**: Review everything and provide your contact info
5. Click "Submit Quotation" to send your request

### For Developers

#### Project Structure
```
src/
├── pages/Quotation/
│   └── QuotationClient.jsx              # Main page
├── components/quotationClient/          # All wizard components
│   ├── WizardProgress.jsx
│   ├── Step1FrontBack.jsx
│   ├── Step2Designs.jsx
│   ├── Step3Colors.jsx
│   └── Step4Overview.jsx
└── constants/formInitialState/
    └── quotationClientInitialState.js   # Form default values
```

#### Key Features
✅ 4-step wizard interface
✅ File upload support (images, PDF, AI, PSD)
✅ Visual color pickers
✅ Form validation
✅ Responsive design
✅ No authentication required
✅ Reuses existing project components

#### Customization

**Change Colors:**
Edit the color options in step components:
- `Step3Colors.jsx` - T-shirt and print colors

**Add/Remove Steps:**
1. Create new step component in `src/components/quotationClient/`
2. Add to `steps` array in `QuotationClient.jsx`
3. Add validation in `validateStep()` function

**Modify Form Fields:**
1. Update `quotationClientInitialState.js`
2. Add field to appropriate step component
3. Add validation if needed

**Connect to Backend:**
Update the `handleSubmit` function in `QuotationClient.jsx`:
```javascript
const handleSubmit = async () => {
  // Replace this with your API call
  const response = await fetch('/api/quotations/client', {
    method: 'POST',
    body: formData
  });
  // Handle response
};
```

## Testing

### Manual Testing Checklist
- [ ] Navigate through all 4 steps
- [ ] Upload files in Step 1 and Step 2
- [ ] Select colors in Step 3
- [ ] Fill contact form in Step 4
- [ ] Submit the form
- [ ] Check validation errors
- [ ] Test on mobile device
- [ ] Test Previous/Next buttons

### Test Data
Use these values for quick testing:

**Step 1:**
- Check "Front Design"
- Upload any image file

**Step 2:**
- Select "Upload My Own Design"
- Upload 1-2 files

**Step 3:**
- T-shirt Color: White
- Color Count: 2 Colors
- Print Colors: Black, Red

**Step 4:**
- Name: John Doe
- Email: john@example.com
- Phone: 555-0123
- Urgency: Normal

## Common Issues

### Issue: Route not found
**Solution:** Make sure the route is added in `App.jsx`:
```jsx
<Route path="/quotation-client" element={<QuotationClient />} />
```

### Issue: Components not found
**Solution:** Check that all files are in the correct folders:
- Components in `src/components/quotationClient/`
- Initial state in `src/constants/formInitialState/`

### Issue: Styling looks wrong
**Solution:** Ensure Tailwind CSS is properly configured and the project is rebuilt

## Next Steps

1. **Backend Integration**: Connect to your API endpoint
2. **Email Notifications**: Send confirmation emails
3. **Admin Dashboard**: Create admin view to manage quotation requests
4. **File Storage**: Implement file upload to cloud storage
5. **Price Calculator**: Add real-time price estimation

## Support

For questions or issues:
- Check `QUOTATION_CLIENT_DOCUMENTATION.md` for detailed info
- Review component README in `src/components/quotationClient/README.md`
- Check existing form components for patterns

## Production Deployment

Before deploying:
1. Update contact information (phone, email)
2. Configure file upload limits
3. Set up backend API endpoint
4. Test on multiple devices
5. Enable HTTPS
6. Set up email notifications
7. Configure CORS if needed

## File Upload Limits

Current accepted formats:
- Images: JPG, PNG
- Design files: PDF, AI, PSD

To modify, update the `accept` attribute in file inputs:
```jsx
<input type="file" accept="image/*,.pdf,.ai,.psd" />
```
