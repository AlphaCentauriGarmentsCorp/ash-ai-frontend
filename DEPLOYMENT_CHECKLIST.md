# Quotation Client - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Review
- [ ] All components created and in correct folders
- [ ] Initial state defined in constants
- [ ] Route added to App.jsx
- [ ] No console errors in development
- [ ] Build completes successfully
- [ ] All imports resolved correctly

### ✅ Testing
- [ ] Navigate through all 4 steps
- [ ] Test Previous/Next buttons
- [ ] Upload files in Step 1
- [ ] Upload multiple files in Step 2
- [ ] Select colors in Step 3
- [ ] Fill and submit form in Step 4
- [ ] Verify validation on each step
- [ ] Test with invalid data
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test form reset after submission

### ✅ Configuration
- [ ] Update contact phone number
- [ ] Update contact email address
- [ ] Configure file upload size limits
- [ ] Set up backend API endpoint
- [ ] Configure CORS settings
- [ ] Set up file storage (S3, Cloudinary, etc.)
- [ ] Configure email service
- [ ] Set up error logging

### ✅ Content
- [ ] Review all text for typos
- [ ] Update company name
- [ ] Update help text
- [ ] Review color options
- [ ] Review template options
- [ ] Update urgency timeframes
- [ ] Review success message

### ✅ Security
- [ ] Validate file types on backend
- [ ] Set file size limits
- [ ] Sanitize user inputs
- [ ] Implement rate limiting
- [ ] Add CAPTCHA if needed
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Review CORS policy

### ✅ Performance
- [ ] Optimize images
- [ ] Enable compression
- [ ] Set up CDN if needed
- [ ] Test load times
- [ ] Check bundle size
- [ ] Implement lazy loading if needed

### ✅ SEO & Analytics
- [ ] Add meta tags
- [ ] Set up Google Analytics
- [ ] Add conversion tracking
- [ ] Create sitemap entry
- [ ] Test social media sharing

### ✅ Documentation
- [ ] Update README with new route
- [ ] Document API endpoints
- [ ] Create admin guide
- [ ] Update user documentation
- [ ] Document environment variables

## Deployment Steps

### 1. Environment Setup
```bash
# Set environment variables
VITE_API_URL=https://api.yoursite.com
VITE_FILE_UPLOAD_MAX_SIZE=10485760
VITE_CONTACT_EMAIL=quotes@yoursite.com
VITE_CONTACT_PHONE=1-800-TSHIRT
```

### 2. Build for Production
```bash
# Install dependencies
npm install

# Run tests (if available)
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Backend Setup
```bash
# Create API endpoint
POST /api/quotations/client

# Set up file storage
# Configure email service
# Set up database tables
```

### 4. Deploy
```bash
# Deploy to hosting service
# Update DNS if needed
# Configure SSL certificate
# Set up monitoring
```

### 5. Post-Deployment
```bash
# Test production URL
# Monitor error logs
# Check analytics
# Test email notifications
```

## Backend Integration Checklist

### API Endpoint
- [ ] Create POST endpoint: `/api/quotations/client`
- [ ] Accept multipart/form-data
- [ ] Validate all required fields
- [ ] Sanitize inputs
- [ ] Store files securely
- [ ] Save to database
- [ ] Send confirmation email
- [ ] Return success response

### Database Schema
```sql
CREATE TABLE quotation_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_company VARCHAR(255),
  has_front_design BOOLEAN,
  has_back_design BOOLEAN,
  design_type VARCHAR(50),
  tshirt_color VARCHAR(50),
  print_colors JSON,
  color_count INT,
  urgency VARCHAR(50),
  preferred_delivery_date DATE,
  additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE quotation_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quotation_id INT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  file_size INT,
  upload_type VARCHAR(50), -- 'front', 'back', 'design'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotation_requests(id)
);
```

### Email Templates
- [ ] Client confirmation email
- [ ] Admin notification email
- [ ] Include quotation details
- [ ] Add tracking number
- [ ] Include contact information

## Monitoring Checklist

### Metrics to Track
- [ ] Form submission rate
- [ ] Step completion rate
- [ ] Drop-off points
- [ ] Average time per step
- [ ] File upload success rate
- [ ] Error rate
- [ ] Response time

### Alerts to Set Up
- [ ] Failed submissions
- [ ] High error rate
- [ ] Slow response time
- [ ] File upload failures
- [ ] Email delivery failures

## Maintenance Checklist

### Daily
- [ ] Check error logs
- [ ] Monitor submission rate
- [ ] Review new quotations

### Weekly
- [ ] Review analytics
- [ ] Check performance metrics
- [ ] Update content if needed

### Monthly
- [ ] Review and optimize
- [ ] Update templates
- [ ] Check for updates
- [ ] Review security

## Rollback Plan

### If Issues Occur
1. Identify the issue
2. Check error logs
3. Revert to previous version if needed
4. Fix the issue
5. Test thoroughly
6. Redeploy

### Rollback Commands
```bash
# Revert to previous commit
git revert HEAD

# Rebuild
npm run build

# Redeploy
# (depends on your hosting service)
```

## Support Checklist

### Documentation
- [ ] Create FAQ page
- [ ] Document common issues
- [ ] Create troubleshooting guide
- [ ] Update help section

### Support Channels
- [ ] Set up support email
- [ ] Create support ticket system
- [ ] Train support team
- [ ] Create response templates

## Success Criteria

### Launch Criteria
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Team trained

### Post-Launch Metrics
- [ ] 95%+ uptime
- [ ] <2s page load time
- [ ] <5% error rate
- [ ] 80%+ completion rate
- [ ] Positive user feedback

## Emergency Contacts

```
Developer: ___________________
DevOps: ______________________
Support: _____________________
Manager: _____________________
```

## Notes

```
Deployment Date: _______________
Deployed By: ___________________
Version: _______________________
Issues: ________________________
_______________________________
_______________________________
```

---

**Remember**: Test thoroughly before deploying to production!
