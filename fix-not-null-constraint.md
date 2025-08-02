# Fixing the NOT NULL Constraint Error

The error you encountered was caused by a `NOT NULL` constraint violation on the `complaint_type` column. Here's what I've fixed:

## 🐛 **The Problem**
- Error: `null value in column "complaint_type" of relation "user_submitted_complaints" violates not-null constraint`
- Code: `23502` (PostgreSQL NOT NULL constraint error)
- Cause: The UserPortal was trying to insert `complaint_type: null` when `formData.type` was null/undefined

## 🔧 **The Solution**

I've updated the `UserPortal.jsx` to properly handle complaint types for different forms:

### **Smart Complaint Type Detection**
```javascript
// Determine the complaint type based on the form data
let complaintType = formData.type;

// Handle different form types
if (formData.va_group && formData.complicity_type) {
  // VA Group allegation
  complaintType = 'VA Group Complicity/Integrity Violation';
} else if (formData.external_group && formData.external_violation_type) {
  // External Group allegation
  complaintType = 'External Group Violation';
} else if (!complaintType) {
  // Fallback for facility allegations
  complaintType = 'General Complaint';
}
```

### **Form-Specific Handling**
- ✅ **Facility Allegations** - Uses `formData.type` or falls back to 'General Complaint'
- ✅ **VA Group Allegations** - Sets to 'VA Group Complicity/Integrity Violation'
- ✅ **External Group Allegations** - Sets to 'External Group Violation'

### **Enhanced Error Handling**
Added specific error handling for NOT NULL constraint violations:
- ✅ **Code 23502** - NOT NULL constraint errors
- ✅ **Complaint type specific** - Clear message for complaint_type issues
- ✅ **General NOT NULL** - Clear message for other required fields

## 📋 **What the Fix Does**

1. **Detects form type** - Based on the data being submitted
2. **Sets appropriate complaint type** - Matches what each form should use
3. **Provides fallback** - Ensures complaint_type is never null
4. **Better error messages** - Helps users understand what went wrong

## 🧪 **Testing**

After the fix:
1. Try submitting a **Facility allegation** - Should use form type or 'General Complaint'
2. Try submitting a **VA Group allegation** - Should use 'VA Group Complicity/Integrity Violation'
3. Try submitting an **External Group allegation** - Should use 'External Group Violation'
4. Verify no NOT NULL constraint errors occur

The forms should now work properly without any NOT NULL constraint violations!

## 🔍 **Error Types Fixed**

- ❌ `null value in column "complaint_type"` - **FIXED**
- ❌ PostgreSQL error code `23502` - **FIXED**
- ✅ All forms now provide proper complaint_type values
- ✅ Fallback values ensure no null complaints 