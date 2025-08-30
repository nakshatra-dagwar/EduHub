//src/components/courseDetails
import type { FC } from 'react';
import Navbar from './Navbar';

interface WeeklyDetail {
  week: number;
  topic: string;
  description: string;
}

interface CourseDetailsProps {
  title: string;
  instructor: string;
  weeks: number;
  targetAudience: string;
  price: number;
  startDate: string;
  weeklyDetails: WeeklyDetail[];
  onEnroll?: () => void;
  enrollDisabled?: boolean;
  enrollLabel?: string;
  helperText?: string;
}

const CourseDetails: FC<CourseDetailsProps> = ({
  title,
  instructor,
  weeks,
  targetAudience,
  price,
  startDate,
  weeklyDetails,
  onEnroll,
  enrollDisabled,
  enrollLabel,
  helperText,
}) => {
  return (
    <div>
        <Navbar/>
    
    <div className="min-h-screen bg-gray-100  pt-60 pb-10 lg:px-80">
      <div className="bg-white rounded-2xl shadow-lg p-8  w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-4">{title}</h1>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600"><span className="font-semibold">Instructor:</span> {instructor}</p>
            <p className="text-gray-600"><span className="font-semibold">Duration:</span> {weeks} weeks</p>
            <p className="text-gray-600"><span className="font-semibold">Start Date:</span> {startDate}</p>
          </div>
          <div>
            <p className="text-gray-600"><span className="font-semibold">Target Audience:</span> {targetAudience}</p>
            <p className="text-gray-600"><span className="font-semibold">Price:</span> <span className="text-brand font-semibold">₹{price}</span></p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Weekly Breakdown</h2>
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          {weeklyDetails.map((detail) => (
            <div key={detail.week} className="bg-white rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-purple-600">Week {detail.week}: {detail.topic}</p>
              <p className="text-sm text-gray-600 mt-1">{detail.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center space-y-2">
          <button
            onClick={onEnroll}
            disabled={!!enrollDisabled}
            className={`${enrollDisabled ? 'bg-gray-400 cursor-not-allowed text-white' : 'btn-brand'} px-6 py-3 rounded-xl transition`}
          >
            {enrollLabel ?? 'Enroll Now'}
          </button>
          {helperText ? (
            <div className="text-sm text-gray-500">{helperText}</div>
          ) : null}
        </div>
      </div>
    </div>
    </div>
  );
};

export default CourseDetails;
