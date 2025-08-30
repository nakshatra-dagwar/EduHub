// src/components/CourseCard.tsx
import type { FC } from 'react'; 

interface CourseCardProps {
	description: string;
	title: string;
	price: string;
}

function hashToIndex(input: string, modulo: number): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % modulo;
}

const gradients = [
    'bg-gradient-to-br from-brand/10 to-indigo-50',
    'bg-gradient-to-br from-rose-50 to-orange-50',
    'bg-gradient-to-br from-emerald-50 to-teal-50',
    'bg-gradient-to-br from-sky-50 to-cyan-50',
    'bg-gradient-to-br from-violet-50 to-fuchsia-50',
    'bg-gradient-to-br from-yellow-50 to-amber-50'
];

const CourseCard: FC<CourseCardProps> = ({ description, title, price }) => {
    const idx = hashToIndex(title, gradients.length);
    const gradientClass = gradients[idx];

    return (
        <div className="group rounded-xl shadow-soft bg-white overflow-hidden border border-cream/60 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className={`h-16 w-full ${gradientClass}`} />
            <div className="p-4">
                <div className="-mt-10 mb-2 flex">
                    <div className="w-12 h-12 rounded-xl shadow-soft border border-brand/20 bg-white flex items-center justify-center text-brand font-extrabold">
                        {title.charAt(0).toUpperCase()}
                    </div>
                </div>
                <h3 className="font-semibold mt-1 text-dark text-base line-clamp-2">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{description}</p>
                <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 text-brand px-2.5 py-1 font-semibold tracking-wide">${price}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">View details →</span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;