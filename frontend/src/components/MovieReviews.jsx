import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { reviewService } from '../services/review.service';
import { toast } from 'react-toastify';
import { Star, StarHalf, MessageSquare, Edit2, Trash2 } from 'lucide-react';

const MovieReviews = ({ movieId, movieTitle }) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    content: ''
  });
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviews(movieId, page);
      setReviews(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
      
      if (user) {
        const userReviewResponse = await reviewService.getUserReview(movieId);
        setUserReview(userReviewResponse.data);
        if (userReviewResponse.data) {
          setFormData({
            rating: userReviewResponse.data.rating,
            content: userReviewResponse.data.content
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId, page, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!formData.rating || !formData.content.trim()) {
      toast.error('Please provide both a rating and review text');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewService.saveReview({
        movieId,
        ...formData
      });
      
      setUserReview(response.data);
      toast.success(editing ? 'Review updated successfully' : 'Review added successfully');
      setEditing(false);
      fetchReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error(error.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await reviewService.deleteReview(userReview._id);
      setUserReview(null);
      setFormData({ rating: 0, content: '' });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2" /> Reviews
      </h2>

      {/* Review Form */}
      {user ? (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {userReview ? 'Your Review' : 'Write a Review'}
          </h3>
          
          {userReview && !editing ? (
            <div className="mb-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    {renderStars(userReview.rating)}
                    <span className="ml-2 text-sm text-gray-300">
                      {userReview.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-2">{userReview.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(userReview.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-400 hover:text-blue-300"
                    title="Edit review"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      className="focus:outline-none"
                    >
                      {star <= formData.rating ? (
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      ) : (
                        <Star className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-300">
                    {formData.rating || 0}.0
                  </span>
                </div>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="4"
                  placeholder="Share your thoughts about this movie..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        rating: userReview.rating,
                        content: userReview.content
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={submitting || !formData.rating || !formData.content.trim()}
                >
                  {submitting ? 'Submitting...' : editing ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-300 mb-4">
            Please <a href="/signin" className="text-purple-400 hover:underline">sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-semibold text-purple-400">
                    {review.userId?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-200">
                      {review.userId?.username || 'Anonymous'}
                    </h4>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-400">
                        {new Date(review.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300">{review.content}</p>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No reviews yet. Be the first to review this movie!
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieReviews;
