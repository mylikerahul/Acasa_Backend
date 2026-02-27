import * as UserModel from '../models/user/user.model.js';
import * as AdminMenuModel from '../models/admin/admin_menu.model.js';
import * as CitiesModel from '../models/cities/cities.model.js';
import * as ColumnActionModel from '../models/settings/column_action.model.js';
import * as AgencyModel from '../models/agency/agency.model.js';
import * as CompanyModel from '../models/company/company.model.js';
import * as BlogsModel from '../models/blogs/blogs.model.js';
import * as BlocksModel from '../models/blocks/blocks.model.js';
import * as AreasModel from '../models/areas/areas.model.js';
import * as ChatModel from '../models/chat/chat.model.js';
import * as CitiesDataModel from '../models/location/cities_data.model.js';
import * as CommunityModel from '../models/community/community.model.js';
import * as DevelopersModel from '../models/developers/developer.model.js';
import * as JobModel from '../models/jobs/jobs.model.js';
import * as PropertiesModel from '../models/properties/properties.model.js';
import * as ProjectsModel from '../models/projects/project.model.js';
import * as UnitsModel from '../models/units/units.model.js';
import * as ToursModel from '../models/tours/tours.model.js';
import * as EnquireModel from '../models/enquire/enquire.model.js';
import * as LeadsModel from '../models/leads/leads.model.js';
import * as DealsModel from '../models/deals/deals.model.js';
import * as TransactionsModel from '../models/transactions/transactions.model.js';
import * as ContactUsModel from '../models/contact_us/contact_us.model.js';
import * as CtaegoryModel from '../models/ctaegory/ctaegory.model.js';
import * as NoticesModel from '../models/notices/notices.models.js';
import * as TaskModel from '../models/task/task.model.js';
import * as ActivityModel from '../models/activity/activity.model.js';
import * as AnalyticsModel from '../models/analytics/analytics.models.js';
import * as SellModel from '../models/sell/sell.model.js';
import * as LifestyleModel from '../models/lifestyle/lifestyle.model.js';
import * as SavedPropertiesModel from '../models/savedProperties/savedProperties.model.js';
import * as SubscribeModel from '../models/subscribe/subscribe.model.js';


const safeInit = (model, functionName) => {
  if (model && typeof model[functionName] === 'function') {
    return model[functionName];
  }
  if (model && typeof model.init === 'function') {
    return model.init;
  }
  return async () => ({ success: true, message: 'Skipped - no init function' });
};

const SCHEMA_CONFIG = [
  {
    level: 1,
    name: 'Core Foundation Tables',
    description: 'Independent tables - no foreign key dependencies',
    tables: [
      {
        name: 'users',
        init: safeInit(UserModel, 'createUserTable'),
        critical: true,
        description: 'Application users and authentication'
      },
      {
        name: 'user_permission',
        init: safeInit(UserModel, 'createUserPermissionTable'),
        critical: true,
        description: 'User permissions'
      },
      {
        name: 'permission_individual',
        init: safeInit(UserModel, 'createPermissionIndividualTable'),
        critical: true,
        description: 'Individual permissions'
      },
      {
        name: 'users_documents',
        init: safeInit(UserModel, 'createUsersDocumentsTable'),
        critical: true,
        description: 'User documents'
      },
      {
        name: 'password_resets',
        init: safeInit(UserModel, 'createPasswordResetsTable'),
        critical: true,
        description: 'Password reset tokens'
      },
      {
        name: 'users_migration',
        init: safeInit(UserModel, 'runMigrations'),
        description: 'User table schema migrations'
      },
      {
        name: 'admin_menu',
        init: safeInit(AdminMenuModel, 'createAdminMenuTable'),
        description: 'CMS menu structure parent table'
      },
      {
        name: 'admin_menu_items',
        init: safeInit(AdminMenuModel, 'createAdminMenuItemTable'),
        description: 'CMS menu items'
      },
      {
        name: 'admin_submenu',
        init: safeInit(AdminMenuModel, 'createAdminSubmenuTable'),
        description: 'CMS submenu items'
      },
      {
        name: 'cities',
        init: safeInit(CitiesModel, 'createCitiesTable'),
        description: 'Cities master data'
      },
       {
        name: 'sell',
        init: safeInit(SellModel,'createSellTable'),
        description: 'Cities master data'
      },
      {
        name: 'deals',
        init: safeInit(DealsModel, 'createDealsTable'),
        description: 'Deals data'
      },
       {
        name: 'subscribe',
        init: safeInit(SubscribeModel, 'createSubscribeTable'),
        description: 'Subscribe'
      },
      {
        name: 'analytics',
        init: safeInit(AnalyticsModel, 'createAnalyticsTable'),
        description: 'Analytics data'
      },
      {
        name: 'ctaegory',
        init: safeInit(CtaegoryModel, 'createCtaegoryTable'),
        description: 'Category data'
      },
      {
        name: 'contact_us',
        init: safeInit(ContactUsModel, 'createContactUsTable'),
        description: 'Contact Us messages'
      },
      {
        name: 'notices',
        init: safeInit(NoticesModel, 'createNoticesTable'),
        description: 'Notices data'
      },
      {
        name: 'column_action',
        init: safeInit(ColumnActionModel, 'createColumnActionTable'),
        description: 'Dynamic column actions configuration'
      },
      {
        name: 'agency',
        init: safeInit(AgencyModel, 'createAgencyTable'),
        description: 'Real estate agencies'
      },
      {
        name: 'agents',
        init: safeInit(AgencyModel, 'createAgentTable'),
        description: 'Agents'
      },
      {
        name: 'lifestyle',
        init: safeInit(LifestyleModel, 'createLifestylesTable'),
        description: 'Lifestyle data'
      },
      {
        name: 'company',
        init: safeInit(CompanyModel, 'createCompanyTable'),
        description: 'Corporate entities'
      },
      {
        name: 'blogs',
        init: safeInit(BlogsModel, 'createBlogsTable'),
        description: 'Blog posts and articles'
      },
      {
        name: 'blocks',
        init: safeInit(BlocksModel, 'createBlocksTable'),
        description: 'Page blocks and content sections'
      },
      {
        name: 'areas',
        init: safeInit(AreasModel, 'createAreasTable'),
        description: 'Geographic areas'
      }
    ]
  },
  {
    level: 2,
    name: 'Primary Entity Tables',
    description: 'Main content tables depending on Level 1',
    tables: [
      {
        name: 'cities_data',
        init: safeInit(CitiesDataModel, 'createCitiesDataTable'),
        description: 'Extended city information'
      },
      {
        name: 'community_tables',
        init: safeInit(CommunityModel, 'createCommunityTables'),
        critical: true,
        description: 'Community, sub-community, community_data, sub_community_data tables'
      },
      {
        name: 'tasks',
        init: safeInit(TaskModel, 'createTasksTable'),
        description: 'Tasks data'
      },
      {
        name: 'developers',
        init: safeInit(DevelopersModel, 'createDeveloperTable'),
        description: 'Developer records'
      },
      {
        name: 'jobs',
        init: safeInit(JobModel, 'createJobsTable'),
        description: 'Job applications'
      }
    ]
  },
  {
    level: 3,
    name: 'Properties & Projects',
    description: 'Core real estate business entities',
    tables: [
      {
        name: 'properties',
        init: safeInit(PropertiesModel, 'createPropertyTables'),
        critical: true,
        description: 'Properties initialization'
      },
      {
        name: 'projects',
        init: safeInit(ProjectsModel, 'createProjectTables'),
        critical: true,
        description: 'Projects initialization'
      }
    ]
  },
  {
    level: 4,
    name: 'Operational & Dependent Tables',
    description: 'Tables depending on Users and Projects',
    tables: [
      {
        name: 'units',
        init: safeInit(UnitsModel, 'createUnitTable'),
        description: 'Individual units within projects'
      },
      {
        name: 'tours',
        init: safeInit(ToursModel, 'createTourTable'),
        description: 'Property tour appointments'
      },
      {
        name: 'recent_activity',
        init: safeInit(ActivityModel, 'createRecentActivityTable'),
        description: 'Recent activity logs'
      },
      {
        name: 'enquire',
        init: safeInit(EnquireModel, 'createEnquireTable'),
        description: 'Customer enquiries'
      },
      {
        name: 'leads',
        init: safeInit(LeadsModel, 'createLeadsTable'),
        description: 'Sales leads generated'
      },
      {
        name: 'saved_properties',
        init: safeInit(SavedPropertiesModel, 'createSavedPropertyTable'),
        description: 'User saved properties and projects (wishlist)'
      }
    ]
  },
  {
    level: 5,
    name: 'Financial Tables',
    description: 'Transaction and payment records',
    tables: [
      {
        name: 'transactions',
        init: safeInit(TransactionsModel, 'createTransactionTable'),
        description: 'Financial transactions record'
      }
    ]
  },
  {
    level: 6,
    name: 'Chat Tables',
    description: 'Chat system tables - history, questions, answers',
    tables: [
      {
        name: 'chat_tables',
        init: safeInit(ChatModel, 'createChatTables'),
        critical: true,
        description: 'Chat history, questions and answers tables'
      }
    ]
  }
];

export const initializeModels = async ({
  silent = false,
  stopOnError = false,
  levels = null
} = {}) => {
  const startTime = Date.now();
  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    duration: 0
  };

  try {
    const levelsToProcess = levels
      ? SCHEMA_CONFIG.filter(l => levels.includes(l.level))
      : SCHEMA_CONFIG;

    for (const level of levelsToProcess) {
      for (const table of level.tables) {
        stats.total++;

        try {
          if (typeof table.init === 'function') {
            await table.init();
            stats.success++;
          } else {
            stats.skipped++;
          }
        } catch (err) {
          stats.failed++;
          stats.errors.push({ table: table.name, error: err.message });

          if (table.critical && stopOnError) {
            throw new Error(`Critical table "${table.name}" failed`);
          }
        }
      }
    }

    stats.duration = Date.now() - startTime;

    return stats;

  } catch (err) {
    stats.duration = Date.now() - startTime;
    throw err;
  }
};

export const validateSchema = () => {
  const issues = [];

  SCHEMA_CONFIG.forEach(level => {
    level.tables.forEach(table => {
      if (typeof table.init !== 'function') {
        issues.push({ level: level.level, table: table.name, issue: 'Init function missing' });
      }
    });
  });

  if (issues.length === 0) {
    return { valid: true };
  }

  return { valid: false, issues };
};

export default initializeModels;