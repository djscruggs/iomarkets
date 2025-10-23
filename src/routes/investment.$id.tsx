import {
  useParams,
  Navigate,
  Link,
  useLocation,
  useNavigate,
  useLoaderData,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router-dom";
import { useAuth, SignIn } from "@clerk/clerk-react";
import { useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { getInvestmentById } from "../lib/queries";
import { Investment } from "../types/investment";
import { BookmarkButton } from "../components/BookmarkButton";

interface InvestmentDetailLoaderData {
  investment: Investment | null;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.investment) {
    return [
      { title: 'Investment Not Found - IOMarkets' },
    ];
  }

  return [
    { title: `${data.investment.name} - IOMarkets` },
    { name: 'description', content: `${data.investment.type === 'real-estate' ? 'Real Estate' : 'Private Equity'} investment opportunity with ${data.investment.projectedReturn}% projected IRR. Managed by ${data.investment.sponsor}.` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs): Promise<InvestmentDetailLoaderData> {
  const investment = params.id ? getInvestmentById(params.id) || null : null;
  return { investment };
}

export default function InvestmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { investment } = useLoaderData() as InvestmentDetailLoaderData;
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Store current URL when user is not signed in (Step 2)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Store the current URL in localStorage
      localStorage.setItem("redirectAfterLogin", location.pathname);
    }
  }, [isLoaded, isSignedIn, location.pathname]);

  // If investment not found, redirect to home
  if (!investment) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not signed in, show Clerk SignIn component
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="flex justify-center">
            <SignIn routing="hash" signUpUrl="#" />
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const percentRaised =
    (investment.amountRaised / investment.targetRaise) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Image */}
          <div className="aspect-[21/9] w-full overflow-hidden bg-gray-200">
            <img
              src={investment.imageUrl}
              alt={investment.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    investment.type === "real-estate"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {investment.type === "real-estate"
                    ? "Real Estate"
                    : "Private Equity"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">
                  {investment.name}
                </h1>
                <div className="ml-4">
                  <BookmarkButton 
                    investmentId={investment.id}
                    size="md"
                  />
                </div>
              </div>
              <p className="text-xl text-gray-600">{investment.sponsor}</p>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Target Raise</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(investment.targetRaise)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Projected IRR</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {investment.projectedReturn}%
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Investment Term</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {investment.term}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Min Investment</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(investment.minInvestment)}
                </p>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Funding Progress
                </h3>
                <span className="text-sm text-gray-600">
                  {percentRaised.toFixed(1)}% funded
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min(percentRaised, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(investment.amountRaised)} raised</span>
                <span>{formatCurrency(investment.targetRaise)} goal</span>
              </div>
            </div>

            {/* Location (if applicable) */}
            {investment.location && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{investment.location}</span>
                </div>
              </div>
            )}

            {/* Investment Overview */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Investment Overview
              </h3>
              <div className="prose max-w-none text-gray-600">
                <p className="mb-4">
                  This is a{" "}
                  {investment.type === "real-estate"
                    ? "real estate"
                    : "private equity"}{" "}
                  investment opportunity managed by {investment.sponsor}. The
                  fund is targeting a raise of{" "}
                  {formatCurrency(investment.targetRaise)} with a projected IRR
                  of {investment.projectedReturn}% over a {investment.term}{" "}
                  investment period.
                </p>
                <p>
                  Minimum investment: {formatCurrency(investment.minInvestment)}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <button
                onClick={() => navigate(`/investment/${id}/due-diligence`)}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg cursor-pointer"
              >
                View Due Diligence
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
