# CityHelp Frontend - Complete Test Guide

## Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5174`
- MongoDB connected

---

## 🧪 Test Scenarios

### 1. CITIZEN WORKFLOW

#### Step 1: Register as Citizen
```
URL: http://localhost:5174/register
1. Fill form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Role: "CITIZEN"
2. Click Register
3. Auto-login occurs
4. Redirected to Dashboard
```

#### Step 2: File a Complaint
```
URL: http://localhost:5174/complaints/new
1. Select Category: "Road"
2. Description: "Pothole on Main Street"
3. Upload Image: (optional)
4. Click "Auto Detect Location" button
   - Browser prompts for permission
   - Coordinates auto-filled
5. Submit
6. Success message appears
7. Form clears
```

#### Step 3: View Complaint in List
```
URL: http://localhost:5174/complaints
1. Table shows newly filed complaint
2. Status: "SUBMITTED"
3. Upvotes: 0
4. Click "View" button
```

#### Step 4: View Complaint Details
```
URL: http://localhost:5174/complaints/<ID>
1. See full description, image, location
2. Status badge shows "SUBMITTED"
3. Status stepper shows progress
4. Click "👍 Upvote" button
5. Upvote count increases locally
6. Note: Only shows feedback after RESOLVED
```

#### Step 5: Earn Rewards
```
URL: http://localhost:5174/rewards
1. Points shown: 0 (no resolved complaints yet)
2. See milestone milestones (Novice at 50 pts)
3. Progress bar at 0%
4. "How It Works" section explains point system
```

---

### 2. SUPER ADMIN WORKFLOW

#### Step 1: Register as Super Admin
```
URL: http://localhost:5174/register
1. Fill form:
   - Name: "Admin User"
   - Email: "admin@example.com"
   - Password: "admin123"
   - Role: "SUPER_ADMIN"
2. Click Register
3. Auto-login as Super Admin
4. Redirected to Admin Dashboard
```

#### Step 2: View Admin Dashboard
```
URL: http://localhost:5174/
1. Shows statistics:
   - Total Complaints
   - Pending Complaints
   - In Progress Complaints
   - Resolved Complaints
2. Recent complaints table
```

#### Step 3: Manage Complaints
```
URL: http://localhost:5174/complaints
1. Table shows all complaints (including citizen's)
2. Shows complaint ID, category, status, upvotes
3. Click "Manage" button on a complaint
4. Modal opens with available actions
```

#### Step 4: Verify Complaint (DEPT_HEAD+)
```
In Manage Modal:
1. If complaint status is "SUBMITTED"
2. Click "Verify Complaint" button
3. Status changes to "VERIFIED"
4. Table refreshes
```

#### Step 5: Assign Officer (DEPT_HEAD+)
```
In Manage Modal:
1. If complaint status is "SUBMITTED"
2. Input field for "Officer ID" appears
3. Enter an officer's ID
4. Click "Assign Officer"
5. Status changes to "ASSIGNED"
6. Table refreshes
```

#### Step 6: Other Actions (Role-Based)
- OFFICER role: Can "Start Work" → "Resolve"
- DEPT_HEAD+ role: Can "Close" resolved complaints

---

### 3. FEEDBACK SUBMISSION

#### Step 1: Submit Feedback After Resolution
```
Prerequisite: Complaint must be in RESOLVED or CLOSED status
URL: http://localhost:5174/complaints/<ID>
1. "Submit Feedback" button appears
2. Click button
3. Form shows:
   - Rating dropdown (1-5)
   - Comment textarea
4. Select rating (e.g., 5)
5. Enter comment (optional)
6. Click "Submit Feedback"
7. Success message
8. Form closes
```

---

### 4. AUTHENTICATION & PERSISTENCE

#### Step 1: Session Persistence
```
1. Login and file complaint
2. Refresh page (F5)
3. Auth state persists from localStorage
4. Still logged in
5. Can view complaints
```

#### Step 2: Auto-Logout on 401
```
1. Manually delete token from localStorage:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Delete "cityhelp_token"
2. Try to make any API call (e.g., navigate to /complaints)
3. Auto-redirected to /login
```

#### Step 3: Login Redirect
```
1. Logout
2. Try to access /complaints
3. Auto-redirected to /login
```

#### Step 4: Post-Auth Redirect
```
1. Logout
2. Login
3. Auto-redirected to dashboard (/)
4. If try to access /login after auth
5. Auto-redirected to dashboard
```

---

### 5. ROLE-BASED UI VISIBILITY

#### Citizen Sidebar (user.role === "CITIZEN"):
```
✅ Dashboard
✅ File Complaint
✅ My Complaints
✅ Rewards
✅ Profile
```

#### Admin Sidebar (user.role !== "CITIZEN"):
```
✅ Dashboard
✅ Manage Complaints
✅ Profile
❌ File Complaint (not shown)
❌ Rewards (not shown)
```

---

### 6. GEOLOCATION TESTING

#### Step 1: Auto-Detect Location
```
1. On File Complaint page
2. Click "🌍 Auto Detect Location"
3. Browser prompts "Allow location?"
4. Click "Allow"
5. Coordinates auto-filled in format: "40.7128, -74.0060"
```

#### Step 2: Manual Location Entry
```
1. Type location manually: "City Center"
2. Submit complaint
3. Location saved and displayed in complaint detail
```

---

### 7. IMAGE UPLOAD TESTING

#### Step 1: Upload Complaint Image
```
1. File Complaint page
2. Click file input
3. Select image (JPG, PNG)
4. Filename shown
5. Submit complaint
6. Image accessible in complaint detail
```

---

### 8. UPVOTING SYSTEM

#### Step 1: Upvote Complaint
```
URL: http://localhost:5174/complaints/<ID>
1. See upvote button: "👍 Upvote (0)"
2. Click button
3. Count increases: "👍 Upvote (1)"
4. Button disabled briefly during request
```

---

### 9. REWARD POINTS CALCULATION

#### Step 1: Points Earn
```
After resolving 5 complaints:
1. Go to /rewards
2. Points shown: 50 (5 × 10)
3. Next milestone: "Expert" at 100 pts
4. Progress bar at 50%
```

#### Step 2: Milestone Achievement
```
After resolving 10 complaints:
1. Go to /rewards
2. Points shown: 100
3. "Expert" badge marked with ✓
4. Next milestone: "Master" at 250 pts
```

---

### 10. STATUS WORKFLOW

#### Complete Complaint Lifecycle:
```
CITIZEN files complaint
  ↓
Status: SUBMITTED
  ↓
ADMIN verifies
  ↓
Status: VERIFIED
  ↓
ADMIN assigns OFFICER
  ↓
Status: ASSIGNED
  ↓
OFFICER starts work
  ↓
Status: IN_PROGRESS
  ↓
OFFICER resolves
  ↓
Status: RESOLVED
  ↓
CITIZEN submits feedback
  ↓
ADMIN closes
  ↓
Status: CLOSED
  ↓
Points awarded to CITIZEN
```

---

## ✅ Quality Checklist

### Functionality
- [ ] Register as different roles works
- [ ] Login/logout functional
- [ ] File complaint with all fields
- [ ] View complaints list
- [ ] View complaint detail page
- [ ] Upvote complaints
- [ ] Submit feedback after resolution
- [ ] Admin can verify, assign, resolve, close
- [ ] Geolocation auto-detection works
- [ ] Image upload works
- [ ] Points calculated correctly
- [ ] Milestones unlocked on target points

### UI/UX
- [ ] Sidebar shows correct links per role
- [ ] Navbar displays user name and logout
- [ ] Status badges color-coded correctly
- [ ] Status stepper shows progress visually
- [ ] Loading states display
- [ ] Error messages clear and helpful
- [ ] Success messages confirmation
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] No console errors

### Authentication
- [ ] Token persists on refresh
- [ ] Auto-logout on 401
- [ ] Unauthenticated user redirected to /login
- [ ] Authenticated user can't access auth pages
- [ ] Role-based route protection works

### API Integration
- [ ] All endpoints called correctly
- [ ] Request/response format matches backend
- [ ] JWT token in Authorization header
- [ ] Error handling works
- [ ] Loading states during API calls

---

## 🐛 Debugging Tips

### Check Browser Console (F12)
```javascript
// Check auth state
localStorage.getItem("cityhelp_token")
localStorage.getItem("cityhelp_user")

// Check API calls
// Network tab → click API call → check Response
```

### Check Backend Logs
```bash
cd server
node server.js
# Check error messages in terminal
```

### Reset Data
```javascript
// Clear localStorage
localStorage.clear()
// Refresh page
location.reload()
```

---

## 📊 Test Data Summary

| User | Email | Password | Role |
|------|-------|----------|------|
| John Doe | john@example.com | password123 | CITIZEN |
| Admin User | admin@example.com | admin123 | SUPER_ADMIN |
| Officer | officer@example.com | officer123 | OFFICER |

---

## 🎯 Expected Results

After completing all test scenarios:

✅ Frontend fully functional  
✅ All CRUD operations working  
✅ Role-based access control enforced  
✅ UI responsive and intuitive  
✅ Data persists correctly  
✅ Error handling graceful  
✅ Loading states clear  
✅ Points system functional  
✅ Feedback submission working  
✅ Complete complaint lifecycle functional  

---

**Happy Testing!** 🚀
