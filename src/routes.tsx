import { RouteObject } from 'react-router-dom';
import Root from './Root';
import ErrorBoundary from './components/ErrorBoundary';
import Home, { loader as homeLoader } from './routes/home';
import Dashboard from './routes/dashboard';
import InvestmentDetail, { loader as investmentLoader } from './routes/investment.$id';
import DueDiligence, { loader as dueDiligenceLoader } from './routes/investment.$id.due-diligence';
import SponsorDeals, { loader as sponsorDealsLoader } from './routes/sponsor.$sponsorId.deals';
import DealPayouts, { loader as dealPayoutsLoader } from './routes/sponsor.$sponsorId.deals.$dealId';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'investment/:id',
        element: <InvestmentDetail />,
        loader: investmentLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'investment/:id/due-diligence',
        element: <DueDiligence />,
        loader: dueDiligenceLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'sponsor/:sponsorId/deals',
        element: <SponsorDeals />,
        loader: sponsorDealsLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'sponsor/:sponsorId/deals/:dealId',
        element: <DealPayouts />,
        loader: dealPayoutsLoader,
        errorElement: <ErrorBoundary />,
      },
    ],
  },
];

export default routes;
