import { jsx, jsxs } from "react/jsx-runtime";
import { renderToReadableStream } from "react-dom/server";
import { ServerRouter, Link, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useNavigate as useNavigate$1 } from "react-router";
import { ClerkProvider, SignedOut, SignInButton, SignedIn, UserButton, useAuth, useUser, SignIn } from "@clerk/clerk-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLoaderData, useParams, useLocation, Navigate, Link as Link$1 } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, DollarSign, TrendingUp, Calendar, MapPin, Mail, Phone, Briefcase, FileText, Image, Video, Bot, Download, Send, ExternalLink } from "lucide-react";
const clerkPubKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YXJ0aXN0aWMtZWxrLTI2LmNsZXJrLmFjY291bnRzLmRldiQ";
async function handleRequest(request, responseStatusCode, responseHeaders, entryContext, loadContext) {
  const body = await renderToReadableStream(
    /* @__PURE__ */ jsx(ClerkProvider, { publishableKey: clerkPubKey, children: /* @__PURE__ */ jsx(ServerRouter, { context: entryContext, url: request.url }) }),
    {
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      }
    }
  );
  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function Layout$1({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsx("nav", { className: "bg-white shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between h-16 items-center", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors",
          children: [
            "IoMarkets ",
            /* @__PURE__ */ jsx("span", { className: "font-normal text-sm", children: "®" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(SignedOut, { children: /* @__PURE__ */ jsx(SignInButton, { mode: "modal", children: /* @__PURE__ */ jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer", children: "Sign In" }) }) }),
        /* @__PURE__ */ jsx(SignedIn, { children: /* @__PURE__ */ jsx(UserButton, {}) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { children })
  ] });
}
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "icon",
  href: "/favicon.png",
  type: "image/png"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    "data-theme": "light",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(Layout$1, {
        children
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function Root() {
  const navigate = useNavigate();
  const {
    isLoaded,
    isSignedIn
  } = useAuth();
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
      }
    }
  }, [isLoaded, isSignedIn, navigate]);
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (typeof error == "string") {
    details = error;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto  items-center flex flex-col",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      className: "my-10 text-red-500",
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function InvestmentCard({ investment }) {
  const percentRaised = investment.amountRaised / investment.targetRaise * 100;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: `/investment/${investment.id}`,
      className: "group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden",
      children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] overflow-hidden bg-gray-200", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: investment.imageUrl,
            alt: investment.name,
            className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-1 line-clamp-1", children: investment.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-3", children: investment.sponsor }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Target Raise:" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900", children: formatCurrency(investment.targetRaise) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "bg-blue-600 h-2 rounded-full transition-all",
                style: { width: `${Math.min(percentRaised, 100)}%` }
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                formatCurrency(investment.amountRaised),
                " raised"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                percentRaised.toFixed(0),
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: investment.type === "real-estate" ? "Real Estate" : "Private Equity" }),
            /* @__PURE__ */ jsxs("span", { className: "text-green-600 font-medium", children: [
              investment.projectedReturn,
              "% IRR"
            ] })
          ] })
        ] })
      ]
    }
  );
}
const mockInvestments = [
  {
    id: "1",
    name: "Downtown Austin Mixed-Use Development",
    sponsor: "Urban Capital Partners",
    targetRaise: 5e6,
    amountRaised: 375e4,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Austin, TX",
    minInvestment: 5e4,
    projectedReturn: 18.5,
    term: "5 years"
  },
  {
    id: "2",
    name: "SaaS Growth Fund III",
    sponsor: "TechVentures Capital",
    targetRaise: 1e7,
    amountRaised: 85e5,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 1e5,
    projectedReturn: 25,
    term: "7 years"
  },
  {
    id: "3",
    name: "Miami Waterfront Residential Tower",
    sponsor: "Coastal Development Group",
    targetRaise: 15e6,
    amountRaised: 12e6,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Miami, FL",
    minInvestment: 75e3,
    projectedReturn: 16,
    term: "4 years"
  },
  {
    id: "4",
    name: "Healthcare Innovation Portfolio",
    sponsor: "LifeScience Ventures",
    targetRaise: 8e6,
    amountRaised: 56e5,
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 22,
    term: "6 years"
  },
  {
    id: "5",
    name: "Denver Industrial Park",
    sponsor: "Midwest Industrial REIT",
    targetRaise: 12e6,
    amountRaised: 9e6,
    imageUrl: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Denver, CO",
    minInvestment: 1e5,
    projectedReturn: 14.5,
    term: "10 years"
  },
  {
    id: "6",
    name: "Consumer Brand Acquisition Fund",
    sponsor: "Equity Growth Partners",
    targetRaise: 6e6,
    amountRaised: 42e5,
    imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 25e3,
    projectedReturn: 20,
    term: "5 years"
  },
  {
    id: "7",
    name: "Nashville Entertainment District",
    sponsor: "Music City Developers",
    targetRaise: 2e7,
    amountRaised: 15e6,
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Nashville, TN",
    minInvestment: 15e4,
    projectedReturn: 19,
    term: "6 years"
  },
  {
    id: "8",
    name: "Renewable Energy Investment Pool",
    sponsor: "GreenFuture Capital",
    targetRaise: 25e6,
    amountRaised: 1875e4,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 2e5,
    projectedReturn: 15.5,
    term: "8 years"
  },
  {
    id: "9",
    name: "Phoenix Luxury Apartments",
    sponsor: "Desert Sky Properties",
    targetRaise: 85e5,
    amountRaised: 6375e3,
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Phoenix, AZ",
    minInvestment: 5e4,
    projectedReturn: 17,
    term: "5 years"
  },
  {
    id: "10",
    name: "AI/ML Startup Portfolio",
    sponsor: "Frontier Tech Ventures",
    targetRaise: 15e6,
    amountRaised: 105e5,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 1e5,
    projectedReturn: 30,
    term: "7 years"
  },
  {
    id: "11",
    name: "Seattle Office Tower Renovation",
    sponsor: "Pacific Northwest Holdings",
    targetRaise: 18e6,
    amountRaised: 135e5,
    imageUrl: "https://images.unsplash.com/photo-1481253127861-534498168948?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Seattle, WA",
    minInvestment: 125e3,
    projectedReturn: 13.5,
    term: "7 years"
  },
  {
    id: "12",
    name: "Fintech Growth Fund",
    sponsor: "Digital Finance Ventures",
    targetRaise: 12e6,
    amountRaised: 96e5,
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 75e3,
    projectedReturn: 24,
    term: "6 years"
  },
  {
    id: "13",
    name: "Atlanta Student Housing Complex",
    sponsor: "Campus Living Partners",
    targetRaise: 9e6,
    amountRaised: 63e5,
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Atlanta, GA",
    minInvestment: 5e4,
    projectedReturn: 15,
    term: "8 years"
  },
  {
    id: "14",
    name: "E-commerce Brand Rollup",
    sponsor: "Digital Commerce Group",
    targetRaise: 75e5,
    amountRaised: 525e4,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 21.5,
    term: "5 years"
  },
  {
    id: "15",
    name: "Portland Retail Center",
    sponsor: "Northwest Retail Properties",
    targetRaise: 1e7,
    amountRaised: 7e6,
    imageUrl: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Portland, OR",
    minInvestment: 1e5,
    projectedReturn: 12.5,
    term: "10 years"
  },
  {
    id: "16",
    name: "Biotech Seed Fund II",
    sponsor: "BioInnovate Capital",
    targetRaise: 2e7,
    amountRaised: 14e6,
    imageUrl: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 15e4,
    projectedReturn: 28,
    term: "8 years"
  },
  {
    id: "17",
    name: "Charlotte Distribution Center",
    sponsor: "Logistics Real Estate Fund",
    targetRaise: 14e6,
    amountRaised: 112e5,
    imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Charlotte, NC",
    minInvestment: 1e5,
    projectedReturn: 14,
    term: "12 years"
  },
  {
    id: "18",
    name: "Manufacturing Automation Portfolio",
    sponsor: "Industrial Growth Partners",
    targetRaise: 11e6,
    amountRaised: 77e5,
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 75e3,
    projectedReturn: 19.5,
    term: "6 years"
  },
  {
    id: "19",
    name: "Boston Life Science Campus",
    sponsor: "BioBay Developments",
    targetRaise: 3e7,
    amountRaised: 225e5,
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Boston, MA",
    minInvestment: 2e5,
    projectedReturn: 16.5,
    term: "8 years"
  },
  {
    id: "20",
    name: "Cybersecurity Growth Fund",
    sponsor: "SecureVentures Capital",
    targetRaise: 16e6,
    amountRaised: 128e5,
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 1e5,
    projectedReturn: 26,
    term: "7 years"
  },
  {
    id: "21",
    name: "San Diego Beach Resort",
    sponsor: "Coastal Hospitality Group",
    targetRaise: 22e6,
    amountRaised: 165e5,
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "San Diego, CA",
    minInvestment: 15e4,
    projectedReturn: 18,
    term: "6 years"
  },
  {
    id: "22",
    name: "Clean Tech Innovation Fund",
    sponsor: "Sustainable Ventures",
    targetRaise: 13e6,
    amountRaised: 91e5,
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 75e3,
    projectedReturn: 23,
    term: "7 years"
  },
  {
    id: "23",
    name: "Dallas Multi-Family Portfolio",
    sponsor: "Lone Star Residential",
    targetRaise: 17e6,
    amountRaised: 1275e4,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Dallas, TX",
    minInvestment: 1e5,
    projectedReturn: 15.5,
    term: "9 years"
  },
  {
    id: "24",
    name: "Food & Beverage Brands Fund",
    sponsor: "Culinary Capital Partners",
    targetRaise: 85e5,
    amountRaised: 595e4,
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 20.5,
    term: "5 years"
  },
  {
    id: "25",
    name: "Minneapolis Medical Office Building",
    sponsor: "Healthcare Properties LLC",
    targetRaise: 115e5,
    amountRaised: 8625e3,
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Minneapolis, MN",
    minInvestment: 75e3,
    projectedReturn: 13,
    term: "15 years"
  },
  {
    id: "26",
    name: "EdTech Venture Portfolio",
    sponsor: "Learning Innovation Ventures",
    targetRaise: 95e5,
    amountRaised: 665e4,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 24.5,
    term: "6 years"
  },
  {
    id: "27",
    name: "Raleigh Tech Park Development",
    sponsor: "Research Triangle Properties",
    targetRaise: 19e6,
    amountRaised: 1425e4,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Raleigh, NC",
    minInvestment: 125e3,
    projectedReturn: 17.5,
    term: "7 years"
  },
  {
    id: "28",
    name: "Wellness & Fitness Brand Rollup",
    sponsor: "Active Living Capital",
    targetRaise: 7e6,
    amountRaised: 49e5,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 22.5,
    term: "5 years"
  },
  {
    id: "29",
    name: "Las Vegas Entertainment Venue",
    sponsor: "Entertainment Properties Group",
    targetRaise: 24e6,
    amountRaised: 18e6,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Las Vegas, NV",
    minInvestment: 2e5,
    projectedReturn: 19.5,
    term: "8 years"
  },
  {
    id: "30",
    name: "Infrastructure Technology Fund",
    sponsor: "Smart Cities Ventures",
    targetRaise: 18e6,
    amountRaised: 126e5,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 1e5,
    projectedReturn: 21,
    term: "8 years"
  },
  {
    id: "31",
    name: "Salt Lake City Ski Resort",
    sponsor: "Mountain Hospitality Partners",
    targetRaise: 28e6,
    amountRaised: 21e6,
    imageUrl: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Salt Lake City, UT",
    minInvestment: 2e5,
    projectedReturn: 16,
    term: "10 years"
  },
  {
    id: "32",
    name: "Supply Chain Software Portfolio",
    sponsor: "Logistics Tech Ventures",
    targetRaise: 125e5,
    amountRaised: 875e4,
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 75e3,
    projectedReturn: 25.5,
    term: "6 years"
  },
  {
    id: "33",
    name: "Philadelphia Historic Renovation",
    sponsor: "Heritage Properties Fund",
    targetRaise: 135e5,
    amountRaised: 10125e3,
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Philadelphia, PA",
    minInvestment: 1e5,
    projectedReturn: 14.5,
    term: "6 years"
  },
  {
    id: "34",
    name: "Pet Care Services Consolidation",
    sponsor: "Animal Wellness Capital",
    targetRaise: 65e5,
    amountRaised: 455e4,
    imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 19,
    term: "5 years"
  },
  {
    id: "35",
    name: "Tampa Bay Waterfront Development",
    sponsor: "Gulf Coast Developers",
    targetRaise: 21e6,
    amountRaised: 1575e4,
    imageUrl: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Tampa, FL",
    minInvestment: 15e4,
    projectedReturn: 17,
    term: "7 years"
  },
  {
    id: "36",
    name: "Automation & Robotics Fund",
    sponsor: "NextGen Industry Partners",
    targetRaise: 155e5,
    amountRaised: 1085e4,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 1e5,
    projectedReturn: 27,
    term: "7 years"
  },
  {
    id: "37",
    name: "San Antonio Mixed-Use Plaza",
    sponsor: "Alamo City Developments",
    targetRaise: 165e5,
    amountRaised: 12375e3,
    imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "San Antonio, TX",
    minInvestment: 1e5,
    projectedReturn: 15,
    term: "8 years"
  },
  {
    id: "38",
    name: "Digital Media Production Fund",
    sponsor: "Content Creation Ventures",
    targetRaise: 8e6,
    amountRaised: 56e5,
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 23.5,
    term: "5 years"
  },
  {
    id: "39",
    name: "Chicago High-Rise Apartments",
    sponsor: "Windy City Properties",
    targetRaise: 26e6,
    amountRaised: 195e5,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Chicago, IL",
    minInvestment: 175e3,
    projectedReturn: 16.5,
    term: "7 years"
  },
  {
    id: "40",
    name: "Aerospace Components Manufacturer",
    sponsor: "Advanced Manufacturing Capital",
    targetRaise: 145e5,
    amountRaised: 1015e4,
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 1e5,
    projectedReturn: 20,
    term: "8 years"
  },
  {
    id: "41",
    name: "Orlando Theme Park Adjacent Hotel",
    sponsor: "Family Hospitality Partners",
    targetRaise: 195e5,
    amountRaised: 14625e3,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Orlando, FL",
    minInvestment: 125e3,
    projectedReturn: 18.5,
    term: "9 years"
  },
  {
    id: "42",
    name: "Sustainable Agriculture Tech",
    sponsor: "AgTech Innovation Fund",
    targetRaise: 11e6,
    amountRaised: 77e5,
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 75e3,
    projectedReturn: 22,
    term: "6 years"
  },
  {
    id: "43",
    name: "Pittsburgh Innovation District",
    sponsor: "Steel City Developments",
    targetRaise: 175e5,
    amountRaised: 13125e3,
    imageUrl: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Pittsburgh, PA",
    minInvestment: 125e3,
    projectedReturn: 14,
    term: "10 years"
  },
  {
    id: "44",
    name: "Gaming & Esports Portfolio",
    sponsor: "Digital Entertainment Ventures",
    targetRaise: 13e6,
    amountRaised: 91e5,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 1e5,
    projectedReturn: 29,
    term: "6 years"
  },
  {
    id: "45",
    name: "Sacramento Senior Living Community",
    sponsor: "ElderCare Properties Group",
    targetRaise: 2e7,
    amountRaised: 15e6,
    imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Sacramento, CA",
    minInvestment: 15e4,
    projectedReturn: 13.5,
    term: "12 years"
  },
  {
    id: "46",
    name: "Mobile App Development Portfolio",
    sponsor: "AppVentures Capital",
    targetRaise: 9e6,
    amountRaised: 63e5,
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 5e4,
    projectedReturn: 26.5,
    term: "5 years"
  },
  {
    id: "47",
    name: "Columbus Logistics Hub",
    sponsor: "Central Logistics Properties",
    targetRaise: 16e6,
    amountRaised: 12e6,
    imageUrl: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "Columbus, OH",
    minInvestment: 1e5,
    projectedReturn: 13,
    term: "15 years"
  },
  {
    id: "48",
    name: "Smart Home Technology Fund",
    sponsor: "Connected Living Ventures",
    targetRaise: 105e5,
    amountRaised: 735e4,
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 75e3,
    projectedReturn: 24,
    term: "6 years"
  },
  {
    id: "49",
    name: "New Orleans French Quarter Hotel",
    sponsor: "Big Easy Hospitality",
    targetRaise: 23e6,
    amountRaised: 1725e4,
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop",
    type: "real-estate",
    location: "New Orleans, LA",
    minInvestment: 175e3,
    projectedReturn: 17.5,
    term: "8 years"
  },
  {
    id: "50",
    name: "Electric Vehicle Infrastructure",
    sponsor: "EV Future Capital",
    targetRaise: 22e6,
    amountRaised: 154e5,
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop",
    type: "private-equity",
    minInvestment: 15e4,
    projectedReturn: 21.5,
    term: "9 years"
  }
];
const ITEMS_PER_PAGE = 50;
const meta$4 = () => {
  return [{
    title: "Investment Marketplace - IOMarkets"
  }, {
    name: "description",
    content: "Discover exclusive real estate and private equity investment opportunities on IOMarkets."
  }];
};
async function loader$4({
  request
}) {
  return {
    investments: mockInvestments
  };
}
const home = UNSAFE_withComponentProps(function Home() {
  const {
    investments
  } = useLoaderData();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const filteredInvestments = useMemo(() => {
    if (filter === "all") return investments;
    return investments.filter((inv) => inv.type === filter);
  }, [filter, investments]);
  const totalPages = Math.ceil(filteredInvestments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvestments = filteredInvestments.slice(startIndex, endIndex);
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen bg-gray-50",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-8",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-4xl font-bold text-gray-900 mb-2",
          children: "Investment Marketplace"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-lg text-gray-600",
          children: "Discover exclusive real estate and private equity opportunities"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mb-6 flex gap-4 items-center",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex gap-2",
          children: [/* @__PURE__ */ jsx("button", {
            onClick: () => handleFilterChange("all"),
            className: `px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${filter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}`,
            children: "All Deals"
          }), /* @__PURE__ */ jsx("button", {
            onClick: () => handleFilterChange("real-estate"),
            className: `px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${filter === "real-estate" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}`,
            children: "Real Estate"
          }), /* @__PURE__ */ jsx("button", {
            onClick: () => handleFilterChange("private-equity"),
            className: `px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${filter === "private-equity" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}`,
            children: "Private Equity"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "ml-auto text-sm text-gray-600",
          children: ["Showing ", startIndex + 1, "-", Math.min(endIndex, filteredInvestments.length), " of ", filteredInvestments.length, " investments"]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8",
        children: currentInvestments.map((investment) => /* @__PURE__ */ jsx(InvestmentCard, {
          investment
        }, investment.id))
      }), totalPages > 1 && /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-center gap-2",
        children: [/* @__PURE__ */ jsxs("button", {
          onClick: handlePrevPage,
          disabled: currentPage === 1,
          className: "flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          children: [/* @__PURE__ */ jsx(ChevronLeft, {
            className: "w-4 h-4"
          }), "Previous"]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex items-center gap-2",
          children: Array.from({
            length: totalPages
          }, (_, i) => i + 1).map((page) => /* @__PURE__ */ jsx("button", {
            onClick: () => {
              setCurrentPage(page);
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
            },
            className: `w-10 h-10 rounded-lg font-medium cursor-pointer ${currentPage === page ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`,
            children: page
          }, page))
        }), /* @__PURE__ */ jsxs("button", {
          onClick: handleNextPage,
          disabled: currentPage === totalPages,
          className: "flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          children: ["Next", /* @__PURE__ */ jsx(ChevronRight, {
            className: "w-4 h-4"
          })]
        })]
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  loader: loader$4,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
const dashboard = UNSAFE_withComponentProps(function Dashboard() {
  const {
    user
  } = useUser();
  useDocumentTitle("Dashboard - IOMarkets");
  return /* @__PURE__ */ jsxs("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
    children: [/* @__PURE__ */ jsx(SignedOut, {
      children: /* @__PURE__ */ jsxs("div", {
        className: "text-center",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-2xl font-bold text-gray-900 mb-4",
          children: "Please sign in to view the dashboard"
        }), /* @__PURE__ */ jsx(SignInButton, {
          mode: "modal",
          children: /* @__PURE__ */ jsx("button", {
            className: "bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer",
            children: "Sign In"
          })
        })]
      })
    }), /* @__PURE__ */ jsx(SignedIn, {
      children: /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl font-bold text-gray-900 mb-2",
          children: "Dashboard"
        }), /* @__PURE__ */ jsxs("p", {
          className: "text-gray-600 mb-8",
          children: ["Welcome back, ", user?.firstName || user?.emailAddresses[0]?.emailAddress, "!"]
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "bg-white p-6 rounded-lg shadow",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "text-lg font-semibold text-gray-900 mb-2",
              children: "Market Overview"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-gray-600",
              children: "View current market trends and insights"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "bg-white p-6 rounded-lg shadow",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "text-lg font-semibold text-gray-900 mb-2",
              children: "Portfolio"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-gray-600",
              children: "Track your investments and performance"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "bg-white p-6 rounded-lg shadow",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "text-lg font-semibold text-gray-900 mb-2",
              children: "Analytics"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-gray-600",
              children: "Deep dive into market analytics"
            })]
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "mt-8",
          children: /* @__PURE__ */ jsx(Link, {
            to: "/",
            className: "text-blue-600 hover:text-blue-800 transition-colors",
            children: "Back to Home"
          })
        })]
      })
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: dashboard
}, Symbol.toStringTag, { value: "Module" }));
const meta$3 = ({
  data
}) => {
  if (!data?.investment) {
    return [{
      title: "Investment Not Found - IOMarkets"
    }];
  }
  return [{
    title: `${data.investment.name} - IOMarkets`
  }, {
    name: "description",
    content: `${data.investment.type === "real-estate" ? "Real Estate" : "Private Equity"} investment opportunity with ${data.investment.projectedReturn}% projected IRR. Managed by ${data.investment.sponsor}.`
  }];
};
async function loader$3({
  params
}) {
  const investment = mockInvestments.find((inv) => inv.id === params.id) || null;
  return {
    investment
  };
}
const investment_$id = UNSAFE_withComponentProps(function InvestmentDetail() {
  const {
    id
  } = useParams();
  const {
    investment
  } = useLoaderData();
  const {
    isSignedIn,
    isLoaded
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      localStorage.setItem("redirectAfterLogin", location.pathname);
    }
  }, [isLoaded, isSignedIn, location.pathname]);
  if (!investment) {
    return /* @__PURE__ */ jsx(Navigate, {
      to: "/",
      replace: true
    });
  }
  if (!isLoaded) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-gray-50 flex items-center justify-center",
      children: /* @__PURE__ */ jsxs("div", {
        className: "text-center",
        children: [/* @__PURE__ */ jsx("div", {
          className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-gray-600",
          children: "Loading..."
        })]
      })
    });
  }
  if (!isSignedIn) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-gray-50",
      children: /* @__PURE__ */ jsxs("div", {
        className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
        children: [/* @__PURE__ */ jsxs(Link$1, {
          to: "/",
          className: "inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-12",
          children: [/* @__PURE__ */ jsx(ArrowLeft, {
            className: "w-4 h-4"
          }), "Back to Marketplace"]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex justify-center",
          children: /* @__PURE__ */ jsx(SignIn, {
            routing: "hash",
            signUpUrl: "#"
          })
        })]
      })
    });
  }
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const percentRaised = investment.amountRaised / investment.targetRaise * 100;
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen bg-gray-50",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
      children: [/* @__PURE__ */ jsxs(Link$1, {
        to: "/",
        className: "inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6",
        children: [/* @__PURE__ */ jsx(ArrowLeft, {
          className: "w-4 h-4"
        }), "Back to Marketplace"]
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-lg shadow-sm overflow-hidden",
        children: [/* @__PURE__ */ jsx("div", {
          className: "aspect-[21/9] w-full overflow-hidden bg-gray-200",
          children: /* @__PURE__ */ jsx("img", {
            src: investment.imageUrl,
            alt: investment.name,
            className: "w-full h-full object-cover"
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "p-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-6",
            children: [/* @__PURE__ */ jsx("div", {
              className: "flex items-center gap-2 mb-2",
              children: /* @__PURE__ */ jsx("span", {
                className: `px-3 py-1 rounded-full text-sm font-medium ${investment.type === "real-estate" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`,
                children: investment.type === "real-estate" ? "Real Estate" : "Private Equity"
              })
            }), /* @__PURE__ */ jsx("h1", {
              className: "text-3xl font-bold text-gray-900 mb-2",
              children: investment.name
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xl text-gray-600",
              children: investment.sponsor
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "bg-gray-50 rounded-lg p-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-gray-600 mb-2",
                children: [/* @__PURE__ */ jsx(DollarSign, {
                  className: "w-4 h-4"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-sm font-medium",
                  children: "Target Raise"
                })]
              }), /* @__PURE__ */ jsx("p", {
                className: "text-2xl font-bold text-gray-900",
                children: formatCurrency(investment.targetRaise)
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "bg-gray-50 rounded-lg p-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-gray-600 mb-2",
                children: [/* @__PURE__ */ jsx(TrendingUp, {
                  className: "w-4 h-4"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-sm font-medium",
                  children: "Projected IRR"
                })]
              }), /* @__PURE__ */ jsxs("p", {
                className: "text-2xl font-bold text-green-600",
                children: [investment.projectedReturn, "%"]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "bg-gray-50 rounded-lg p-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-gray-600 mb-2",
                children: [/* @__PURE__ */ jsx(Calendar, {
                  className: "w-4 h-4"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-sm font-medium",
                  children: "Investment Term"
                })]
              }), /* @__PURE__ */ jsx("p", {
                className: "text-2xl font-bold text-gray-900",
                children: investment.term
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "bg-gray-50 rounded-lg p-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-gray-600 mb-2",
                children: [/* @__PURE__ */ jsx(DollarSign, {
                  className: "w-4 h-4"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-sm font-medium",
                  children: "Min Investment"
                })]
              }), /* @__PURE__ */ jsx("p", {
                className: "text-2xl font-bold text-gray-900",
                children: formatCurrency(investment.minInvestment)
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-8 pb-8 border-b border-gray-200",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex justify-between items-center mb-3",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "text-lg font-semibold text-gray-900",
                children: "Funding Progress"
              }), /* @__PURE__ */ jsxs("span", {
                className: "text-sm text-gray-600",
                children: [percentRaised.toFixed(1), "% funded"]
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "w-full bg-gray-200 rounded-full h-4 mb-2",
              children: /* @__PURE__ */ jsx("div", {
                className: "bg-blue-600 h-4 rounded-full transition-all",
                style: {
                  width: `${Math.min(percentRaised, 100)}%`
                }
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex justify-between text-sm text-gray-600",
              children: [/* @__PURE__ */ jsxs("span", {
                children: [formatCurrency(investment.amountRaised), " raised"]
              }), /* @__PURE__ */ jsxs("span", {
                children: [formatCurrency(investment.targetRaise), " goal"]
              })]
            })]
          }), investment.location && /* @__PURE__ */ jsx("div", {
            className: "mb-6",
            children: /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2 text-gray-700",
              children: [/* @__PURE__ */ jsx(MapPin, {
                className: "w-5 h-5"
              }), /* @__PURE__ */ jsx("span", {
                className: "font-medium",
                children: investment.location
              })]
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-8",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "text-xl font-semibold text-gray-900 mb-4",
              children: "Investment Overview"
            }), /* @__PURE__ */ jsxs("div", {
              className: "prose max-w-none text-gray-600",
              children: [/* @__PURE__ */ jsxs("p", {
                className: "mb-4",
                children: ["This is a", " ", investment.type === "real-estate" ? "real estate" : "private equity", " ", "investment opportunity managed by ", investment.sponsor, ". The fund is targeting a raise of", " ", formatCurrency(investment.targetRaise), " with a projected IRR of ", investment.projectedReturn, "% over a ", investment.term, " ", "investment period."]
              }), /* @__PURE__ */ jsxs("p", {
                children: ["Minimum investment: ", formatCurrency(investment.minInvestment)]
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            children: /* @__PURE__ */ jsx("button", {
              onClick: () => navigate(`/investment/${id}/due-diligence`),
              className: "w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg cursor-pointer",
              children: "View Due Diligence"
            })
          })]
        })]
      })]
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: investment_$id,
  loader: loader$3,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const mockSponsors = {
  "1": [
    {
      id: "s1",
      name: "Michael Rodriguez",
      email: "mrodriguez@urbancapital.com",
      phone: "+1 (512) 555-0123",
      linkedInUrl: "https://linkedin.com/in/michael-rodriguez",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop",
      totalDeals: 23,
      totalValue: 45e7
    },
    {
      id: "s2",
      name: "Sarah Chen",
      email: "schen@urbancapital.com",
      phone: "+1 (512) 555-0124",
      linkedInUrl: "https://linkedin.com/in/sarah-chen",
      photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop",
      totalDeals: 18,
      totalValue: 32e7
    },
    {
      id: "s4",
      name: "James Thompson",
      email: "jthompson@urbancapital.com",
      phone: "+1 (512) 555-0125",
      linkedInUrl: "https://linkedin.com/in/james-thompson",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
      totalDeals: 27,
      totalValue: 58e7
    },
    {
      id: "s5",
      name: "Emily Martinez",
      email: "emartinez@urbancapital.com",
      phone: "+1 (512) 555-0126",
      linkedInUrl: "https://linkedin.com/in/emily-martinez",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
      totalDeals: 21,
      totalValue: 41e7
    }
  ],
  "2": [
    {
      id: "s3",
      name: "David Park",
      email: "dpark@techventures.com",
      phone: "+1 (650) 555-0200",
      linkedInUrl: "https://linkedin.com/in/david-park",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
      totalDeals: 31,
      totalValue: 89e7
    }
  ]
};
const mockDueDiligenceAssets = {
  "1": [
    {
      id: "a1",
      name: "Investment Memorandum",
      type: "pdf",
      url: "https://example.com/memo.pdf",
      uploadedDate: "2024-01-15",
      size: "2.4 MB"
    },
    {
      id: "a2",
      name: "Financial Projections",
      type: "pdf",
      url: "https://example.com/projections.pdf",
      uploadedDate: "2024-01-20",
      size: "1.8 MB"
    },
    {
      id: "a3",
      name: "Property Survey",
      type: "pdf",
      url: "https://example.com/survey.pdf",
      uploadedDate: "2024-01-22",
      size: "5.2 MB"
    },
    {
      id: "a4",
      name: "Site Photos - Exterior",
      type: "image",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop",
      uploadedDate: "2024-01-25",
      size: "3.1 MB"
    },
    {
      id: "a5",
      name: "Site Photos - Interior",
      type: "image",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop",
      uploadedDate: "2024-01-25",
      size: "2.8 MB"
    },
    {
      id: "a6",
      name: "Property Walkthrough Video",
      type: "video",
      url: "https://www.youtube.com/watch?v=5ZDBnjgQCtA",
      thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop",
      uploadedDate: "2024-01-28",
      size: "45 MB"
    },
    {
      id: "a7",
      name: "Market Analysis Report",
      type: "pdf",
      url: "https://example.com/market-analysis.pdf",
      uploadedDate: "2024-02-01",
      size: "3.6 MB"
    },
    {
      id: "a8",
      name: "Legal Documents",
      type: "pdf",
      url: "https://example.com/legal.pdf",
      uploadedDate: "2024-02-03",
      size: "4.2 MB"
    }
  ],
  "2": [
    {
      id: "a9",
      name: "Investment Thesis",
      type: "pdf",
      url: "https://example.com/thesis.pdf",
      uploadedDate: "2024-01-10",
      size: "1.9 MB"
    },
    {
      id: "a10",
      name: "Company Financials",
      type: "pdf",
      url: "https://example.com/financials.pdf",
      uploadedDate: "2024-01-12",
      size: "2.1 MB"
    },
    {
      id: "a11",
      name: "Pitch Deck",
      type: "pdf",
      url: "https://example.com/deck.pdf",
      uploadedDate: "2024-01-18",
      size: "8.5 MB"
    }
  ]
};
const getSponsorsForInvestment = (investmentId) => {
  if (mockSponsors[investmentId]) {
    return mockSponsors[investmentId];
  }
  const sponsorKeys = Object.keys(mockSponsors);
  const fallbackKey = sponsorKeys[parseInt(investmentId) % sponsorKeys.length] || "1";
  return mockSponsors[fallbackKey];
};
const getAssetsForInvestment = (investmentId) => {
  return mockDueDiligenceAssets[investmentId] || [
    {
      id: "default-asset",
      name: "Investment Overview",
      type: "pdf",
      url: "https://example.com/overview.pdf",
      uploadedDate: "2024-01-01",
      size: "1.5 MB"
    }
  ];
};
function DealHeader({ investment }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  return /* @__PURE__ */ jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: investment.imageUrl,
        alt: investment.name,
        className: "w-full h-full object-cover"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-gray-900 truncate", children: investment.name }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: investment.sponsor })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex items-center gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-gray-600 mb-1", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Target" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900", children: formatCurrency(investment.targetRaise) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-gray-600 mb-1", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "IRR" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-green-600", children: [
          investment.projectedReturn,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-gray-600 mb-1", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Term" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900", children: investment.term })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-gray-600 mb-1", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Min Investment" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900", children: formatCurrency(investment.minInvestment) })
      ] })
    ] })
  ] }) });
}
function SponsorCard({ sponsor }) {
  const navigate = useNavigate$1();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(amount);
  };
  const handleDealsClick = () => {
    navigate(`/sponsor/${sponsor.id}/deals`);
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 mb-3", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: sponsor.photoUrl,
          alt: sponsor.name,
          className: "w-16 h-16 rounded-full object-cover"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: sponsor.name }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `mailto:${sponsor.email}`,
              className: "flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx(Mail, { className: "w-3 h-3 flex-shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "truncate", children: sponsor.email })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `tel:${sponsor.phone}`,
              className: "flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx(Phone, { className: "w-3 h-3 flex-shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "truncate", children: sponsor.phone })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: sponsor.linkedInUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-1 text-xs hover:opacity-80 transition-opacity",
              title: "LinkedIn Profile",
              children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: "/linkedin.png",
                  alt: "LinkedIn",
                  className: "w-3 h-3 flex-shrink-0"
                }
              )
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 -mb-4 pb-4 rounded-b-lg transition-colors",
        onClick: handleDealsClick,
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-gray-600 mb-1", children: [
              /* @__PURE__ */ jsx(Briefcase, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Total Deals" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900", children: sponsor.totalDeals })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-gray-600 mb-1", children: [
              /* @__PURE__ */ jsx(DollarSign, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Total Value" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900", children: formatCurrency(sponsor.totalValue) })
          ] })
        ]
      }
    )
  ] });
}
const getYouTubeEmbedUrl = (url) => {
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};
const isYouTubeUrl = (url) => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};
function AssetViewer({ asset }) {
  if (!asset) {
    return /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(FileText, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-medium", children: "Select a document to view" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Choose from the due diligence materials on the left" })
    ] }) });
  }
  const isYouTube = asset.type === "video" && isYouTubeUrl(asset.url);
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(asset.url) : null;
  return /* @__PURE__ */ jsxs("div", { className: "h-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col", children: [
    !isYouTube && /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      asset.type === "pdf" && /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-red-500" }),
      asset.type === "image" && /* @__PURE__ */ jsx(Image, { className: "w-5 h-5 text-blue-500" }),
      asset.type === "video" && /* @__PURE__ */ jsx(Video, { className: "w-5 h-5 text-purple-500" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900", children: asset.name }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
          asset.size,
          " • Uploaded",
          " ",
          new Date(asset.uploadedDate).toLocaleDateString()
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: asset.url,
          download: true,
          className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer",
          children: "Download"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: `flex-1 overflow-auto ${isYouTube ? "p-0" : "p-6"}`, children: [
      asset.type === "pdf" && /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center bg-gray-50 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(FileText, { className: "w-24 h-24 text-red-500 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 font-medium mb-2", children: asset.name }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mb-4", children: [
          "PDF Document • ",
          asset.size
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: asset.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer",
            children: "Open in New Tab"
          }
        )
      ] }) }),
      asset.type === "image" && /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: asset.url,
          alt: asset.name,
          className: "max-w-full max-h-full object-contain rounded-lg"
        }
      ) }),
      asset.type === "video" && isYouTube && embedUrl && /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center bg-black", children: /* @__PURE__ */ jsx(
        "iframe",
        {
          src: embedUrl,
          title: asset.name,
          className: "w-full h-full",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowFullScreen: true
        }
      ) }),
      asset.type === "video" && !isYouTube && /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center bg-gray-50 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(Video, { className: "w-24 h-24 text-purple-500 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 font-medium mb-2", children: asset.name }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mb-4", children: [
          "Video File • ",
          asset.size
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: asset.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer",
            children: "Open Video"
          }
        )
      ] }) })
    ] })
  ] });
}
function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm here to help answer questions about this investment opportunity. Ask me anything about the deal structure, financials, risks, or due diligence materials.",
      timestamp: /* @__PURE__ */ new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a simulated AI response. In production, this would connect to your AI service to provide detailed answers about the investment deal based on the due diligence materials and investment data.",
        timestamp: /* @__PURE__ */ new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1e3);
  };
  const handleDownloadConversation = () => {
    const conversationText = messages.map((msg) => {
      const role = msg.role === "user" ? "You" : "AI Assistant";
      const time = msg.timestamp.toLocaleString();
      return `[${time}] ${role}:
${msg.content}
`;
    }).join("\n");
    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deal-conversation-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[350px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-gray-200 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Bot, { className: "w-4 h-4 text-blue-600" }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 text-sm", children: "AI Deal Assistant" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleDownloadConversation,
          className: "flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer",
          title: "Download Conversation",
          children: [
            /* @__PURE__ */ jsx(Download, { className: "w-3 h-3" }),
            /* @__PURE__ */ jsx("span", { children: "Download" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-3 space-y-3", children: [
      messages.map((message) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `flex ${message.role === "user" ? "justify-end" : "justify-start"}`,
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: `max-w-[80%] rounded-lg px-3 py-2 ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`,
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs", children: message.content }),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: `text-[10px] mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`,
                    children: message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  }
                )
              ]
            }
          )
        },
        message.id
      )),
      isLoading && /* @__PURE__ */ jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsx("div", { className: "bg-gray-100 rounded-lg px-3 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" }),
        /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" }),
        /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "p-3 border-t border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: input,
          onChange: (e) => setInput(e.target.value),
          placeholder: "Ask a question about this deal...",
          className: "flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          disabled: isLoading
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: !input.trim() || isLoading,
          className: "px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" })
        }
      )
    ] }) })
  ] });
}
const meta$2 = ({
  data
}) => {
  if (!data?.investment) {
    return [{
      title: "Due Diligence - IOMarkets"
    }];
  }
  return [{
    title: `Due Diligence - ${data.investment.name} - IOMarkets`
  }, {
    name: "description",
    content: `Review due diligence materials, documents, and sponsor information for ${data.investment.name}.`
  }];
};
async function loader$2({
  params
}) {
  const investment = mockInvestments.find((inv) => inv.id === params.id) || null;
  const sponsors = params.id ? getSponsorsForInvestment(params.id) : [];
  const assets = params.id ? getAssetsForInvestment(params.id) : [];
  return {
    investment,
    sponsors,
    assets
  };
}
const investment_$id_dueDiligence = UNSAFE_withComponentProps(function DueDiligence() {
  const {
    id
  } = useParams();
  const {
    investment,
    sponsors,
    assets
  } = useLoaderData();
  const [selectedAsset, setSelectedAsset] = useState(null);
  if (!investment || !id) {
    return /* @__PURE__ */ jsx(Navigate, {
      to: "/",
      replace: true
    });
  }
  const getAssetIcon = (type) => {
    switch (type) {
      case "pdf":
        return /* @__PURE__ */ jsx(FileText, {
          className: "w-4 h-4 text-red-500"
        });
      case "image":
        return /* @__PURE__ */ jsx(Image, {
          className: "w-4 h-4 text-blue-500"
        });
      case "video":
        return /* @__PURE__ */ jsx(Video, {
          className: "w-4 h-4 text-purple-500"
        });
      default:
        return /* @__PURE__ */ jsx(FileText, {
          className: "w-4 h-4 text-gray-500"
        });
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-gray-50 flex flex-col",
    children: [/* @__PURE__ */ jsx(DealHeader, {
      investment
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex-1 flex overflow-hidden",
      children: [/* @__PURE__ */ jsx("div", {
        className: "w-80 bg-white border-r border-gray-200 overflow-y-auto",
        children: /* @__PURE__ */ jsxs("div", {
          className: "p-4",
          children: [/* @__PURE__ */ jsxs(Link$1, {
            to: `/investment/${id}`,
            className: "inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4 text-sm",
            children: [/* @__PURE__ */ jsx(ArrowLeft, {
              className: "w-4 h-4"
            }), "Back to Deal Overview"]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-6",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3",
              children: "Deal Sponsors"
            }), /* @__PURE__ */ jsx("div", {
              className: "space-y-3",
              children: sponsors.map((sponsor) => /* @__PURE__ */ jsx(SponsorCard, {
                sponsor
              }, sponsor.id))
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3",
              children: "Due Diligence Materials"
            }), /* @__PURE__ */ jsx("div", {
              className: "space-y-1",
              children: assets.map((asset) => /* @__PURE__ */ jsx("button", {
                onClick: () => setSelectedAsset(asset),
                className: `w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${selectedAsset?.id === asset.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"}`,
                children: /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [getAssetIcon(asset.type), /* @__PURE__ */ jsxs("div", {
                    className: "flex-1 min-w-0",
                    children: [/* @__PURE__ */ jsx("p", {
                      className: "text-sm font-medium text-gray-900 truncate",
                      children: asset.name
                    }), /* @__PURE__ */ jsx("p", {
                      className: "text-xs text-gray-500",
                      children: asset.size
                    })]
                  })]
                })
              }, asset.id))
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex-1 flex flex-col overflow-hidden",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex-1 p-6 overflow-auto",
          children: /* @__PURE__ */ jsx(AssetViewer, {
            asset: selectedAsset
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "p-6 pt-0",
          children: /* @__PURE__ */ jsx(AIChat, {})
        })]
      })]
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: investment_$id_dueDiligence,
  loader: loader$2,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const meta$1 = ({
  data
}) => {
  if (!data?.sponsor) {
    return [{
      title: "Sponsor Not Found - IOMarkets"
    }];
  }
  return [{
    title: `${data.sponsor.name} - Deals Portfolio - IOMarkets`
  }, {
    name: "description",
    content: `View all ${data.sponsor.totalDeals} investment deals managed by ${data.sponsor.name} on IOMarkets.`
  }];
};
async function loader$1({
  params
}) {
  let sponsor = null;
  for (const investmentId in mockSponsors) {
    const sponsorList = mockSponsors[investmentId];
    const found = sponsorList.find((s) => s.id === params.sponsorId);
    if (found) {
      sponsor = found;
      break;
    }
  }
  return {
    sponsor
  };
}
const sponsor_$sponsorId_deals = UNSAFE_withComponentProps(function SponsorDeals() {
  const {
    sponsorId
  } = useParams();
  const {
    sponsor
  } = useLoaderData();
  const navigate = useNavigate();
  if (!sponsor) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-gray-50 flex items-center justify-center",
      children: /* @__PURE__ */ jsxs("div", {
        className: "text-center",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-2xl font-bold text-gray-900 mb-2",
          children: "Sponsor Not Found"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-gray-600",
          children: "The sponsor you're looking for doesn't exist."
        })]
      })
    });
  }
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(amount);
  };
  const formatFullCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const currentDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const dealTypes = ["real-estate", "private-equity"];
  const realEstateTypes = ["Mixed-Use Development", "Residential Tower", "Office Complex", "Retail Center", "Industrial Park", "Apartment Complex", "Hotel & Resort", "Student Housing"];
  const privateEquityTypes = ["SaaS Growth Fund", "Healthcare Innovation Portfolio", "Manufacturing Acquisition", "E-commerce Platform", "Fintech Expansion", "AI/ML Technology", "Consumer Brands Portfolio", "Clean Energy Ventures"];
  const locations = ["Austin, TX", "Miami, FL", "Denver, CO", "Seattle, WA", "Boston, MA", "Nashville, TN", "Portland, OR", "Atlanta, GA", "Phoenix, AZ", "Charlotte, NC"];
  const terms = ["3 years", "4 years", "5 years", "7 years", "10 years"];
  const realEstateImages = ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1565402170291-8491f14678db?w=800&auto=format&fit=crop"];
  const privateEquityImages = ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&auto=format&fit=crop"];
  const generateDeals = (count) => {
    const deals = [];
    for (let i = 0; i < count; i++) {
      const type = dealTypes[i % 2];
      const isRealEstate = type === "real-estate";
      const dealName = isRealEstate ? `${locations[i % locations.length].split(",")[0]} ${realEstateTypes[i % realEstateTypes.length]}` : `${privateEquityTypes[i % privateEquityTypes.length]} ${Math.floor(i / privateEquityTypes.length) + 1}`;
      const targetRaise = (Math.floor(Math.random() * 20) + 5) * 1e6;
      const projectedReturn = (Math.random() * 15 + 12).toFixed(1);
      const imageArray = isRealEstate ? realEstateImages : privateEquityImages;
      deals.push({
        id: `${sponsor.id}-deal-${i}`,
        name: dealName,
        sponsor: sponsor.name,
        targetRaise,
        amountRaised: targetRaise * 0.75,
        imageUrl: imageArray[i % imageArray.length],
        type,
        location: isRealEstate ? locations[i % locations.length] : void 0,
        minInvestment: targetRaise * 0.01,
        projectedReturn: parseFloat(projectedReturn),
        term: terms[i % terms.length]
      });
    }
    return deals;
  };
  const sponsorDeals = generateDeals(sponsor.totalDeals);
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen bg-gray-50",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-7xl mx-auto px-4 py-8",
      children: [/* @__PURE__ */ jsx("div", {
        className: "bg-white rounded-lg border border-gray-200 p-6 mb-6",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex items-start justify-between",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-start gap-4",
            children: [/* @__PURE__ */ jsx("img", {
              src: sponsor.photoUrl,
              alt: sponsor.name,
              className: "w-20 h-20 rounded-full object-cover"
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-2xl font-bold text-gray-900 mb-3",
                children: sponsor.name
              }), /* @__PURE__ */ jsxs("div", {
                className: "space-y-2",
                children: [/* @__PURE__ */ jsxs("a", {
                  href: `mailto:${sponsor.email}`,
                  className: "flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors",
                  children: [/* @__PURE__ */ jsx(Mail, {
                    className: "w-4 h-4"
                  }), /* @__PURE__ */ jsx("span", {
                    children: sponsor.email
                  })]
                }), /* @__PURE__ */ jsxs("a", {
                  href: `tel:${sponsor.phone}`,
                  className: "flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors",
                  children: [/* @__PURE__ */ jsx(Phone, {
                    className: "w-4 h-4"
                  }), /* @__PURE__ */ jsx("span", {
                    children: sponsor.phone
                  })]
                }), /* @__PURE__ */ jsxs("a", {
                  href: sponsor.linkedInUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex items-center gap-2 text-sm hover:opacity-80 transition-opacity",
                  children: [/* @__PURE__ */ jsx("img", {
                    src: "/linkedin.png",
                    alt: "LinkedIn",
                    className: "w-4 h-4"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-gray-600",
                    children: "LinkedIn Profile"
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-6 mt-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [/* @__PURE__ */ jsx(Briefcase, {
                    className: "w-4 h-4 text-gray-600"
                  }), /* @__PURE__ */ jsxs("span", {
                    className: "text-sm text-gray-600",
                    children: [/* @__PURE__ */ jsx("span", {
                      className: "font-semibold text-gray-900",
                      children: sponsor.totalDeals
                    }), " Total Deals"]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [/* @__PURE__ */ jsx(DollarSign, {
                    className: "w-4 h-4 text-gray-600"
                  }), /* @__PURE__ */ jsxs("span", {
                    className: "text-sm text-gray-600",
                    children: [/* @__PURE__ */ jsx("span", {
                      className: "font-semibold text-gray-900",
                      children: formatCurrency(sponsor.totalValue)
                    }), " Total Value"]
                  })]
                })]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-2",
            children: [/* @__PURE__ */ jsxs("a", {
              href: "#",
              className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer",
              children: [/* @__PURE__ */ jsx(ExternalLink, {
                className: "w-4 h-4"
              }), /* @__PURE__ */ jsxs("span", {
                className: "text-sm font-medium",
                children: ["Background Check as of ", currentDate]
              })]
            }), /* @__PURE__ */ jsxs("a", {
              href: "#",
              className: "flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer",
              children: [/* @__PURE__ */ jsx(ExternalLink, {
                className: "w-4 h-4"
              }), /* @__PURE__ */ jsx("span", {
                className: "text-sm font-medium",
                children: "Investor Endorsements"
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-lg border border-gray-200 overflow-hidden",
        children: [/* @__PURE__ */ jsx("div", {
          className: "px-6 py-4 border-b border-gray-200",
          children: /* @__PURE__ */ jsx("h2", {
            className: "text-xl font-bold text-gray-900",
            children: "Deals Portfolio"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "divide-y divide-gray-200",
          children: sponsorDeals.length === 0 ? /* @__PURE__ */ jsx("div", {
            className: "px-6 py-12 text-center text-gray-500",
            children: "No deals found for this sponsor"
          }) : sponsorDeals.map((deal) => /* @__PURE__ */ jsx("div", {
            className: "px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer",
            onClick: () => navigate(`/sponsor/${sponsorId}/deals/${deal.id}`),
            children: /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-4",
              children: [/* @__PURE__ */ jsx("img", {
                src: deal.imageUrl,
                alt: deal.name,
                className: "w-24 h-24 rounded-lg object-cover flex-shrink-0"
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex-1 min-w-0",
                children: [/* @__PURE__ */ jsx("h3", {
                  className: "text-lg font-semibold text-gray-900 mb-1",
                  children: deal.name
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-6 text-sm text-gray-600",
                  children: [/* @__PURE__ */ jsxs("span", {
                    children: [/* @__PURE__ */ jsx("span", {
                      className: "font-medium text-gray-700",
                      children: "Type:"
                    }), " ", deal.type === "real-estate" ? "Real Estate" : "Private Equity"]
                  }), deal.location && /* @__PURE__ */ jsxs("span", {
                    children: [/* @__PURE__ */ jsx("span", {
                      className: "font-medium text-gray-700",
                      children: "Location:"
                    }), " ", deal.location]
                  }), /* @__PURE__ */ jsxs("span", {
                    children: [/* @__PURE__ */ jsx("span", {
                      className: "font-medium text-gray-700",
                      children: "Term:"
                    }), " ", deal.term]
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "text-right flex-shrink-0",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "text-2xl font-bold text-gray-900",
                  children: formatFullCurrency(deal.targetRaise)
                }), /* @__PURE__ */ jsx("div", {
                  className: "text-sm text-gray-500",
                  children: "Target Raise"
                }), /* @__PURE__ */ jsxs("div", {
                  className: "text-sm text-green-600 font-medium mt-1",
                  children: [deal.projectedReturn, "% IRR"]
                })]
              })]
            })
          }, deal.id))
        })]
      })]
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: sponsor_$sponsorId_deals,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [{
    title: "Deal Payouts - IOMarkets"
  }, {
    name: "description",
    content: "View detailed payout history and LP distributions for this investment deal."
  }];
};
async function loader({
  params
}) {
  const dealIndex = parseInt(params.dealId?.split("-").pop() || "0");
  return {
    dealIndex,
    sponsorId: params.sponsorId || "",
    dealId: params.dealId || ""
  };
}
const sponsor_$sponsorId_deals_$dealId = UNSAFE_withComponentProps(function DealPayouts() {
  const {
    sponsorId,
    dealId,
    dealIndex
  } = useLoaderData();
  const navigate = useNavigate();
  const dealTypes = ["real-estate", "private-equity"];
  const realEstateTypes = ["Mixed-Use Development", "Residential Tower", "Office Complex", "Retail Center", "Industrial Park", "Apartment Complex", "Hotel & Resort", "Student Housing"];
  const privateEquityTypes = ["SaaS Growth Fund", "Healthcare Innovation Portfolio", "Manufacturing Acquisition", "E-commerce Platform", "Fintech Expansion", "AI/ML Technology", "Consumer Brands Portfolio", "Clean Energy Ventures"];
  const locations = ["Austin, TX", "Miami, FL", "Denver, CO", "Seattle, WA", "Boston, MA", "Nashville, TN", "Portland, OR", "Atlanta, GA", "Phoenix, AZ", "Charlotte, NC"];
  const terms = ["3 years", "4 years", "5 years", "7 years", "10 years"];
  const type = dealTypes[dealIndex % 2];
  const isRealEstate = type === "real-estate";
  const dealName = isRealEstate ? `${locations[dealIndex % locations.length].split(",")[0]} ${realEstateTypes[dealIndex % realEstateTypes.length]}` : `${privateEquityTypes[dealIndex % privateEquityTypes.length]} ${Math.floor(dealIndex / privateEquityTypes.length) + 1}`;
  const realEstateImages = ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1565402170291-8491f14678db?w=800&auto=format&fit=crop"];
  const privateEquityImages = ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&auto=format&fit=crop"];
  const imageArray = isRealEstate ? realEstateImages : privateEquityImages;
  const imageUrl = imageArray[dealIndex % imageArray.length];
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 1e4;
    return x - Math.floor(x);
  };
  const targetRaise = (Math.floor(seededRandom(dealIndex * 1e3) * 20) + 5) * 1e6;
  const projectedReturn = parseFloat((seededRandom(dealIndex * 2e3) * 15 + 12).toFixed(1));
  const term = terms[dealIndex % terms.length];
  const termYears = parseInt(term.split(" ")[0]);
  const totalMonths = termYears * 12;
  const generateAssetId = (seed) => {
    const base = 31415926;
    const multiplier = 271828;
    return (base + seed * multiplier) % 999999999;
  };
  const assetId = generateAssetId(dealIndex);
  const investmentAmount = targetRaise;
  const annualReturnAmount = investmentAmount * (projectedReturn / 100);
  const avgMonthlyDistribution = annualReturnAmount / 12;
  const generatePayments = () => {
    const payments2 = [];
    const startDate = /* @__PURE__ */ new Date();
    startDate.setMonth(startDate.getMonth() - totalMonths + 1);
    const seededRandomFn = (seed) => {
      const x = Math.sin(seed) * 1e4;
      return x - Math.floor(x);
    };
    const amounts = [];
    for (let year = 0; year < termYears; year++) {
      let yearTotal = 0;
      const yearAmounts = [];
      for (let month = 0; month < 11; month++) {
        const monthIndex = year * 12 + month;
        const stdDev = avgMonthlyDistribution * 0.15;
        const halfStdDev = stdDev * 0.5;
        const randomFactor = (seededRandomFn(dealIndex * 100 + monthIndex) - 0.5) * 2;
        const variation = randomFactor * halfStdDev;
        const amount = avgMonthlyDistribution + variation;
        yearAmounts.push(amount);
        yearTotal += amount;
      }
      const finalAmount = annualReturnAmount - yearTotal;
      yearAmounts.push(finalAmount);
      amounts.push(...yearAmounts);
    }
    for (let i = 0; i < totalMonths; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      const txHash = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase().substring(0, 52);
      const amount = amounts[i];
      const percentReturn = amount / investmentAmount * 100;
      payments2.push({
        month: i + 1,
        date: paymentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        amount,
        percentReturn,
        txHash,
        assetId
      });
    }
    return payments2.reverse();
  };
  const payments = generatePayments();
  const totalDistributed = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalReturnPercent = totalDistributed / investmentAmount * 100;
  const avgMonthlyReturnPercent = projectedReturn / 12;
  const formatCurrency = (amount, decimals = 2) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  };
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen bg-gray-50",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-7xl mx-auto px-4 py-8",
      children: [/* @__PURE__ */ jsxs("button", {
        onClick: () => navigate(`/sponsor/${sponsorId}/deals`),
        className: "flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors cursor-pointer",
        children: [/* @__PURE__ */ jsx(ArrowLeft, {
          className: "w-4 h-4"
        }), /* @__PURE__ */ jsx("span", {
          children: "Back to Sponsor Deals"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "bg-white rounded-lg border border-gray-200 p-6 mb-6",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex items-start gap-6",
          children: [/* @__PURE__ */ jsx("img", {
            src: imageUrl,
            alt: dealName,
            className: "w-32 h-32 rounded-lg object-cover flex-shrink-0"
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex-1",
            children: [/* @__PURE__ */ jsx("h1", {
              className: "text-2xl font-bold text-gray-900 mb-2",
              children: dealName
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-sm",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "font-medium text-gray-700",
                  children: "Asset Type:"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-gray-600",
                  children: isRealEstate ? "Real Estate" : "Private Equity"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-sm",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "font-medium text-gray-700",
                  children: "Total Equity:"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-gray-900 font-semibold",
                  children: formatCurrency(investmentAmount, 0)
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-sm",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "font-medium text-gray-700",
                  children: "Term:"
                }), /* @__PURE__ */ jsxs("span", {
                  className: "text-gray-600",
                  children: [term, " (", totalMonths, " months)"]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-sm",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "font-medium text-gray-700",
                  children: "Realized IRR:"
                }), /* @__PURE__ */ jsxs("span", {
                  className: "text-green-600 font-semibold",
                  children: [projectedReturn, "%"]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-sm",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "font-medium text-gray-700",
                  children: "Avg Monthly Distribution:"
                }), /* @__PURE__ */ jsxs("span", {
                  className: "text-green-600 font-semibold",
                  children: [avgMonthlyReturnPercent.toFixed(3), "%"]
                })]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "bg-gray-50 rounded-lg p-4 flex-shrink-0",
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-sm text-gray-600 mb-1",
              children: "Algorand Asset ID"
            }), /* @__PURE__ */ jsx("div", {
              className: "text-2xl font-bold text-gray-900 mb-3",
              children: assetId
            }), /* @__PURE__ */ jsxs("a", {
              href: `https://explorer.perawallet.app/asset/${assetId}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer",
              children: [/* @__PURE__ */ jsx(ExternalLink, {
                className: "w-4 h-4"
              }), /* @__PURE__ */ jsx("span", {
                children: "View on Pera Explorer"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-3 pt-3 border-t border-gray-200",
              children: [/* @__PURE__ */ jsx("div", {
                className: "text-xs text-gray-500 mb-1",
                children: "Payment Token"
              }), /* @__PURE__ */ jsx("div", {
                className: "font-semibold text-gray-900",
                children: "USDC"
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-lg border border-gray-200 overflow-hidden",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "px-6 py-4 border-b border-gray-200 bg-gray-50",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xl font-bold text-gray-900",
            children: "LP Distribution History"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-600 mt-1",
            children: "All payments made in USDC on the Algorand blockchain"
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "overflow-x-auto",
          children: /* @__PURE__ */ jsxs("table", {
            className: "w-full",
            children: [/* @__PURE__ */ jsx("thead", {
              className: "bg-gray-50 border-b border-gray-200",
              children: /* @__PURE__ */ jsxs("tr", {
                children: [/* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  children: "Month"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  children: "Date"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  children: "Type"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",
                  children: "Amount (USDC)"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",
                  children: "Return %"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  children: "Transaction"
                })]
              })
            }), /* @__PURE__ */ jsx("tbody", {
              className: "bg-white divide-y divide-gray-200",
              children: payments.map((payment, index) => /* @__PURE__ */ jsxs("tr", {
                className: "hover:bg-gray-50 transition-colors",
                children: [/* @__PURE__ */ jsxs("td", {
                  className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",
                  children: ["Month ", payment.month]
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600",
                  children: payment.date
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600",
                  children: "LP Distribution"
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right",
                  children: formatCurrency(payment.amount)
                }), /* @__PURE__ */ jsxs("td", {
                  className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right",
                  children: [payment.percentReturn.toFixed(2), "%"]
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 text-sm text-gray-600",
                  children: /* @__PURE__ */ jsxs("a", {
                    href: `https://explorer.perawallet.app/tx/${payment.txHash}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer",
                    title: payment.txHash,
                    children: [/* @__PURE__ */ jsxs("span", {
                      className: "font-mono text-xs",
                      children: [payment.txHash.substring(0, 8), "...", payment.txHash.substring(payment.txHash.length - 6)]
                    }), /* @__PURE__ */ jsx(ExternalLink, {
                      className: "w-3 h-3 flex-shrink-0"
                    })]
                  })
                })]
              }, index))
            }), /* @__PURE__ */ jsx("tfoot", {
              className: "bg-gray-50 border-t-2 border-gray-300",
              children: /* @__PURE__ */ jsxs("tr", {
                children: [/* @__PURE__ */ jsx("td", {
                  colSpan: 3,
                  className: "px-6 py-4 text-sm font-bold text-gray-900",
                  children: "Total Distributions"
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 text-sm font-bold text-green-600 text-right",
                  children: formatCurrency(totalDistributed)
                }), /* @__PURE__ */ jsxs("td", {
                  className: "px-6 py-4 text-sm font-bold text-gray-900 text-right",
                  children: [totalReturnPercent.toFixed(2), "%"]
                }), /* @__PURE__ */ jsx("td", {})]
              })
            })]
          })
        })]
      })]
    })
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: sponsor_$sponsorId_deals_$dealId,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-C40HxdJw.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/index-CCClZibW.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-C3_d9WbL.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/index-CCClZibW.js"], "css": ["/assets/root-Da3Y5bwq.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-BqSrIdac.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/createLucideIcon-k463m4iz.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/dashboard": { "id": "routes/dashboard", "parentId": "root", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/dashboard-CLEPOWop.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/index-CCClZibW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/investment.$id": { "id": "routes/investment.$id", "parentId": "root", "path": "investment/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/investment._id-DHZkibPt.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/index-CCClZibW.js", "/assets/arrow-left-VVTAgrpH.js", "/assets/dollar-sign-D6S9qB7J.js", "/assets/trending-up-DmoKmttM.js", "/assets/createLucideIcon-k463m4iz.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/investment.$id.due-diligence": { "id": "routes/investment.$id.due-diligence", "parentId": "root", "path": "investment/:id/due-diligence", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/investment._id.due-diligence-C0oNpjsi.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/dollar-sign-D6S9qB7J.js", "/assets/trending-up-DmoKmttM.js", "/assets/phone-Bv6Qsl2A.js", "/assets/createLucideIcon-k463m4iz.js", "/assets/arrow-left-VVTAgrpH.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/sponsor.$sponsorId.deals": { "id": "routes/sponsor.$sponsorId.deals", "parentId": "root", "path": "sponsor/:sponsorId/deals", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/sponsor._sponsorId.deals-CLzpTy5P.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/phone-Bv6Qsl2A.js", "/assets/dollar-sign-D6S9qB7J.js", "/assets/external-link-Da9Af5fC.js", "/assets/createLucideIcon-k463m4iz.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/sponsor.$sponsorId.deals.$dealId": { "id": "routes/sponsor.$sponsorId.deals.$dealId", "parentId": "root", "path": "sponsor/:sponsorId/deals/:dealId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/sponsor._sponsorId.deals._dealId-Dub9FlEM.js", "imports": ["/assets/chunk-OIYGIGL5-Czuf_mdf.js", "/assets/arrow-left-VVTAgrpH.js", "/assets/external-link-Da9Af5fC.js", "/assets/createLucideIcon-k463m4iz.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-40979228.js", "version": "40979228", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/dashboard": {
    id: "routes/dashboard",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/investment.$id": {
    id: "routes/investment.$id",
    parentId: "root",
    path: "investment/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/investment.$id.due-diligence": {
    id: "routes/investment.$id.due-diligence",
    parentId: "root",
    path: "investment/:id/due-diligence",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/sponsor.$sponsorId.deals": {
    id: "routes/sponsor.$sponsorId.deals",
    parentId: "root",
    path: "sponsor/:sponsorId/deals",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/sponsor.$sponsorId.deals.$dealId": {
    id: "routes/sponsor.$sponsorId.deals.$dealId",
    parentId: "root",
    path: "sponsor/:sponsorId/deals/:dealId",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
