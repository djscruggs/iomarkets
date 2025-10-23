import { useState, useEffect } from 'react';
import { Link, useLoaderData, MetaFunction } from 'react-router-dom';
import { TrendingUp, DollarSign, ArrowLeft } from 'lucide-react';
import { FaBookmark } from 'react-icons/fa';
import { InvestmentCard } from '../components/InvestmentCard';

interface Bookmark {
  id: string;
  investmentId: string;
  createdAt: string;
  investment: {
    id: string;
    name: string;
    sponsor: string;
    targetRaise: number;
    amountRaised: number;
    imageUrl: string;
    type: string;
    location: string;
    minInvestment: number;
    projectedReturn: number;
    term: string;
    featured: boolean;
  };
}

interface BookmarksLoaderData {
  bookmarks: Bookmark[];
}

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: 'My Bookmarks - IOMarkets' },
    { name: 'description', content: 'View your bookmarked investment opportunities.' },
  ];
};

export async function loader(): Promise<BookmarksLoaderData> {
  try {
    // Import database utilities directly instead of making HTTP request
    const { getDb } = await import('../lib/db.js');
    
    const db = getDb();
    const MOCK_USER_ID = 'user-123';
    
    const stmt = db.prepare(`
      SELECT b.*, i.*
      FROM bookmarks b
      JOIN investments i ON b.investment_id = i.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `);
    
    const bookmarks = stmt.all(MOCK_USER_ID) as Array<{
      id: string;
      user_id: string;
      investment_id: string;
      created_at: string;
      name: string;
      sponsor: string;
      target_raise: number;
      amount_raised: number;
      image_url: string;
      type: string;
      location: string;
      min_investment: number;
      projected_return: number;
      term: string;
      featured: number;
    }>;
    
    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.id,
      investmentId: bookmark.investment_id,
      createdAt: bookmark.created_at,
      investment: {
        id: bookmark.investment_id,
        name: bookmark.name,
        sponsor: bookmark.sponsor,
        targetRaise: bookmark.target_raise,
        amountRaised: bookmark.amount_raised,
        imageUrl: bookmark.image_url,
        type: bookmark.type,
        location: bookmark.location,
        minInvestment: bookmark.min_investment,
        projectedReturn: bookmark.projected_return,
        term: bookmark.term,
        featured: bookmark.featured === 1,
      }
    }));
    
    return { bookmarks: formattedBookmarks };
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return { bookmarks: [] };
  }
}

export default function Bookmarks() {
  const { bookmarks: initialBookmarks } = useLoaderData() as BookmarksLoaderData;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [removedBookmarks, setRemovedBookmarks] = useState<Set<string>>(new Set());

  // Update bookmarks when they change
  useEffect(() => {
    setBookmarks(initialBookmarks);
    setRemovedBookmarks(new Set()); // Reset removed bookmarks when page loads
  }, [initialBookmarks]);


  const handleBookmarkRemoved = (investmentId: string) => {
    setRemovedBookmarks(prev => new Set([...prev, investmentId]));
  };

  const handleBookmarkAdded = (investmentId: string) => {
    setRemovedBookmarks(prev => {
      const newSet = new Set(prev);
      newSet.delete(investmentId);
      return newSet;
    });
  };

  // Filter out removed bookmarks for display
  const visibleBookmarks = bookmarks.filter(bookmark => !removedBookmarks.has(bookmark.investmentId));
  
  const totalValue = visibleBookmarks.reduce((sum, bookmark) => sum + bookmark.investment.targetRaise, 0);
  const averageReturn = visibleBookmarks.length > 0 
    ? visibleBookmarks.reduce((sum, bookmark) => sum + bookmark.investment.projectedReturn, 0) / visibleBookmarks.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <FaBookmark className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {visibleBookmarks.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <FaBookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500 mb-6">
              Start exploring investment opportunities and bookmark the ones you're interested in.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Investments
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <FaBookmark className="w-8 h-8 mr-3 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bookmarked</p>
                    <p className="text-2xl font-bold text-gray-900">{visibleBookmarks.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(totalValue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Return</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageReturn.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookmarks Grid - Same as home page */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {bookmarks.map((bookmark) => {
                const isRemoved = removedBookmarks.has(bookmark.investmentId);
                return (
                  <div 
                    key={bookmark.id} 
                    className={`transition-all duration-300 ${
                      isRemoved ? 'opacity-40 grayscale' : 'opacity-100'
                    }`}
                  >
                    <InvestmentCard 
                      investment={bookmark.investment as any}
                      onBookmarkChange={(isBookmarked: boolean) => {
                        if (isBookmarked) {
                          handleBookmarkAdded(bookmark.investmentId);
                        } else {
                          handleBookmarkRemoved(bookmark.investmentId);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
