import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
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
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== 'idle';

  // Check if investment is bookmarked on mount
  useEffect(() => {
    checkBookmarkStatus();
  }, [investmentId]);

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      if (fetcher.data.success) {
        const newBookmarkStatus = !isBookmarked;
        setIsBookmarked(newBookmarkStatus);
        onBookmarkChange?.(newBookmarkStatus);
      } else if (fetcher.data.error) {
        console.error('Error toggling bookmark:', fetcher.data.error);
      }
    }
  }, [fetcher.data, fetcher.state]);

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

  const toggleBookmark = () => {
    if (isLoading) return;
    
    const action = isBookmarked ? 'remove' : 'add';
    fetcher.submit(
      { investmentId, action },
      { method: 'POST', action: '/api/bookmarks', encType: 'application/json' }
    );
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
