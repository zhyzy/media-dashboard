import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { dataRoutes } from './data'
import { departmentRoutes } from './department'
import { accountRoutes } from './account'
import { workflowRoutes } from './workflow'

export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  dataRoutes,
  departmentRoutes,
  accountRoutes,
  workflowRoutes,
  systemRoutes,
]
