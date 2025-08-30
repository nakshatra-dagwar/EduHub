// // src/pages/CourseDetailsPage.tsx
// import CourseDetails from '../components/CourseDetails';

// const dummyData = {
//   title: 'Advanced Java Backend Development',
//   instructor: 'Ritika Dhakate',
//   weeks: 8,
//   targetAudience: 'Intermediate Java Developers',
//   price: 2999,
//   startDate: '2025-08-01',
//   weeklyDetails: [
//     { week: 1, topic: 'Spring Boot Basics', description: 'Learn the foundations of Spring Boot.' },
//     { week: 2, topic: 'RESTful APIs', description: 'Building REST APIs with controllers and services.' },
//     { week: 3, topic: 'Database Integration', description: 'Working with JPA, Hibernate, and MySQL.' },
//     { week: 4, topic: 'Authentication', description: 'JWT and session-based authentication.' },
//     { week: 5, topic: 'Testing & Debugging', description: 'JUnit, Postman, and debugging tools.' },
//     { week: 6, topic: 'Deployment', description: 'Deploy apps using Docker and cloud services.' },
//     { week: 7, topic: 'Advanced Spring Patterns', description: 'Beans, profiles, and async processing.' },
//     { week: 8, topic: 'Capstone Project', description: 'Build a full backend from scratch.' },
//   ]
// };

// const CourseDetailsPage = () => {
//   return <CourseDetails {...dummyData} />;
// };

// export default CourseDetailsPage;

// src/pages/CourseDetailsPage.tsx


import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseDetails from '../components/CourseDetails';
import { useAuth } from '../context/AuthContext';

interface WeeklyDetail {
  week: number;
  topic: string;
  description: string;
}

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [helper, setHelper] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}`);
        const data = await res.json();

        // parse weeklyOutline string into weekly details array
        const parsedWeeks: WeeklyDetail[] = data.weekly_outline
          .split('. ')
          .filter(Boolean)
          .map((sentence: string, index: number) => {
            const [topic, ...descParts] = sentence.split(':');
            return {
              week: index + 1,
              topic: topic.trim(),
              description: descParts.join(':').trim(),
            };
          });

        setCourseData({
          title: data.title,
          instructor: data.teachers[0]?.full_name ?? 'Unknown',
          weeks: parsedWeeks.length,
          targetAudience: data.target_audience,
          startDate: new Date(data.start_date).toISOString().split('T')[0],
          weeklyDetails: parsedWeeks,
        });

        // fetch student-specific price and verification status if logged in
        if (id && user) {
          try {
            const token = localStorage.getItem('accessToken');
            const priceRes = await fetch(`${import.meta.env.VITE_API_URL}/api/student/courses/${id}/price`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              }
            });
            const priceData = await priceRes.json();
            if (typeof priceData.price === 'number') setPrice(priceData.price);
            else if (!isNaN(Number(data.base_price))) setPrice(Number(data.base_price));
            if (typeof priceData.is_verified === 'boolean') {
              setIsVerified(priceData.is_verified);
              if (!priceData.is_verified) setHelper('Your student account is not verified yet. Complete ID verification to enroll.');
            }
          } catch (_) {
            if (!isNaN(Number(data.base_price))) setPrice(Number(data.base_price));
          }
        } else {
          if (!isNaN(Number(data.base_price))) setPrice(Number(data.base_price));
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  if (loading) return <div className="text-center pt-60">Loading...</div>;
  if (!courseData) return <div className="text-center pt-60 text-red-500">Course not found</div>;

  const handleEnroll = async () => {
    if (!id) return;
    // If not logged in → send to login
    if (!user) {
      navigate('/login');
      return;
    }
    // Only students can enroll
    if (user.role !== 'STUDENT') {
      setHelper('Only students can enroll.');
      return;
    }
    // Proceed to payment (handled by colleagues)
    setEnrolling(true);
    try {
      navigate(`/payment?courseId=${encodeURIComponent(id)}`);
    } finally {
      setEnrolling(false);
    }
  };

  const isStudent = user?.role === 'STUDENT';
  const isStudentVerified = isVerified === true;
  const enrollDisabled = enrolling || !isStudent || (isStudent && !isStudentVerified);
  const enrollLabel = !user
    ? 'Login to Enroll'
    : (isStudent
        ? (isStudentVerified ? (enrolling ? 'Processing...' : 'Proceed to Payment') : 'Verification required')
        : 'Only students can enroll');

  const helperText = helper
    ?? (!user
        ? 'You must be logged in as a student to enroll.'
        : (!isStudent
            ? 'Only students can enroll.'
            : (!isStudentVerified ? 'Your student account must be verified by admin before enrolling.' : undefined)));

  return (
    <div className="pt-60">
      <CourseDetails
        {...courseData}
        price={price ?? 0}
        onEnroll={handleEnroll}
        enrollDisabled={enrollDisabled}
        enrollLabel={enrollLabel}
        helperText={helperText}
      />
    </div>
  );
};

export default CourseDetailsPage;
