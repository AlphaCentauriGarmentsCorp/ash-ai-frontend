# Quotation Client - Standalone Public Form

## Overview
The Quotation Client is a standalone, public-facing wizard-style form that allows clients to request custom t-shirt printing quotations without accessing the internal admin system.

## Access
- **URL**: `http://localhost:5174/quotation-client`
- **Type**: Public route (no authentication required)
- **Purpose**: Client-facing quotation request form

## Features

### 4-Step Wizard Process

#### Step 1: Front & Back
- Select design locations (front, back, or both)
- Upload design files for each location (optional)
- Add design notes and specifications
- Supported file formats: JPG, PNG, PDF, AI, PSD

#### Step 2: Designs
- Choose design method:
  - Upload own design files
  - Select from pre-made templates
  - Request custom design creation
- Multiple file uploads supported
- Design notes and specifications

#### Step 3: Colors
- Select t-shirt base color with visual color picker
- Choose number of print colors (1-5+)
- Select specific print colors
- Add Pantone codes or color matching notes

#### Step 4: Overview & Submit
- Review all selections
- Provide contact information:
  - Full name (required)
  - Email address (required)
  - Phone number (required)
  - Company name (optional)
- Set urgency level:
  - Normal (2-3 weeks)
  - Urgent (1 week)
  - Rush (3-5 days)
- Preferred delivery date
- Additional notes

## Technical Implementation

### File Structure
```
src/
├── pages/Quotation/
│   └── QuotationClient.jsx          # Main wizard page
├── components/quotationClient/
│   ├── WizardProgress.jsx           # Progress indicator
│   ├── Step1FrontBack.jsx           # Step 1 component
│   ├── Step2Designs.jsx             # Step 2 component
│   ├── Step3Colors.jsx              # Step 3 component
│   └── Step4Overview.jsx            # Step 4 component
└── constants/formInitialState/
    └── quotationClientInitialState.js  # Form initial state
```

### Reused Components
The implementation follows the existing project patterns and reuses:
- `Input` component from `src/components/form/Input.jsx`
- `Select` component from `src/components/form/Select.jsx`
- Form validation patterns
- Styling conventions (Tailwind CSS)

### State Management
- Form state managed with React `useState`
- Initial state defined in `quotationClientInitialState.js`
- Step-by-step validation
- Error handling per field

### Routing
Added to `App.jsx` as a public route:
```jsx
<Route path="/quotation-client" element={<QuotationClient />} />
```

## Validation Rules

### Step 1
- At least one design location must be selected (front or back)

### Step 2
- Design method must be selected
- If "upload" selected: at least one file required
- If "template" selected: template must be chosen

### Step 3
- T-shirt color is required
- Number of print colors is required

### Step 4
- Client name is required
- Valid email address is required
- Phone number is required
- Urgency level is required

## User Experience

### Navigation
- Previous/Next buttons for step navigation
- Progress indicator shows current step and completion
- Smooth scrolling to top on step change
- Step validation before proceeding

### Visual Design
- Clean, modern interface
- Gradient background (blue to purple)
- Card-based layout
- Icon-based visual cues
- Color pickers for intuitive selection
- Responsive design (mobile-friendly)

### Feedback
- Real-time validation errors
- Success message on submission
- Loading state during submission
- Help section with contact information

## Future Enhancements

### Potential Additions
1. **File Preview**: Show thumbnails of uploaded designs
2. **Price Estimation**: Real-time price calculation based on selections
3. **Save Draft**: Allow users to save and return later
4. **Email Confirmation**: Send confirmation email after submission
5. **Status Tracking**: Allow clients to track quotation status
6. **Integration**: Connect to backend API for data persistence
7. **Payment Integration**: Add payment processing for deposits
8. **Template Gallery**: Expand template options with previews
9. **Quantity Selection**: Add quantity fields for bulk orders
10. **Size Selection**: Add t-shirt size options

## API Integration (To Be Implemented)

### Expected Endpoint
```javascript
POST /api/quotations/client
Content-Type: multipart/form-data

{
  hasFrontDesign: boolean,
  hasBackDesign: boolean,
  frontDesignFile: File,
  backDesignFile: File,
  designType: string,
  uploadedDesigns: File[],
  tshirtColor: string,
  printColors: string[],
  colorCount: number,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  clientCompany: string,
  urgency: string,
  preferredDeliveryDate: string,
  additionalNotes: string
}
```

### Response
```javascript
{
  success: boolean,
  quotationId: string,
  message: string,
  estimatedResponse: string
}
```

## Testing Checklist

- [ ] All steps navigate correctly
- [ ] Validation works on each step
- [ ] File uploads work properly
- [ ] Form submission completes
- [ ] Error messages display correctly
- [ ] Responsive design on mobile
- [ ] Color pickers function properly
- [ ] Multi-select works for print colors
- [ ] Previous button maintains form data
- [ ] Form resets after successful submission

## Maintenance Notes

### Adding New Steps
1. Create new step component in `src/components/quotationClient/`
2. Add step to `steps` array in `QuotationClient.jsx`
3. Add validation logic in `validateStep()` function
4. Update progress indicator

### Modifying Form Fields
1. Update `quotationClientInitialState.js`
2. Add field to appropriate step component
3. Add validation rules if required
4. Update submission handler

### Styling Changes
- All styles use Tailwind CSS
- Primary color: `primary` (defined in theme)
- Follow existing component patterns
- Maintain responsive design principles
