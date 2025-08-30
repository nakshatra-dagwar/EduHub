# EduHub Educational Platform

A comprehensive educational platform built with modern web technologies, featuring role-based authentication, course management, live learning, and assessment tools. This repository contains both the main EduHub implementation and an alternative Arintu implementation.

## 🎓 Overview

EduHub is a full-stack educational platform designed to facilitate online learning with features for students, teachers, and administrators. The platform supports live classes, course management, assessments, and user management with regional pricing support.

## 📁 Project Structure

This repository contains four main projects:

### Main Implementation
- **[EduHub Backend](./eduhub-backend)** - Node.js/Express API with TypeScript and PostgreSQL
- **[EduHub Frontend](./eduhub-frontend)** - React/TypeScript frontend with Tailwind CSS



## 🚀 Key Features

### 🔐 Authentication & Security
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Student, Teacher, Admin, Parent)
- **Email verification** system
- **Password reset** functionality
- **Secure cookie-based** token storage

### 📚 Course Management
- **Course creation and management** with regional pricing
- **Course enrollment** system
- **Teacher-course assignments**
- **Course search and filtering**
- **Regional pricing** support for different markets

### 🎓 Live Learning
- **Zoom integration** for live classes
- **Class scheduling** and management
- **Meeting creation** with automatic Zoom API integration
- **Class recordings** and materials

### 📝 Assessment System
- **Quiz management** with PDF uploads
- **Test scheduling** and assignment
- **Student progress tracking**
- **Automated grading** capabilities

### 👥 User Management
- **Multi-role user system** (Students, Teachers, Parents, Admins)
- **Profile management** with ID verification
- **Parent-student linking**
- **User analytics** and reporting

### 📧 Communication
- **Email notifications** for verification and password reset
- **Nodemailer integration**
- **Automated email workflows**

## 🛠️ Tech Stack

### Backend Technologies
- **Node.js** (v20.19.3) - Runtime environment
- **Express.js** (v5.1.0) - Web framework
- **TypeScript** (v5.8.3) - Type-safe JavaScript
- **PostgreSQL** - Primary database
- **pg** (v8.16.2) - PostgreSQL client

### Frontend Technologies
- **React** (v19.1.0) - UI library
- **TypeScript** (v5.8.3) - Type-safe JavaScript
- **Vite** (v6.3.5) - Build tool and dev server
- **Tailwind CSS** (v3.4.3) - Utility-first CSS framework
- **React Router DOM** (v7.6.2) - Client-side routing

### Authentication & Security
- **bcrypt** (v6.0.0) - Password hashing
- **jsonwebtoken** (v9.0.2) - JWT tokens
- **cookie-parser** (v1.4.7) - Cookie handling

### External Integrations
- **Zoom API** - Live class integration
- **Nodemailer** (v7.0.4) - Email services
- **Multer** (v2.0.1) - File uploads

## 🚀 Quick Start

### Prerequisites
- Node.js version 20.19.3 or higher
- PostgreSQL database
- PgAdmin (for database management)
- Zoom Developer account (for live classes)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd eduhub-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
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

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd eduhub-frontend 
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the frontend server**
   ```bash
   npm run dev
   ```

## 🎯 User Roles & Permissions

### Student
- Browse and enroll in courses
- Join live classes via Zoom
- Take quizzes and tests
- Manage profile and preferences
- View course progress

### Teacher
- Create and manage courses
- Schedule live classes with Zoom integration
- Upload tests and assignments
- View student progress and analytics
- Manage course content

### Admin
- Manage all users and courses
- Oversee system operations
- Configure regional settings and pricing
- Monitor platform usage and analytics
- System-wide configuration


## 📊 Database Schema

The platform uses PostgreSQL with the following main entities:

- **Users** - Core user accounts with role-based access
- **Student/Teacher/Parent Profiles** - Role-specific user information
- **Courses** - Educational content with regional pricing
- **Classes** - Live learning sessions with Zoom integration
- **Quizzes & Tests** - Assessment materials
- **Enrollments** - Student-course relationships
- **Regions** - Geographic pricing zones

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run start:prod` - Start built production server

### Frontend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🔒 Security Features

- **JWT tokens** stored in HTTP-only cookies
- **Password hashing** with bcrypt
- **CORS protection** for cross-origin requests
- **Input validation** and sanitization
- **Rate limiting** on sensitive endpoints
- **Secure headers** implementation
- **Role-based access control**

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

## 🚀 Deployment

### Backend Deployment
- **Heroku** - Easy deployment with PostgreSQL add-on
- **AWS EC2** - Scalable cloud deployment
- **DigitalOcean** - Managed cloud hosting
- **Railway** - Modern deployment platform

### Frontend Deployment
- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **AWS S3** - Static website hosting
- **GitHub Pages** - Free hosting for public repos

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

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks (frontend)
- Maintain consistent code style
- Write meaningful commit messages
- Test changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License.


## 📈 Roadmap

### Planned Features
- **Mobile app** development
- **Advanced analytics** dashboard
- **Payment integration** (Stripe/PayPal)
- **Video streaming** capabilities
- **AI-powered** content recommendations
- **Multi-language** support
- **Advanced assessment** tools
- **Social learning** features

### Performance Improvements
- **Caching** implementation
- **CDN** integration
- **Database optimization**
- **Image optimization**
- **Progressive Web App** features

---

**Note:** Make sure to set up all environment variables and external service accounts (Zoom, email) before running the applications. The platform requires a PostgreSQL database and proper configuration for all integrations to work correctly.
