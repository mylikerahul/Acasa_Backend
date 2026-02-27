import userRoutes from '../routes/users/user.routes.js';
import propertiesRoutes from '../routes/properties/properties.routes.js';
import projectsRoutes from '../routes/projects/project.routes.js';
import unitsRoutes from '../routes/units/units.routes.js';
import citiesRoutes from '../routes/cities/cities.routes.js';
import dealsRoutes from '../routes/deals/deals.routes.js';
import citiesDataRoutes from '../routes/location/cities_data.routes.js';
import areasRoutes from '../routes/areas/areas.routes.js';
import communityRoutes from '../routes/community/community.routes.js';
import adminMenuRoutes from '../routes/admin/admin_menu.routes.js';
import blogsRoutes from '../routes/blogs/blogs.routes.js';
import blocksRoutes from '../routes/blocks/blocks.routes.js';
import agencyRoutes from '../routes/agency/agency.routes.js';
import companyRoutes from '../routes/company/company.routes.js';
import developerRoutes from '../routes/developers/developer.routes.js';
import leadRoutes from '../routes/leads/leads.routes.js';
import enquireRoutes from '../routes/enquire/enquire.routes.js';
import tourRoutes from '../routes/tours/tours.routes.js';
import jobRoutes from '../routes/jobs/Jobs.routes.js';
import lifestyleRoutes from '../routes/lifestyle/lifestyle.routes.js';
import columnActionRoutes from '../routes/settings/column_action.routes.js';
import transactionRoutes from '../routes/transactions/transactions.routes.js';
import contactUsRoutes from '../routes/contact_us/contact_us.routes.js';
import webControlRoutes from '../routes/webcontrol/webcontrol.routes.js';
import facilitiesRoutes from '../routes/facilities/facilities.routes.js';
import categoryRoutes from '../routes/ctaegory/ctaegory.routes.js';
import noticesRoutes from '../routes/notices/notices.routes.js';
import taskRoutes from '../routes/task/task.routes.js';
import sellRoutes from '../routes/sell/sell.routes.js';
import activityRoutes from '../routes/activity/activity.routes.js';
import analyticsRoutes from '../routes/analytics/analytics.routes.js';
import savedPropertiesRoutes from '../routes/savedProperties/savedProperties.routes.js';
import chatRoutes from '../routes/chat/chat.routes.js';
import subscribeRoutes from '../routes/Subscribe/Subscribe.routes.js';


const DEFAULT_API_PREFIX = '/api/v1';

const ROUTES_CONFIG = [
  {
    name: 'User Management',
    routes: [
      { path: '/users', handler: userRoutes },
    ]
  },
  {
    name: 'Locations & Areas',
    routes: [
      { path: '/cities', handler: citiesRoutes },
      { path: '/cities-data', handler: citiesDataRoutes },
      { path: '/areas', handler: areasRoutes },
      { path: '/communities', handler: communityRoutes },
       { path: '/subscribe', handler: subscribeRoutes }
    ]
  },
  {
    name: 'Properties Management',
    routes: [
      { path: '/properties', handler: propertiesRoutes }
    ]
  },
  {
    name: 'Projects Management',
    routes: [
      { path: '/projects', handler: projectsRoutes },
      { path: '/units', handler: unitsRoutes }
    ]
  },
  {
    name: 'CMS & Content',
    routes: [
      { path: '/admin-menu', handler: adminMenuRoutes },
      { path: '/blogs', handler: blogsRoutes },
      { path: '/blocks', handler: blocksRoutes }
    ]
  },
  {
    name: 'Business Directory',
    routes: [
      { path: '/agencies', handler: agencyRoutes },
      { path: '/companies', handler: companyRoutes },
      { path: '/developers', handler: developerRoutes }
    ]
  },
  {
    name: 'Sales & CRM',
    routes: [
      { path: '/leads', handler: leadRoutes },
      { path: '/enquire', handler: enquireRoutes },
      { path: '/deals', handler: dealsRoutes },
      { path: '/tours', handler: tourRoutes }
    ]
  },
  {
    name: 'User Features',
    routes: [
      { path: '/saved-property', handler: savedPropertiesRoutes },
      { path: '/sell', handler:sellRoutes }

    ]
  },
  {
    name: 'HR & Operations',
    routes: [
      { path: '/jobs', handler: jobRoutes },
      { path: '/lifestyle', handler: lifestyleRoutes }
    ]
  },
  {
    name: 'Finance',
    routes: [
      { path: '/transactions', handler: transactionRoutes }
    ]
  },
  {
    name: 'System & Settings',
    routes: [
      { path: '/settings/column-actions', handler: columnActionRoutes }
    ]
  },
  {
    name: 'Communication',
    routes: [
      { path: '/chat', handler: chatRoutes }
    ]
  },
  {
    name: 'Additional Features',
    routes: [
      { path: '/webcontrol', handler: webControlRoutes },
      { path: '/analytics', handler: analyticsRoutes },
      { path: '/category', handler: categoryRoutes },
      { path: '/notices', handler: noticesRoutes },
      { path: '/tasks', handler: taskRoutes },
      { path: '/activity', handler: activityRoutes },
      { path: '/facilities', handler: facilitiesRoutes },
      { path: '/contact', handler: contactUsRoutes }
    ]
  }
];

export const initializeRoutes = (app, options = {}) => {
  if (!app) {
    throw new Error('Express app instance is required to initialize routes.');
  }

  const prefix = options.prefix || process.env.API_PREFIX || DEFAULT_API_PREFIX;
  const registeredPaths = new Set();
  const mountedRoutes = [];

  for (const group of ROUTES_CONFIG) {
    for (const route of group.routes) {
      if (!route.handler || (typeof route.handler !== 'function' && typeof route.handler !== 'object')) {
        throw new Error(
          `Route Initialization Failed: Handler for path "${route.path}" in group "${group.name}" is not a valid Express router/middleware.`
        );
      }

      const fullPath = `${prefix}${route.path}`;

      if (registeredPaths.has(fullPath)) {
        throw new Error(`Route Initialization Failed: Duplicate route path detected: "${fullPath}"`);
      }

      app.use(fullPath, route.handler);

      registeredPaths.add(fullPath);
      mountedRoutes.push(fullPath);
    }
  }

  return mountedRoutes;
};

export const getRoutesConfig = () => ROUTES_CONFIG;

export default initializeRoutes;