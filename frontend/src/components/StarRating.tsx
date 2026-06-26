interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' };

  return (
    <span className={`inline-flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={`leading-none ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            aria-label={`${star} star`}
          >
            <span className={filled || half ? 'text-amber-400' : 'text-gray-300'}>
              {half ? '½' : '★'}
            </span>
          </button>
        );
      })}
    </span>
  );
}
