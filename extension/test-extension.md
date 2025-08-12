# Chrome Extension Testing Checklist

## 🔧 Setup
- [ ] Backend running on localhost:5000
- [ ] Extension loaded in Chrome (chrome://extensions/)
- [ ] Extension icon visible in toolbar

## 🧪 Basic Functionality Tests

### Authentication
- [ ] Click extension icon
- [ ] Register new account (test@example.com / TestPass123!)
- [ ] Login with credentials
- [ ] Verify token storage (check popup shows vault)

### Password Detection
- [ ] Go to github.com/login
- [ ] Check if Lok button appears in password field
- [ ] Try different sites (gmail.com, facebook.com)

### Password Saving
- [ ] Fill login form on any site
- [ ] Submit form
- [ ] Check if save prompt appears
- [ ] Save password and verify in popup

### Password Filling
- [ ] Go to site with saved password
- [ ] Click extension icon
- [ ] Click on saved password
- [ ] Verify form gets filled

### Password Generation
- [ ] Click "Generate Password" in popup
- [ ] Verify strong password is generated
- [ ] Check if it fills password field

## 🐛 Common Issues to Check

### UI Issues
- [ ] Popup displays correctly
- [ ] Current site name shows properly
- [ ] Password list loads without errors
- [ ] Buttons are clickable

### Functionality Issues
- [ ] No console errors in popup
- [ ] No console errors in content script
- [ ] API calls work (check Network tab)
- [ ] Storage works (check Application tab)

### Edge Cases
- [ ] Works on HTTPS sites
- [ ] Handles sites with no login forms
- [ ] Works when offline (shows cached data)
- [ ] Handles API errors gracefully

## 🎯 Test Sites
Try these popular sites:
- github.com/login
- accounts.google.com
- facebook.com/login
- twitter.com/login
- linkedin.com/login

## 📝 Notes
Record any issues found:
- Issue description
- Steps to reproduce
- Expected vs actual behavior
- Browser console errors