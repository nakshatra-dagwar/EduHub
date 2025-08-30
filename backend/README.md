# EduHub Backend

A comprehensive educational platform backend built with Node.js, Express, TypeScript, and PostgreSQL. This backend powers the EduHub learning management system with role-based authentication, course management, live classes, and more.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Student, Teacher, Admin)
- **Email verification** system
- **Password reset** functionality
- **Secure cookie-based** token storage

### 📚 Course Management
- **Course creation and management** with regional pricing
- **Course enrollment** system
- **Teacher-course assignments**
- **Course search and filtering**

### 🎓 Live Learning
- **Zoom integration** for live classes
- **Class scheduling** and management
- **Meeting creation** with automatic Zoom API integration
- **Class recordings** and materials

### 📝 Assessment System
- **Quiz management** with PDF uploads
- **Test scheduling** and assignment
- **Student progress tracking**

### 👥 User Management
- **Multi-role user system** (Students, Teachers, Parents, Admins)
- **Profile management** with ID verification
- **Regional pricing** support
- **Parent-student linking**

### 📧 Communication
- **Email notifications** for verification and password reset
- **Nodemailer integration**

## 🛠️ Tech Stack

### Backend Technologies
- **Node.js** (v20.19.3) - Runtime environment
- **Express.js** (v5.1.0) - Web framework
- **TypeScript** (v5.8.3) - Type-safe JavaScript
- **PostgreSQL** - Primary database
- **pg** (v8.16.2) - PostgreSQL client

### Authentication & Security
- **bcrypt** (v6.0.0) - Password hashing
- **jsonwebtoken** (v9.0.2) - JWT tokens
- **cookie-parser** (v1.4.7) - Cookie handling

### External Integrations
- **Zoom API** - Live class integration
- **Nodemailer** (v7.0.4) - Email services
- **Multer** (v2.0.1) - File uploads

### Development Tools
- **Nodemon** (v3.1.10) - Development server
- **tsx** (v4.20.3) - TypeScript execution
- **CORS** (v2.8.5) - Cross-origin resource sharing

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - Core user accounts with role-based access
- **Student/Teacher/Parent Profiles** - Role-specific user information
- **Courses** - Educational content with regional pricing
- **Classes** - Live learning sessions with Zoom integration
- **Quizzes & Tests** - Assessment materials
- **Enrollments** - Student-course relationships
- **Regions** - Geographic pricing zones

## 🚀 Quick Start

### Prerequisites
- Node.js version 20.19.3 or higher
- PostgreSQL database
- PgAdmin (for database management)

### Environment Setup

1. **Install PostgreSQL and PgAdmin**
   - Install PostgreSQL on your system
   - Setup username and password
   - Create a database named `eduhub_db`

2. **Create `.env` file in root directory**
```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/eduhub_db
PORT=3000
JWT_SECRET="your_jwt_secret_here"
REFRESH_SECRET="your_refresh_secret_here"
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_REDIRECT_URI=http://localhost:3000/api/zoom/callback
```

3. **Install dependencies and start**
```bash
npm install
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course (Admin/Teacher)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (Admin/Teacher)

### Classes
- `POST /api/classes` - Schedule new class (Teacher)
- `GET /api/classes` - Get scheduled classes
- `GET /api/classes/:id` - Get class details

### Users
- `GET /api/students` - Get all students (Admin)
- `GET /api/teachers` - Get all teachers (Admin)
- `PUT /api/users/profile` - Update user profile

### Quizzes & Tests
- `POST /api/quizzes` - Create quiz (Admin/Teacher)
- `GET /api/quizzes` - Get available quizzes
- `POST /api/tests` - Schedule test (Teacher)

## 🏗️ Project Structure

```
src/
├── config/
│   └── db.ts                 # Database configuration
├── controllers/              # Route controllers
│   ├── auth.controller.ts    # Authentication logic
│   ├── courseController.ts   # Course management
│   ├── classesController.ts  # Class scheduling
│   ├── quiz.controller.ts    # Quiz management
│   └── ...
├── middleware/
│   └── authMiddleware.ts     # JWT authentication middleware
├── models/
│   └── user.model.ts         # Database models
├── routes/                   # API route definitions
│   ├── auth.routes.ts
│   ├── course.routes.ts
│   └── ...
├── services/                 # Business logic
│   └── courseService.ts
├── types/                    # TypeScript type definitions
│   ├── auth.types.ts
│   ├── user.types.ts
│   └── ...
├── utils/                    # Utility functions
│   ├── jwt.ts               # JWT utilities
│   ├── hash.ts              # Password hashing
│   ├── sendEmail.ts         # Email utilities
│   └── ...
└── index.ts                 # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run start:prod` - Start built production server

## 🔒 Security Features

- **JWT tokens** stored in HTTP-only cookies
- **Password hashing** with bcrypt
- **CORS protection** for cross-origin requests
- **Input validation** and sanitization
- **Rate limiting** on sensitive endpoints
- **Secure headers** implementation

## 🌐 External Integrations

### Zoom Integration
- **OAuth 2.0** authentication flow
- **Automatic meeting creation** for classes
- **Token refresh** handling
- **Meeting URL generation**

### Email Services
- **SMTP configuration** with Nodemailer
- **HTML email templates**
- **Verification emails**
- **Password reset notifications**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🔗 Related Projects

- [EduHub Frontend](../eduhub-frontend) - React-based frontend application


---

**Note:** Make sure to set up all environment variables before running the application. The Zoom integration requires a Zoom Developer account and API credentials.

