import { useState, useEffect } from 'react';
import { FaBookmark } from 'react-icons/fa';

interface BookmarkButtonProps {
  investmentId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({ 
  investmentId, 
  className = '', 
  size = 'md',
  onBookmarkChange
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if investment is bookmarked on mount
  useEffect(() => {
    checkBookmarkStatus();
  }, [investmentId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();
      
      if (response.ok) {
        const isBooked = data.bookmarks.some(
          (bookmark: any) => bookmark.investmentId === investmentId
        );
        setIsBookmarked(isBooked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const action = isBookmarked ? 'remove' : 'add';
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investmentId,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newBookmarkStatus = !isBookmarked;
        setIsBookmarked(newBookmarkStatus);
        onBookmarkChange?.(newBookmarkStatus);
      } else {
        console.error('Error toggling bookmark:', data.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        cursor-pointer
        ${isBookmarked 
          ? 'text-red-600' 
          : 'text-gray-400 hover:text-red-600'
        }
        ${className}
      `}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <FaBookmark 
        size={iconSizes[size]}
        className={`
          transition-all duration-200
        `}
      />
    </button>
  );
}
