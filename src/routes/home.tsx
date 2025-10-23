import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useLoaderData,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router-dom";
import { InvestmentCard } from "../components/InvestmentCard";
import { getAllInvestments } from "../lib/queries";
import { Investment } from "../types/investment";

const ITEMS_PER_PAGE = 50;

type FilterType = "all" | "real-estate" | "private-equity" | "venture-capital";

interface HomeLoaderData {
  investments: Investment[];
}

export const meta: MetaFunction = () => {
  return [
    { title: "Investment Marketplace - IOMarkets" },
    {
      name: "description",
      content:
        "Discover exclusive real estate, private equity, and venture capital investment opportunities on IOMarkets.",
    },
  ];
};

export async function loader({}: LoaderFunctionArgs): Promise<HomeLoaderData> {
  const investments = getAllInvestments();
  return { investments };
}

export default function Home() {
  const { investments } = useLoaderData() as HomeLoaderData;
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>("all");

  // Filter investments based on selected filter
  const filteredInvestments = useMemo(() => {
    if (filter === "all") return investments;
    return investments.filter((inv) => inv.type === filter);
  }, [filter, investments]);

  const totalPages = Math.ceil(filteredInvestments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvestments = filteredInvestments.slice(startIndex, endIndex);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Investment Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Discover exclusive real estate, private equity, and venture capital opportunities
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              All Deals
            </button>
            <button
              onClick={() => handleFilterChange("real-estate")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "real-estate"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Real Estate
            </button>
            <button
              onClick={() => handleFilterChange("private-equity")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "private-equity"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Private Equity
            </button>
            <button
              onClick={() => handleFilterChange("venture-capital")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "venture-capital"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Venture Capital
            </button>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredInvestments.length)} of{" "}
            {filteredInvestments.length} investments
          </div>
        </div>

        {/* Investment Grid - 5 across */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
          {currentInvestments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-10 h-10 rounded-lg font-medium cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
