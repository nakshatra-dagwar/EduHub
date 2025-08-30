// src/pages/CoursesPage.tsx
import { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import styles from './coursesPage.module.css';
interface BackendCourse {
  course_id: number;
  title: string;
  description: string;
  prices: { region_id: number; price: number }[];
}

interface DisplayCourse {
  course_id: number
  title: string;
  description: string;
  price: string;
}

const Courses = () => {
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`);
        const data: BackendCourse[] = await response.json();

        const filteredCourses = data.map((course) => {
          const region1Price = course.prices.find(p => p.region_id === 1);
          return {
            course_id: course.course_id,
            title: course.title,
            description: course.description,
            price: region1Price ? region1Price.price.toFixed(2) : 'N/A',
          };
        });

        setCourses(filteredCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <h1 className={styles.title}>Available Courses</h1>

        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : (
          <div className={styles.grid}>
            {courses.map((course) => (
              <Link to={`/courses/${course.course_id}`} key={course.course_id} className="block">
                <CourseCard
                  title={course.title}
                  description={course.description}
                  price={course.price}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;





