# EduHub Frontend

A modern, responsive React-based frontend for the EduHub educational platform. Built with TypeScript, Vite, and Tailwind CSS, this application provides an intuitive user interface for students, teachers, and administrators.

## 🚀 Features

### 🎨 User Interface
- **Modern, responsive design** with Tailwind CSS
- **Dark/light mode** support
- **Mobile-first** approach
- **Accessible** components following WCAG guidelines
- **Smooth animations** and transitions

### 🔐 Authentication System
- **JWT-based authentication** with secure cookie storage
- **Role-based routing** (Student, Teacher, Admin)
- **Email verification** flow
- **Password reset** functionality
- **Protected routes** with automatic redirects

### 📚 Course Management
- **Course browsing** with search and filtering
- **Course details** with enrollment options
- **Course grid** with responsive cards
- **Regional pricing** display

### 🎓 Dashboard System
- **Student Dashboard** - Course enrollments, classes, quizzes
- **Teacher Dashboard** - Course management, class scheduling, test uploads
- **Admin Dashboard** - User management, course oversight, system administration

### 🎥 Live Learning
- **Class scheduling** interface for teachers
- **Zoom integration** for live classes
- **Class joining** functionality for students
- **Meeting management** tools

### 📝 Assessment Tools
- **Quiz interface** for students
- **Test scheduling** for teachers
- **Progress tracking** and results

### 👥 User Management
- **Profile management** with ID verification
- **User registration** with role selection
- **Account settings** and preferences

## 🛠️ Tech Stack

### Frontend Framework
- **React** (v19.1.0) - UI library
- **React Router DOM** (v7.6.2) - Client-side routing
- **TypeScript** (v5.8.3) - Type-safe JavaScript

### Build Tools & Development
- **Vite** (v6.3.5) - Fast build tool and dev server
- **ESLint** (v9.25.0) - Code linting
- **PostCSS** (v8.5.6) - CSS processing
- **Autoprefixer** (v10.4.21) - CSS vendor prefixing

### Styling & UI
- **Tailwind CSS** (v3.4.3) - Utility-first CSS framework
- **CSS Modules** - Component-scoped styling
- **Lucide React** (v0.525.0) - Icon library

### HTTP Client
- **Axios** (v1.10.0) - HTTP client for API calls

## 🏗️ Project Structure

```
src/
├── assets/                   # Static assets
│   ├── arintu-logo.png
│   └── favicon.png
├── components/               # Reusable UI components
│   ├── CourseCard.tsx       # Course display component
│   ├── CourseDetails.tsx    # Course information component
│   ├── CourseGrid.tsx       # Course grid layout
│   ├── CTA.tsx             # Call-to-action component
│   ├── EduHubLogo.tsx      # Logo component
│   ├── Features.tsx        # Features showcase
│   ├── Footer.tsx          # Footer component
│   ├── Hero.tsx            # Hero section
│   ├── Navbar.tsx          # Navigation bar
│   ├── Pricing.tsx         # Pricing component
│   ├── ProtectedRoute.tsx  # Route protection
│   └── Teachers.tsx        # Teachers showcase
├── context/                 # React context providers
│   └── AuthContext.tsx     # Authentication context
├── pages/                   # Page components
│   ├── dashboard/          # Dashboard pages
│   │   ├── AdminDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── TeacherDashboard.tsx
│   ├── courseDetailsPage.tsx
│   ├── coursesPage.tsx
│   ├── forgot-password.tsx
│   ├── home.tsx
│   ├── login.tsx
│   ├── reset-password.tsx
│   ├── signup.tsx
│   └── verify-email.tsx
├── router/                  # Routing configuration
│   └── index.tsx
├── index.css               # Global styles
├── main.tsx               # Application entry point
└── vite-env.d.ts          # Vite type definitions
```

## 🚀 Quick Start

### Prerequisites
- Node.js version 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eduhub-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   Adjust the URL if your backend runs elsewhere.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## 📱 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🎨 Component Library

### Core Components
- **Navbar** - Global navigation with user menu
- **Hero** - Landing page hero section
- **Features** - Platform features showcase
- **CourseCard** - Individual course display
- **CourseGrid** - Responsive course layout
- **ProtectedRoute** - Role-based route protection

### Dashboard Components
- **StudentDashboard** - Student-specific interface
- **TeacherDashboard** - Teacher management interface
- **AdminDashboard** - Administrative controls

### Authentication Components
- **Login/Signup** - User authentication forms
- **Email Verification** - Account verification flow
- **Password Reset** - Password recovery system

## 🔐 Authentication Flow

1. **Registration** - Users sign up with email and role selection
2. **Email Verification** - Verification email sent to confirm account
3. **Login** - JWT-based authentication with secure cookies
4. **Role-based Routing** - Automatic redirect to appropriate dashboard
5. **Session Management** - Persistent login state with token refresh

## 🎯 User Roles & Permissions

### Student
- Browse and enroll in courses
- Join live classes
- Take quizzes and tests
- Manage profile and preferences

### Teacher
- Create and manage courses
- Schedule live classes
- Upload tests and assignments
- View student progress

### Admin
- Manage all users and courses
- Oversee system operations
- Configure regional settings
- Monitor platform usage

## 🎨 Design System

### Color Palette
- Primary colors for branding
- Semantic colors for status indicators
- Neutral colors for text and backgrounds

### Typography
- Responsive font sizes
- Consistent heading hierarchy
- Readable body text

### Components
- Consistent spacing and padding
- Reusable button styles
- Form input patterns
- Card layouts

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL` - Backend API endpoint
- Additional variables can be added as needed

### Build Configuration
- Vite configuration in `vite.config.ts`
- TypeScript configuration in `tsconfig.json`
- Tailwind configuration in `tailwind.config.js`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```


## 🧪 Testing

### Code Quality
- ESLint for code linting
- TypeScript for type checking
- Prettier for code formatting (recommended)

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility testing
- User flow validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code style
- Write meaningful commit messages
- Test changes thoroughly


---



**Note:** Make sure the backend server is running and properly configured before starting the frontend application.