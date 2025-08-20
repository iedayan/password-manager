# 🧪 Testing Guide - Lok Password Manager

## Quick Start Testing

### 1. **Environment Setup**
```bash
# Backend setup
cd backend
pip install -r requirements.txt
python run.py

# Frontend setup (new terminal)
cd frontend  
npm install
npm run dev
```

### 2. **Automated Testing**
```bash
# Make test script executable
chmod +x test-webapp.sh

# Run comprehensive tests
./test-webapp.sh

# Or run individual tests
cd backend && python tests/test_api.py
```

### 3. **Manual Testing Checklist**

#### **🔐 Authentication Flow**
- [ ] Register new user at `http://localhost:5173/login`
- [ ] Login with created credentials
- [ ] Verify JWT token persistence
- [ ] Test logout functionality

#### **➕ Password Management**
- [ ] Add new password via "Add Password" button
- [ ] Test auto-detection of website info
- [ ] Verify password encryption/decryption
- [ ] Edit existing password entries
- [ ] Delete password entries
- [ ] Test search functionality

#### **🛡️ Security Features**
- [ ] Navigate to Security tab
- [ ] View password health analysis
- [ ] Test password generator with different options
- [ ] Check breach monitoring alerts
- [ ] Verify password strength indicators

#### **📊 Dashboard Features**
- [ ] View password vault with all entries
- [ ] Test responsive design on mobile
- [ ] Verify real-time search
- [ ] Check password categories
- [ ] Test bulk operations

#### **⚙️ Settings & Import/Export**
- [ ] Access Settings tab
- [ ] Test import wizard with sample data
- [ ] Export passwords to JSON/CSV
- [ ] Modify user preferences
- [ ] Test onboarding flow

## **🔍 Expected Behavior**

### **Working Features** ✅
- User registration/login
- Password CRUD operations
- Encryption/decryption
- Password generation
- Search functionality
- Security dashboard
- Import/export
- Responsive UI
- Real-time updates

### **Known Issues** ⚠️
- 2FA setup needs backend integration
- Toast notifications need proper integration
- Some loading states incomplete

## **🐛 Debugging**

### **Backend Issues**
```bash
# Check backend logs
cd backend && python run.py

# Test API directly
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

### **Frontend Issues**
```bash
# Check frontend console
# Open browser dev tools (F12)
# Look for JavaScript errors in Console tab

# Check network requests
# Go to Network tab in dev tools
# Monitor API calls and responses
```

### **Database Issues**
```bash
# Check database file
ls -la backend/instance/

# Reset database if needed
rm backend/instance/lok_passwords.db
cd backend && python -c "from lok_backend.app import create_app; from lok_backend.core.database import db; app = create_app(); app.app_context().push(); db.create_all()"
```

## **📱 Cross-Platform Testing**

### **Desktop Browsers**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Edge

### **Mobile Testing**
- [ ] Chrome mobile
- [ ] Safari mobile
- [ ] Responsive design breakpoints

### **Performance Testing**
- [ ] Load time < 3 seconds
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Efficient API calls

## **🔒 Security Testing**

### **Authentication**
- [ ] JWT token expiration
- [ ] Invalid token handling
- [ ] Rate limiting on login attempts
- [ ] Password strength validation

### **Data Protection**
- [ ] Passwords encrypted at rest
- [ ] HTTPS enforcement (production)
- [ ] XSS protection
- [ ] CSRF protection

### **API Security**
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] Rate limiting on all endpoints
- [ ] Proper error handling

## **📊 Performance Benchmarks**

### **Expected Metrics**
- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Password Generation**: < 100ms
- **Search Results**: < 200ms
- **Encryption/Decryption**: < 50ms

### **Load Testing**
```bash
# Test with multiple users (requires additional tools)
# Use tools like Apache Bench or Artillery for load testing
```

## **✅ Production Readiness Checklist**

### **Security** 🔒
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Security headers implemented
- [ ] Rate limiting active
- [ ] Input validation comprehensive

### **Performance** ⚡
- [ ] Frontend optimized and minified
- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] CDN configured (if needed)

### **Monitoring** 📊
- [ ] Error logging configured
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Security monitoring

### **Backup & Recovery** 💾
- [ ] Database backup strategy
- [ ] Disaster recovery plan
- [ ] Data export functionality
- [ ] User data portability

## **🚀 Deployment Testing**

### **Local Production Build**
```bash
# Build frontend for production
cd frontend && npm run build

# Test production build
npm run preview

# Test backend in production mode
cd backend && FLASK_ENV=production python run.py
```

### **Environment Variables**
- [ ] All secrets properly configured
- [ ] Database URLs correct
- [ ] API endpoints configured
- [ ] Feature flags set appropriately