interface HeartButtonProps {
  wishlisted: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export default function HeartButton({ wishlisted, onClick, size = 'md' }: HeartButtonProps) {
  const dim = size === 'sm' ? 'w-7 h-7 text-base' : 'w-9 h-9 text-lg';
  return (
    <button
      onClick={onClick}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`${dim} flex items-center justify-center rounded-full bg-white shadow hover:scale-110 transition-transform ${wishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
    >
      {wishlisted ? '♥' : '♡'}
    </button>
  );
}
