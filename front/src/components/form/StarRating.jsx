import React from 'react';

const StarRating = ({ rating, onRatingChange }) => {
    const stars = Array(5).fill(0);

    const handleStarClick = (index) => {
        onRatingChange(index);
    };

    return (
        <div className="star-rating">
            {stars.map((_, index) => (
                <span
                    key={index}
                    className={`star ${index + 1 <= rating ? 'filled' : ''}`}
                    onClick={() => handleStarClick(index + 1)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;