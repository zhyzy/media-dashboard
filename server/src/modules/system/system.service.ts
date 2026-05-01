import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {
    this.initDefaultRoles();
  }

  private async initDefaultRoles() {
    const count = await this.roleRepository.count();
    if (count === 0) {
      await this.roleRepository.save([
        { roleName: '超级管理员', roleCode: 'R_SUPER', description: '拥有系统全部权限', enabled: true },
        { roleName: '管理员', roleCode: 'R_ADMIN', description: '拥有大部分管理权限', enabled: true },
        { roleName: '普通用户', roleCode: 'R_USER', description: '基础数据查看和录入权限', enabled: true },
        { roleName: '数据录入员', roleCode: 'R_DATA_ENTRY', description: '仅数据录入权限', enabled: true },
      ]);
    }
  }

  async getUserList(params: {
    current?: number;
    size?: number;
    userName?: string;
    userGender?: string;
    userPhone?: string;
    userEmail?: string;
    status?: string;
  }) {
    const current = params.current || 1;
    const size = params.size || 20;

    const qb = this.userRepository.createQueryBuilder('u');

    if (params.userName) {
      qb.andWhere('u.username LIKE :userName', { userName: `%${params.userName}%` });
    }
    if (params.userPhone) {
      qb.andWhere('u.real_name LIKE :userPhone', { userPhone: `%${params.userPhone}%` });
    }
    if (params.status !== undefined && params.status !== '') {
      const isActive = params.status === '1';
      qb.andWhere('u.is_active = :isActive', { isActive });
    }

    qb.orderBy('u.create_time', 'DESC');

    const total = await qb.getCount();
    const users = await qb
      .skip((current - 1) * size)
      .take(size)
      .getMany();

    const records = users.map((u) => ({
      id: u.id,
      avatar: '',
      status: u.isActive ? '1' : '2',
      userName: u.username,
      userGender: '',
      nickName: u.realName,
      userPhone: '',
      userEmail: '',
      userRoles: [u.role],
      createBy: '',
      createTime: u.createTime ? new Date(u.createTime).toLocaleString('zh-CN') : '',
      updateBy: '',
      updateTime: u.updateTime ? new Date(u.updateTime).toLocaleString('zh-CN') : '',
    }));

    return { records, current, size, total };
  }

  async getRoleList(params: {
    current?: number;
    size?: number;
    roleName?: string;
    roleCode?: string;
  }) {
    const current = params.current || 1;
    const size = params.size || 20;

    const qb = this.roleRepository.createQueryBuilder('r');

    if (params.roleName) {
      qb.andWhere('r.role_name LIKE :roleName', { roleName: `%${params.roleName}%` });
    }
    if (params.roleCode) {
      qb.andWhere('r.role_code LIKE :roleCode', { roleCode: `%${params.roleCode}%` });
    }

    qb.orderBy('r.create_time', 'DESC');

    const total = await qb.getCount();
    const roles = await qb
      .skip((current - 1) * size)
      .take(size)
      .getMany();

    const records = roles.map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      roleCode: r.roleCode,
      description: r.description,
      enabled: r.enabled,
      createTime: r.createTime ? new Date(r.createTime).toLocaleString('zh-CN') : '',
    }));

    return { records, current, size, total };
  }

  getMenuList() {
    return [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: '/index/index',
        meta: {
          title: '仪表盘',
          icon: 'ri:pie-chart-line',
          roles: ['R_SUPER', 'R_ADMIN'],
        },
        children: [
          {
            path: 'console',
            name: 'Console',
            component: '/dashboard/console',
            meta: {
              title: '控制台',
              icon: 'ri:home-smile-2-line',
              keepAlive: false,
              fixedTab: true,
            },
          },
        ],
      },
      {
        path: '/data',
        name: 'Data',
        component: '/index/index',
        meta: {
          title: '数据管理',
          icon: 'ri:bar-chart-2-line',
          roles: ['R_SUPER', 'R_ADMIN'],
        },
        children: [
          {
            path: 'douyin',
            name: 'DouyinData',
            component: '/data/douyin/index',
            meta: { title: '抖音数据', icon: 'ri:music-2-line', keepAlive: false },
          },
          {
            path: 'kuaishou',
            name: 'KuaishouData',
            component: '/data/kuaishou/index',
            meta: { title: '快手数据', icon: 'ri:video-line', keepAlive: false },
          },
          {
            path: 'video-account',
            name: 'VideoAccountData',
            component: '/data/video-account/index',
            meta: { title: '视频号数据', icon: 'ri:vidicon-line', keepAlive: false },
          },
          {
            path: 'live',
            name: 'LiveData',
            component: '/data/live/index',
            meta: { title: '直播数据', icon: 'ri:live-line', keepAlive: false },
          },
          {
            path: 'media',
            name: 'MediaData',
            component: '/data/media/index',
            meta: { title: '自媒体数据', icon: 'ri:article-line', keepAlive: false },
          },
          {
            path: 'dataease',
            name: 'DataeaseConfig',
            component: '/data/dataease/index',
            meta: { title: '数据源管理', icon: 'ri:database-2-line', keepAlive: false },
          },
        ],
      },
      {
        path: '/department',
        name: 'Department',
        component: '/index/index',
        meta: {
          title: '部门管理',
          icon: 'ri:team-line',
          roles: ['R_SUPER', 'R_ADMIN'],
        },
        children: [
          {
            path: 'staff',
            name: 'Staff',
            component: '/department/staff/index',
            meta: { title: '人员管理', icon: 'ri:user-line', keepAlive: false },
          },
          {
            path: 'expense',
            name: 'Expense',
            component: '/department/expense/index',
            meta: { title: '费用管理', icon: 'ri:money-cny-circle-line', keepAlive: false },
          },
        ],
      },
      {
        path: '/account',
        name: 'Account',
        component: '/index/index',
        meta: {
          title: '账户管理',
          icon: 'ri:shield-user-line',
          roles: ['R_SUPER', 'R_ADMIN'],
        },
        children: [
          {
            path: 'sub-accounts',
            name: 'SubAccounts',
            component: '/account/sub-accounts/index',
            meta: { title: '子账户管理', icon: 'ri-user-settings-line', keepAlive: false },
          },
        ],
      },
      {
        path: '/workflow',
        name: 'Workflow',
        component: '/index/index',
        meta: {
          title: '工作流',
          icon: 'ri:flow-chart',
          roles: ['R_SUPER', 'R_ADMIN'],
        },
        children: [
          {
            path: 'overview',
            name: 'WorkflowOverview',
            component: '/workflow/overview/index',
            meta: { title: '工作流概览', icon: 'ri:dashboard-line', keepAlive: false },
          },
          {
            path: 'script',
            name: 'Script',
            component: '/workflow/script/index',
            meta: { title: '剧本管理', icon: 'ri:file-text-line', keepAlive: false },
          },
          {
            path: 'shooting',
            name: 'Shooting',
            component: '/workflow/shooting/index',
            meta: { title: '拍摄管理', icon: 'ri:camera-line', keepAlive: false },
          },
          {
            path: 'publish',
            name: 'Publish',
            component: '/workflow/publish/index',
            meta: { title: '发布管理', icon: 'ri:send-plane-line', keepAlive: false },
          },
        ],
      },
      {
        path: '/system',
        name: 'System',
        component: '/index/index',
        meta: {
          title: '系统管理',
          icon: 'ri:settings-3-line',
          roles: ['R_SUPER', 'R_ADMIN'],
        },
        children: [
          {
            path: 'user',
            name: 'User',
            component: '/system/user',
            meta: { title: '用户管理', icon: 'ri:user-line', keepAlive: true, roles: ['R_SUPER', 'R_ADMIN'] },
          },
          {
            path: 'role',
            name: 'Role',
            component: '/system/role',
            meta: { title: '角色管理', icon: 'ri:user-settings-line', keepAlive: true, roles: ['R_SUPER'] },
          },
          {
            path: 'menu',
            name: 'Menus',
            component: '/system/menu',
            meta: { title: '菜单管理', icon: 'ri:menu-line', keepAlive: true, roles: ['R_SUPER'] },
          },
        ],
      },
    ];
  }
}
