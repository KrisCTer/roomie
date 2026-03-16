import {Star} from 'lucide-react';

const ReviewItem = ({ review }) => {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex-shrink-0"></div>
          <h3 className="font-semibold text-sm">{review.name}</h3>
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0">{review.time}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-3">{review.comment}</p>
      <div className="flex gap-0.5">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    </div>
  );
};
export default ReviewItem;