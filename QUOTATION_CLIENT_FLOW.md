# Quotation Client - User Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT VISITS URL                         │
│              http://localhost:5174/quotation-client          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   LANDING PAGE                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Request a Quotation                                  │  │
│  │  Get a custom quote for your t-shirt printing needs  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Progress: ●━━━○━━━○━━━○                                    │
│           Step 1  2   3   4                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  STEP 1: FRONT & BACK                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ☐ Front Design                                       │  │
│  │     └─ Upload file (optional)                         │  │
│  │     └─ Design notes                                   │  │
│  │                                                        │  │
│  │  ☐ Back Design                                        │  │
│  │     └─ Upload file (optional)                         │  │
│  │     └─ Design notes                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Validation: At least one location must be selected         │
│                                                              │
│  [Previous]                                [Next ➜]          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   STEP 2: DESIGNS                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Design Method:                                       │  │
│  │  ○ Upload My Own Design                               │  │
│  │  ○ Choose from Templates                              │  │
│  │  ○ Describe Design (We'll Create It)                  │  │
│  │                                                        │  │
│  │  [If Upload Selected]                                 │  │
│  │  ┌─────────────────────────────────────┐              │  │
│  │  │  📁 Drag & Drop or Click to Upload  │              │  │
│  │  │  Supported: JPG, PNG, PDF, AI, PSD  │              │  │
│  │  └─────────────────────────────────────┘              │  │
│  │                                                        │  │
│  │  [If Template Selected]                               │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐                              │  │
│  │  │ 1 │ │ 2 │ │ 3 │ │ 4 │  Template Gallery            │  │
│  │  └───┘ └───┘ └───┘ └───┘                              │  │
│  │                                                        │  │
│  │  Design Notes: ___________________________________     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Validation: Design method + files/template required        │
│                                                              │
│  [◀ Previous]                              [Next ➜]          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   STEP 3: COLORS                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  T-Shirt Base Color:                                  │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                        │  │
│  │  │ W │ │ B │ │ N │ │ R │ │ G │  Color Swatches       │  │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘                        │  │
│  │                                                        │  │
│  │  Number of Print Colors:                              │  │
│  │  ○ 1 Color  ○ 2 Colors  ○ 3 Colors  ○ 4 Colors        │  │
│  │                                                        │  │
│  │  Select Print Colors:                                 │  │
│  │  ☐ White   ☐ Black   ☐ Red    ☐ Blue                 │  │
│  │  ☐ Yellow  ☐ Green   ☐ Orange ☐ Purple               │  │
│  │                                                        │  │
│  │  Color Notes: _____________________________________    │  │
│  │  (Pantone codes, special requirements)                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Validation: T-shirt color + color count required           │
│                                                              │
│  [◀ Previous]                              [Next ➜]          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: OVERVIEW & SUBMIT                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📋 QUOTATION SUMMARY                                 │  │
│  │  ├─ Design Locations: Front & Back                    │  │
│  │  ├─ Design Method: Upload Own Design                  │  │
│  │  ├─ T-Shirt Color: White                              │  │
│  │  └─ Print Colors: Black, Red (2 colors)               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  👤 YOUR INFORMATION                                  │  │
│  │  Full Name: *     ___________________________          │  │
│  │  Email: *         ___________________________          │  │
│  │  Phone: *         ___________________________          │  │
│  │  Company:         ___________________________          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ⚙️ ADDITIONAL DETAILS                                │  │
│  │  Urgency: ○ Normal  ○ Urgent  ○ Rush                  │  │
│  │  Delivery Date: [Calendar Picker]                     │  │
│  │  Notes: _________________________________________      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Validation: Name, email, phone, urgency required           │
│                                                              │
│  [◀ Previous]                    [✉️ Submit Quotation]      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUBMISSION                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ⏳ Submitting your quotation request...              │  │
│  │  [Loading Spinner]                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUCCESS                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ✅ Thank You!                                        │  │
│  │                                                        │  │
│  │  Your quotation request has been submitted            │  │
│  │  successfully. We'll contact you within 24 hours.     │  │
│  │                                                        │  │
│  │  Confirmation sent to: your@email.com                 │  │
│  │                                                        │  │
│  │  [Submit Another Request]                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
QuotationClient (Main Page)
│
├── Header
│   ├── Title & Description
│   └── Help Contact Info
│
├── WizardProgress
│   └── Step Indicators (1-4)
│
├── Step Content (Dynamic)
│   ├── Step1FrontBack
│   │   ├── Front Design Checkbox
│   │   │   ├── File Upload
│   │   │   └── Notes Input
│   │   └── Back Design Checkbox
│   │       ├── File Upload
│   │       └── Notes Input
│   │
│   ├── Step2Designs
│   │   ├── Design Method Select
│   │   ├── File Upload Area
│   │   ├── Template Gallery
│   │   └── Design Notes Input
│   │
│   ├── Step3Colors
│   │   ├── T-Shirt Color Picker
│   │   ├── Color Count Select
│   │   ├── Print Colors Multi-Select
│   │   └── Color Notes Input
│   │
│   └── Step4Overview
│       ├── Summary Section
│       ├── Contact Form
│       │   ├── Name Input
│       │   ├── Email Input
│       │   ├── Phone Input
│       │   └── Company Input
│       └── Additional Details
│           ├── Urgency Select
│           ├── Date Picker
│           └── Notes Textarea
│
├── Navigation Buttons
│   ├── Previous Button
│   └── Next/Submit Button
│
└── Footer
    └── Help Information
```

## Data Flow

```
User Input
    │
    ▼
onChange Handler
    │
    ▼
Update formData State
    │
    ▼
Clear Field Error
    │
    ▼
Re-render Component
    │
    ▼
[User Clicks Next]
    │
    ▼
validateStep()
    │
    ├─ Valid ──────────────┐
    │                      ▼
    │              Move to Next Step
    │              Scroll to Top
    │
    └─ Invalid ────────────┐
                           ▼
                   Show Error Messages
                   Keep on Current Step
```

## Validation Flow

```
Step 1 Validation
├─ hasFrontDesign OR hasBackDesign?
│  ├─ Yes ──→ ✅ Valid
│  └─ No ───→ ❌ "Select at least one location"

Step 2 Validation
├─ designType selected?
│  ├─ No ───→ ❌ "Select design method"
│  └─ Yes ──┐
│           ├─ If "upload": files uploaded?
│           │  ├─ Yes ──→ ✅ Valid
│           │  └─ No ───→ ❌ "Upload files"
│           │
│           └─ If "template": template selected?
│              ├─ Yes ──→ ✅ Valid
│              └─ No ───→ ❌ "Select template"

Step 3 Validation
├─ tshirtColor selected?
│  ├─ No ───→ ❌ "Select t-shirt color"
│  └─ Yes ──┐
│           └─ colorCount selected?
│              ├─ Yes ──→ ✅ Valid
│              └─ No ───→ ❌ "Select color count"

Step 4 Validation
├─ clientName filled?
│  ├─ No ───→ ❌ "Name required"
│  └─ Yes ──┐
│           ├─ clientEmail valid?
│           │  ├─ No ───→ ❌ "Valid email required"
│           │  └─ Yes ──┐
│           │           ├─ clientPhone filled?
│           │           │  ├─ No ───→ ❌ "Phone required"
│           │           │  └─ Yes ──┐
│           │           │           └─ urgency selected?
│           │           │              ├─ Yes ──→ ✅ Valid
│           │           │              └─ No ───→ ❌ "Select urgency"
```

## State Structure

```javascript
formData = {
  // Step 1
  hasFrontDesign: false,
  hasBackDesign: false,
  frontDesignFile: null,
  backDesignFile: null,
  frontDesignNotes: "",
  backDesignNotes: "",
  
  // Step 2
  designType: "",
  uploadedDesigns: [],
  selectedTemplate: null,
  designNotes: "",
  
  // Step 3
  tshirtColor: "",
  printColors: [],
  colorCount: 1,
  colorNotes: "",
  
  // Step 4
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientCompany: "",
  urgency: "normal",
  preferredDeliveryDate: "",
  additionalNotes: ""
}
```

## Navigation Rules

```
Current Step = 1
├─ Previous Button: DISABLED
└─ Next Button: ENABLED (validates Step 1)

Current Step = 2, 3
├─ Previous Button: ENABLED (go back)
└─ Next Button: ENABLED (validates current step)

Current Step = 4
├─ Previous Button: ENABLED (go back)
└─ Submit Button: ENABLED (validates Step 4 + submits)
```

## Error Handling

```
Validation Error
    │
    ▼
Set errors State
    │
    ▼
Display Error Messages
    │
    ├─ Field-level errors (red border + message)
    └─ General errors (alert banner at top)
    │
    ▼
User Fixes Input
    │
    ▼
Clear Error for That Field
    │
    ▼
Re-validate on Next Click
```

## File Upload Flow

```
User Selects File(s)
    │
    ▼
onChange Event Triggered
    │
    ▼
File Object(s) Captured
    │
    ▼
Update formData State
    │
    ▼
Display File Name(s)
    │
    ▼
Show Remove Button
    │
    ▼
[User Clicks Remove]
    │
    ▼
Filter Out File
    │
    ▼
Update formData State
```

## Responsive Behavior

```
Desktop (≥768px)
├─ Full width form (max 1024px)
├─ Side-by-side layouts
├─ Color swatches in grid
└─ All step descriptions visible

Tablet (≥640px, <768px)
├─ Adjusted padding
├─ Stacked layouts
├─ Smaller color swatches
└─ Step descriptions visible

Mobile (<640px)
├─ Full width
├─ Vertical stacking
├─ Compact color swatches
└─ Step descriptions hidden
```
