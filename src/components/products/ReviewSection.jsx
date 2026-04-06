import React, { useState } from 'react';
import { FiStar, FiUser, FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ReviewSection = ({ reviews, averageRating }) => {
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Customer Reviews</h2>
      
      <div className="flex flex-col lg:flex-row gap-12 mb-12">
        <div className="lg:w-1/3 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
            <span className="text-6xl font-black text-gray-900 leading-none">{averageRating.toFixed(1)}</span>
            <div className="flex flex-col items-start">
              <div className="flex text-yellow-400 text-xl font-bold">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} fill={i < Math.round(averageRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-500 mt-1">Based on {reviews.length} reviews</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {ratingCounts.map(({ star, percentage }) => (
              <div key={star} className="flex items-center gap-4 group">
                <span className="w-12 text-sm font-bold text-gray-600 flex items-center group-hover:text-primary-600 transition-colors">
                  {star} <FiStar className="ml-1" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-primary-500 rounded-full"
                  />
                </div>
                <span className="w-10 text-xs font-semibold text-gray-400 text-right">{Math.round(percentage)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-12">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h3>
          <form className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">How would you rate this?</span>
              <div className="flex text-2xl h-8 cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`${i < userRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'} transition-colors`}
                    onClick={() => setUserRating(i + 1)}
                  />
                ))}
              </div>
            </div>
            <textarea 
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all shadow-sm"
              rows="4"
              placeholder="Your hands-on experience matters. Tell us what you think..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
              <FiSend className="text-lg" /> Submit Review
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-8 mt-12 pt-8 border-t border-gray-100">
        {reviews.map((review) => (
          <motion.div 
            key={review.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 border border-primary-200">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-none mb-1">{review.user_name}</h4>
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex text-yellow-400 scale-110">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-4 rounded-xl border border-dotted border-gray-200 italic font-medium">"{review.comment}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
