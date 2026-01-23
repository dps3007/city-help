# CityHelp Frontend - Production Ready React Application

A complete, production-grade React frontend for the "CityHelp – Smart Citizen Complaint & Governance Platform".

## 🚀 Quick Start

```bash
cd clint
npm install
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

**Dev Server**: http://localhost:5174  
**API Base**: http://localhost:8000/api/v1

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── App.jsx           # Main router with role-based routes
│   └── Routes.jsx        # Alternative routes file (deprecated)
├── components/
│   ├── common/
│   │   ├── Badge.jsx     # Status badge component
│   │   ├── Button.jsx    # Reusable button component
│   │   ├── Loader.jsx    # Loading spinner
│   │   └── Model.jsx     # Modal dialog
│   ├── complaints/
│   │   ├── ComplaintCard.jsx      # Card component for complaints
│   │   ├── ComplaintTable.jsx     # Table view for complaints
│   │   └── StatusStepper.jsx      # Step-by-step status tracker
│   └── layout/
│       ├── DashboardLayout.jsx    # Main layout with sidebar + navbar
│       ├── Navbar.jsx             # Top navigation bar
│       └── Sidebar.jsx            # Left sidebar with role-based links
├── context/
│   └── AuthContext.jsx            # JWT authentication context
├── hooks/
│   └── useRole.js                 # Hook to get user role
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.jsx     # Admin dashboard (complaints overview)
│   │   └── ManageComplaints.jsx   # Manage complaints with actions
│   ├── auth/
│   │   ├── Login.jsx              # Login page
│   │   └── Register.jsx           # Registration page
│   ├── citizen/
│   │   ├── CitizenDashboard.jsx   # Citizen dashboard
│   │   ├── ComplaintDetail.jsx    # Single complaint view + feedback
│   │   ├── FileComplaint.jsx      # File new complaint form
│   │   ├── MyComplaints.jsx       # List of citizen's complaints
│   │   └── Rewards.jsx            # Points & badges system
│   └── Profile.jsx                # User profile (future)
├── services/
│   ├── api.js                     # Axios instance with JWT interceptor
│   ├── auth.service.js            # Authentication API calls
│   └── complaint.service.js       # Complaint API calls
├── utils/
│   └── constants.js               # App-wide constants
├── index.css                      # Global styles
└── main.jsx                       # React entry point
```

---

## 🔐 Authentication (AuthContext)

**Location**: `src/context/AuthContext.jsx`

### Features:
- JWT-based login/register
- Token + user stored in `localStorage` as `cityhelp_token` and `cityhelp_user`
- Auto-login on page refresh (token persistence)
- Auto-logout on 401 response (token expiry)
- `useAuth()` hook to access auth state in any component

### Export:
```javascript
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

### Context Value:
```javascript
{
  user: { _id, name, email, role },
  token: "JWT_TOKEN",
  isAuthenticated: boolean,
  loading: boolean,
  login({ token, user }),
  logout()
}
```

---

## 🗂️ Role-Based Routing

**Location**: `src/app/App.jsx`

### Roles Supported:
- **CITIZEN**: File complaints, view own complaints, earn rewards
- **OFFICER**: Manage assigned complaints, resolve/close
- **DEPT_HEAD**: Verify & assign complaints
- **DISTRICT_ADMIN**: Full complaint management
- **STATE_ADMIN**: Full complaint management
- **CENTRAL_ADMIN**: Full complaint management
- **SUPER_ADMIN**: Full complaint management + system access

### Route Structure:
```jsx
/login, /register          → Public (unauthenticated)
/                          → DashboardLayout (authenticated)
  ├── CITIZEN routes:
  │   ├── /
  │   ├── /complaints/new
  │   ├── /complaints
  │   ├── /complaints/:id
  │   └── /rewards
  │
  └── ADMIN routes (all non-CITIZEN):
      ├── /
      ├── /complaints
      └── /complaints/:id
```

**Authenticated admins trying to access /login → redirected to /**

---

## 📋 Pages & Components

### 1. **Authentication**

#### Login (`src/pages/auth/Login.jsx`)
- Email + Password login
- Error handling
- Auto-redirect to dashboard on success
- Link to register page

#### Register (`src/pages/auth/Register.jsx`)
- Name, email, password, role selection
- Role restrictions enforced on backend
- Auto-login after registration
- Link to login page

---

### 2. **Citizen Functionality**

#### Citizen Dashboard (`src/pages/citizen/CitizenDashboard.jsx`)
**Displays:**
- Total complaints filed
- Active complaints count
- Resolved complaints count
- Points earned (resolved × 10)
- Recent complaints table

#### File Complaint (`src/pages/citizen/FileComplaint.jsx`)
**Features:**
- Category selection (Garbage, Road, Water, Streetlight, Drainage, Electricity, Other)
- Description textarea
- Image upload
- Auto geolocation (GPS coordinates)
- Manual location input
- Success/error messaging

**API**: `POST /complaints` (multipart/form-data)

#### My Complaints (`src/pages/citizen/MyComplaints.jsx`)
**Features:**
- Table of all citizen's complaints
- Status badge with color coding
- Upvote count display
- "View" button links to detail page
- Date display

#### Complaint Detail (`src/pages/citizen/ComplaintDetail.jsx`)
**Features:**
- Full complaint information
- Status stepper (visual progress)
- Assigned officer info (if any)
- Image display (if uploaded)
- Coordinates (if geolocation provided)
- Upvote button (with count)
- Feedback submission form (only if RESOLVED/CLOSED)
  - Rating (1-5 dropdown)
  - Comment (textarea)

**APIs**:
- `GET /complaints/:id` - Get complaint details
- `POST /complaints/:id/upvote` - Upvote complaint
- `POST /complaints/:id/feedback` - Submit feedback

#### Rewards (`src/pages/citizen/Rewards.jsx`)
**Features:**
- Total points display (resolved complaints × 10)
- Progress bar to next milestone
- Achievement badges (Novice→Expert→Master→Legendary)
- "How It Works" explanation
- Leaderboard placeholder (future-ready)

**Milestones:**
- 50 pts: Novice (5 resolved)
- 100 pts: Expert (10 resolved)
- 250 pts: Master (25 resolved)
- 500 pts: Legendary (50 resolved)

---

### 3. **Admin Functionality**

#### Admin Dashboard (`src/pages/admin/AdminDashboard.jsx`)
**Displays:**
- Total complaints
- Pending complaints
- In-progress complaints
- Resolved complaints
- Recent complaints table

#### Manage Complaints (`src/pages/admin/ManageComplaints.jsx`)
**Features:**
- Table of all complaints
- Status badge display
- Upvote count
- "Manage" button opens modal
- Role-based action visibility:
  - OFFICER: Can start work, resolve
  - DEPT_HEAD+: Can verify, assign, close

**Modal Actions:**
- **Verify** (SUBMITTED → VERIFIED): DEPT_HEAD+
- **Assign Officer** (SUBMITTED → ASSIGNED): DEPT_HEAD+
  - Input officer ID
  - Validates before assigning
- **Start Work** (ASSIGNED → IN_PROGRESS): OFFICER
- **Resolve** (IN_PROGRESS → RESOLVED): OFFICER
- **Close** (RESOLVED → CLOSED): DEPT_HEAD+

**APIs Used:**
- `GET /complaints` - Get all complaints
- `PATCH /complaints/:id/verify` - Verify
- `PATCH /complaints/:id/assign` - Assign officer
- `PATCH /complaints/:id/start-work` - Start work
- `PATCH /complaints/:id/resolve` - Resolve
- `PATCH /complaints/:id/close` - Close

---

## 🔌 API Integration

**Location**: `src/services/`

### API Service (`api.js`)
- Axios instance configured for `http://localhost:8000/api/v1`
- JWT interceptor adds `Authorization: Bearer <token>` header
- Auto-logout on 401 response

### Auth Service (`auth.service.js`)
```javascript
loginUser({ email, password })      // POST /auth/login
registerUser({ name, email, password, role })  // POST /auth/register
```

### Complaint Service (`complaint.service.js`)
```javascript
// CITIZEN
createComplaint(formData)            // POST /complaints (multipart)
getMyComplaints()                    // GET /complaints (filtered by user)
getComplaintById(id)                 // GET /complaints/:id
upvoteComplaint(id)                  // POST /complaints/:id/upvote
submitFeedback(id, { rating, comment })  // POST /complaints/:id/feedback

// ADMIN/OFFICER
getAllComplaints()                   // GET /complaints
verifyComplaint(id)                  // PATCH /complaints/:id/verify
assignComplaint(id, { officerId })   // PATCH /complaints/:id/assign
startWork(id)                        // PATCH /complaints/:id/start-work
resolveComplaint(id)                 // PATCH /complaints/:id/resolve
closeComplaint(id)                   // PATCH /complaints/:id/close
```

---

## 🎨 UI Components

### Badge (`components/common/Badge.jsx`)
Status badge with color-coded styling:
- SUBMITTED: Gray
- VERIFIED: Blue
- ASSIGNED: Yellow
- IN_PROGRESS: Orange
- RESOLVED: Green
- CLOSED: Dark Gray

### Button (`components/common/Button.jsx`)
Reusable button with:
- Customizable className for colors
- Disabled state handling
- Type prop (button, submit)

### StatusStepper (`components/complaints/StatusStepper.jsx`)
Visual progress tracker showing:
- All 6 status stages
- Current position highlighted
- Connecting line showing progress

### Navbar (`components/layout/Navbar.jsx`)
- User greeting with name
- Role display
- Notification button (placeholder)
- User avatar (first letter of name)
- Logout button

### Sidebar (`components/layout/Sidebar.jsx`)
Role-based navigation:
- **CITIZEN**: Dashboard, File Complaint, My Complaints, Rewards, Profile
- **ADMIN**: Dashboard, Manage Complaints, Profile

---

## 🔄 Data Flow

### Login Flow:
1. User enters email/password on `/login`
2. `Login.jsx` calls `loginUser()`
3. Backend returns `{ user, accessToken, refreshToken }`
4. `AuthContext.login()` saves to localStorage
5. Auth state updates → redirects to `/`
6. Sidebar/Navbar render based on `user.role`

### Complaint Filing Flow:
1. Citizen fills form on `/complaints/new`
2. FileComplaint.jsx creates FormData
3. `createComplaint()` sends to `POST /complaints`
4. Success → redirect to `/complaints`
5. Complaint appears in "My Complaints" table

### Complaint Management Flow:
1. Admin on `/complaints` sees all complaints
2. Clicks "Manage" → modal opens with actions
3. Clicks action (e.g., "Verify")
4. Service method calls backend API
5. Complaints list refreshes
6. Status updated visually

---

## 🧪 Testing Checklist

- [ ] Register as CITIZEN/SUPER_ADMIN
- [ ] Login with created account
- [ ] File complaint with category, description, image, geolocation
- [ ] View complaint in "My Complaints"
- [ ] Click "View" to open complaint detail
- [ ] Upvote complaint
- [ ] After resolution, submit feedback (1-5 rating + comment)
- [ ] Navigate to "Rewards" page
- [ ] Verify points calculation
- [ ] Logout and re-login (auth persistence)
- [ ] Admin: View all complaints in manage page
- [ ] Admin: Verify, assign, resolve, close complaints
- [ ] Admin: See role-based action buttons only
- [ ] Sidebar links change based on role
- [ ] Unauthenticated user redirected to /login

---

## 🚀 Production Deployment

### Build:
```bash
npm run build    # Creates /dist folder
```

### Serve:
```bash
npm run preview  # Local production preview
# Or deploy /dist to any static host
```

### Environment:
Create `.env.local`:
```
VITE_API_BASE_URL=https://your-api.com/api/v1
```

---

## 📝 Code Standards

- ✅ Functional components with hooks
- ✅ No TypeScript (pure JavaScript)
- ✅ Context API for state management
- ✅ Axios for HTTP calls
- ✅ Tailwind CSS (utility-first)
- ✅ No inline CSS
- ✅ No hard-coded data
- ✅ Clean folder structure
- ✅ Production-ready (no demo hacks)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19  | UI Library |
| React Router v6 | Navigation |
| Axios | HTTP Client |
| Tailwind CSS | Styling |
| Vite | Build Tool |
| JavaScript (ES6+) | Language |

---

## 📧 Support

For issues or improvements, refer to the backend documentation or contact the development team.

**Happy Coding!** 🚀
