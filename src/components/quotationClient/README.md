# Quotation Client Components

This folder contains all components related to the public-facing Quotation Client wizard.

## Components

### WizardProgress.jsx
Progress indicator showing current step and completion status.

**Props:**
- `currentStep` (number): Current active step (1-4)
- `steps` (array): Array of step objects with title and description

### Step1FrontBack.jsx
First step: Select design locations (front/back).

**Props:**
- `formData` (object): Current form state
- `onChange` (function): Handler for form changes
- `errors` (object): Validation errors

**Features:**
- Checkbox-style selection for front/back
- File upload for each location
- Design notes input

### Step2Designs.jsx
Second step: Choose design method and upload files.

**Props:**
- `formData` (object): Current form state
- `onChange` (function): Handler for form changes
- `errors` (object): Validation errors

**Features:**
- Design method selection (upload/template/describe)
- Multiple file uploads
- Template gallery
- Design notes

### Step3Colors.jsx
Third step: Select t-shirt and print colors.

**Props:**
- `formData` (object): Current form state
- `onChange` (function): Handler for form changes
- `errors` (object): Validation errors

**Features:**
- T-shirt color picker with visual swatches
- Print color count selection
- Multi-select for print colors
- Color notes input

### Step4Overview.jsx
Fourth step: Review and submit with contact info.

**Props:**
- `formData` (object): Current form state
- `onChange` (function): Handler for form changes
- `errors` (object): Validation errors

**Features:**
- Summary of all selections
- Contact information form
- Urgency level selection
- Additional notes

## Usage Example

```jsx
import WizardProgress from './components/quotationClient/WizardProgress';
import Step1FrontBack from './components/quotationClient/Step1FrontBack';

const MyWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const steps = [
    { title: "Front & Back", description: "Choose locations" },
    // ... more steps
  ];

  return (
    <div>
      <WizardProgress currentStep={currentStep} steps={steps} />
      <Step1FrontBack 
        formData={formData} 
        onChange={handleChange} 
        errors={errors} 
      />
    </div>
  );
};
```

## Styling

All components use Tailwind CSS classes following the project's design system:
- Primary color: `bg-primary`, `text-primary`, `border-primary`
- Success: `bg-green-500`, `text-green-600`
- Error: `bg-red-50`, `text-red-500`
- Gray scale: `bg-gray-100`, `text-gray-600`, etc.

## Validation

Each step component expects validation errors in this format:
```javascript
{
  fieldName: "Error message",
  anotherField: "Another error message"
}
```

## File Handling

File inputs use the native HTML file input with custom styling:
```jsx
<input
  type="file"
  accept="image/*,.pdf,.ai,.psd"
  onChange={(e) => handleFileChange(e.target.files[0])}
  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg..."
/>
```

## Accessibility

- All form inputs have proper labels
- Required fields are marked with asterisks
- Error messages are associated with inputs
- Keyboard navigation supported
- ARIA labels where appropriate
