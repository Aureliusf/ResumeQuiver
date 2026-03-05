# Testing Checklist

## Manual Testing Guide

### Create New Resume
- [ ] Click "New Resume" button
- [ ] Verify new resume is created with empty/default data
- [ ] Check that toast notification appears
- [ ] Verify resume appears in "My Resumes" list

### Edit YAML
- [ ] Type valid YAML in editor
- [ ] Verify "Valid YAML" indicator shows green
- [ ] Type invalid YAML (syntax error)
- [ ] Verify "Invalid YAML" indicator shows red
- [ ] Check that error message appears
- [ ] Fix the error and verify it clears

### Toggle Bullets
- [ ] Expand Bullet Library
- [ ] Click individual bullets to toggle selection
- [ ] Click "Select All" button
- [ ] Verify all bullets in section are selected
- [ ] Click "Deselect All" button
- [ ] Verify all bullets are deselected
- [ ] Check resume preview updates correctly

### Use AI Features
**Prerequisites**: Configure AI settings

#### Rewrite Bullet
- [ ] Go to AI Copywriting tab
- [ ] Select "Rewrite" sub-tab
- [ ] Select an experience/project from dropdown
- [ ] Select a bullet to rewrite
- [ ] Click "Rewrite Bullet" button
- [ ] Verify loading spinner appears
- [ ] Wait for suggestions to appear
- [ ] Click "Use This" on a suggestion
- [ ] Verify bullet is updated in YAML
- [ ] Check success toast appears

#### Generate Bullets
- [ ] Select "Generate" sub-tab
- [ ] Enter a job description in the textarea
- [ ] Select target experience/project
- [ ] Click "Generate Bullets" button
- [ ] Verify loading spinner appears
- [ ] Wait for suggestions to appear
- [ ] Click "Add to Resume" on a suggestion
- [ ] Check success toast appears

#### Improve Summary
- [ ] Select "Summary" sub-tab
- [ ] Verify current summary is displayed
- [ ] Click "Improve Summary" button
- [ ] Verify loading spinner appears
- [ ] Wait for suggestions to appear
- [ ] Click "Use This" on a suggestion
- [ ] Verify summary is updated in YAML
- [ ] Check success toast appears

### Generate PDF
- [ ] Make edits to resume
- [ ] Click "Generate PDF" button
- [ ] Verify loading spinner appears
- [ ] Check PDF downloads automatically
- [ ] Verify success toast appears
- [ ] Open PDF and verify content matches preview

### Import/Export
#### Export
- [ ] Go to "My Resumes" tab
- [ ] Find a resume
- [ ] Click export button (download icon)
- [ ] Verify JSON file downloads
- [ ] Open file and verify it's valid JSON

#### Import
- [ ] In "My Resumes" tab
- [ ] Click "New Resume"
- [ ] Edit YAML to import resume data
- [ ] Verify resume loads correctly

### Manage Resumes
- [ ] Create multiple resumes
- [ ] Switch between resumes using dropdown
- [ ] Duplicate a resume
- [ ] Verify copy is created
- [ ] Delete a resume
- [ ] Verify resume is removed

### Job Tailoring
**Prerequisites**: Configure AI settings

- [ ] Go to "Tailoring" tab
- [ ] Paste a job description (min 100 characters)
- [ ] Click "Analyze" button
- [ ] Verify loading spinner appears
- [ ] Wait for analysis to complete
- [ ] Check that match results appear
- [ ] Review match scores
- [ ] Click "Select Best Bullets"
- [ ] Verify bullets are selected based on scores
- [ ] Check resume preview updates

### Mobile Responsive
#### Mobile (< 640px)
- [ ] Open app on mobile device or resize browser
- [ ] Verify vertical layout (preview on top, editor below)
- [ ] Check hamburger menu opens navigation
- [ ] Verify "View Bullets" button opens bullet modal
- [ ] Test that all features work on mobile
- [ ] Check touch targets are large enough
- [ ] Verify text is readable

#### Tablet (640-1024px)
- [ ] Resize browser to tablet size
- [ ] Verify side-by-side layout
- [ ] Check that content is readable
- [ ] Verify no horizontal scrolling

#### Desktop (> 1024px)
- [ ] Open on desktop browser
- [ ] Verify full layout displays correctly
- [ ] Check that all panels are visible
- [ ] Verify bullet library displays at bottom

### Keyboard Shortcuts
- [ ] Press `Ctrl/Cmd + S` - Verify resume saves
- [ ] Press `Ctrl/Cmd + P` - Verify PDF generation starts
- [ ] Press `Ctrl/Cmd + N` - Verify new resume created
- [ ] Press `Ctrl/Cmd + O` - Verify switches to My Resumes tab
- [ ] Press `Ctrl/Cmd + 1` - Verify switches to Editor tab
- [ ] Press `Ctrl/Cmd + 2` - Verify switches to AI tab
- [ ] Press `Ctrl/Cmd + 3` - Verify switches to Tailoring tab
- [ ] Press `Ctrl/Cmd + 4` - Verify switches to My Resumes tab

### Error Boundary
- [ ] Introduce an error in component (temporarily)
- [ ] Verify error boundary catches it
- [ ] Check "Something went wrong" message displays
- [ ] Click "Reset Application" button
- [ ] Verify localStorage is cleared
- [ ] Verify page reloads

### Accessibility
- [ ] Navigate with keyboard only (Tab, Enter, Space)
- [ ] Verify all interactive elements are focusable
- [ ] Check that focus indicators are visible
- [ ] Verify ARIA labels are present on buttons
- [ ] Test with screen reader (optional)
- [ ] Verify color contrast is sufficient

### Performance
- [ ] Open browser DevTools
- [ ] Check Console for errors
- [ ] Verify no memory leaks
- [ ] Test with large resumes
- [ ] Verify smooth scrolling
- [ ] Check that AI operations don't freeze UI

## Build Verification

### Development Build
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] Hot reload works
- [ ] No console warnings

### Production Build
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] dist/ folder is created
- [ ] All assets are bundled

### Type Checking
```bash
npx tsc --noEmit
```
- [ ] No TypeScript errors

## Edge Cases

### Empty States
- [ ] Create empty resume
- [ ] Verify appropriate messages display
- [ ] Test with no experience entries
- [ ] Test with no projects
- [ ] Test with no skills

### Long Content
- [ ] Create very long bullet points
- [ ] Add many experience entries
- [ ] Add many projects
- [ ] Verify UI handles overflow gracefully

### Network Errors
- [ ] Disconnect internet
- [ ] Try AI features
- [ ] Verify error message appears
- [ ] Reconnect and retry

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

## Test Results Template

```
Date: [Date]
Tester: [Name]
Browser: [Browser + Version]
Device: [Desktop/Mobile/Tablet]

Results:
- [ ] All tests passed
- [ ] Some tests failed (see below)

Failed Tests:
1. [Test name] - [Description of failure]
2. [Test name] - [Description of failure]

Notes:
[Additional notes]
```

## Known Issues

Document any known issues here:
- Issue 1: Description and workaround
- Issue 2: Description and workaround

## Regression Testing

Before releasing:
- [ ] Run all tests above
- [ ] Verify all critical paths work
- [ ] Check that previous fixes still work
- [ ] Test on multiple devices
- [ ] Verify build process works
