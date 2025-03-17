
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  disabled?: boolean;
  label?: string;
}

const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  size = 'md',
  count = 5,
  disabled = false,
  label,
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div className="flex items-center">
        {Array.from({ length: count }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            className={`${
              disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
            } focus:outline-none`}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(rating)}
            disabled={disabled}
            aria-label={`Rate ${rating} out of ${count}`}
          >
            <Star
              className={`${getSizeClass()} ${
                (hoverRating || value) >= rating
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-gray-700">
            {value.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
};

export default RatingInput;
