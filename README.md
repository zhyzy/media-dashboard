# 新媒体流量监测平台 v0.0.1

全平台新媒体数据可视化管理系统，支持抖音、快手、视频号、自媒体、直播等多平台数据录入、趋势分析与实时监控。

## 功能概览

- **控制台仪表盘**：全平台数据总览、柱状图/曲线图趋势分析、实时数据录入动态通知
- **数据管理**：抖音、快手、视频号、自媒体、直播五大平台数据的增删改查
- **数据趋势**：历史数据快照、按日聚合统计、图表实时同步
- **数据源管理**：API Key 生成与管理、接口在线测试、外部数据接入
- **系统管理**：用户管理、角色权限、菜单配置
- **工作流**：拍摄计划、脚本管理、发布管理

## 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式前端框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Element Plus | UI 组件库 |
| Tailwind CSS | 原子化 CSS |
| ECharts | 数据可视化图表 |
| Pinia | 状态管理 |
| Vue Router | 路由管理 |
| Axios | HTTP 请求 |

### 后端

| 技术 | 说明 |
|------|------|
| NestJS | Node.js 后端框架 |
| TypeORM | ORM 框架 |
| MySQL | 数据库 |
| JWT + Passport | 认证鉴权 |
| WebSocket | 实时通信 |
| class-validator | 数据校验 |

## 项目结构

```
├── art-design-pro-main/     # 前端项目
│   ├── src/
│   │   ├── api/             # API 接口定义
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 公共组件
│   │   ├── config/          # 项目配置
│   │   ├── hooks/           # 组合式函数
│   │   ├── router/          # 路由配置
│   │   ├── store/           # 状态管理
│   │   ├── utils/           # 工具函数
│   │   └── views/           # 页面视图
│   ├── .env.development     # 开发环境变量
│   ├── .env.production      # 生产环境变量
│   └── vite.config.ts       # Vite 配置
│
├── server/                  # 后端项目
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── dashboard/   # 仪表盘模块
│   │   │   ├── data-history/# 数据历史快照
│   │   │   ├── dataease/    # 数据源管理
│   │   │   ├── douyin/      # 抖音数据
│   │   │   ├── kuaishou/    # 快手数据
│   │   │   ├── video-account/# 视频号数据
│   │   │   ├── media/       # 自媒体数据
│   │   │   ├── live/        # 直播数据
│   │   │   ├── staff/       # 员工管理
│   │   │   ├── expense/     # 支出管理
│   │   │   ├── publish/     # 发布管理
│   │   │   ├── script/      # 脚本管理
│   │   │   ├── shooting/    # 拍摄管理
│   │   │   ├── system/      # 系统管理
│   │   │   └── gateway/     # WebSocket 网关
│   │   └── main.ts
│   └── .env                 # 环境变量
│
└── admin/                   # 简易管理后台（备用）
```

## 快速开始

### 环境要求

- Node.js >= 20.19.0
- pnpm >= 8.8.0
- MySQL >= 5.7
- Git

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
```

### 2. 后端配置与启动

```bash
cd server

# 安装依赖
npm install

# 配置数据库（修改 .env 文件）
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=你的密码
# DB_DATABASE=media_dashboard
# JWT_SECRET=你的密钥
# PORT=3000

# 启动开发服务器
npm run start:dev
```

首次启动时 TypeORM 会自动创建数据库表结构（synchronize: true）。

### 3. 前端配置与启动

```bash
cd art-design-pro-main

# 安装依赖
pnpm install

# 如果安装失败，尝试
pnpm install --ignore-scripts

# 启动开发服务器
pnpm dev
```

前端默认运行在 `http://localhost:3006`，API 请求通过 Vite 代理转发到后端 `http://localhost:3000`。

### 4. 初始化数据

后端启动后，可运行种子脚本初始化基础数据：

```bash
cd server
npm run seed
```

## 生产部署

### 后端构建

```bash
cd server
npm run build
npm run start:prod
```

### 前端构建

```bash
cd art-design-pro-main
pnpm build
```

构建产物在 `art-design-pro-main/dist` 目录，使用 Nginx 部署即可。

### Nginx 配置参考

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/media-dashboard/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 数据源 API

系统提供外部数据接入 API，通过 API Key 认证：

| 接口 | 路径 |
|------|------|
| 抖音数据 | `GET /api/dataease/datasource/douyin?api_key=xxx` |
| 快手数据 | `GET /api/dataease/datasource/kuaishou?api_key=xxx` |
| 视频号数据 | `GET /api/dataease/datasource/video-account?api_key=xxx` |
| 直播数据 | `GET /api/dataease/datasource/live?api_key=xxx` |
| 自媒体数据 | `GET /api/dataease/datasource/media?api_key=xxx` |
| 短视频合并 | `GET /api/dataease/datasource/short-video?api_key=xxx` |
| 汇总数据 | `GET /api/dataease/datasource/summary?api_key=xxx` |
| 全平台总览 | `GET /api/dataease/datasource/overview?api_key=xxx` |
| 全部数据 | `GET /api/dataease/datasource/all?api_key=xxx` |

也支持通过请求头传递：`x-api-key: your_api_key`

## 版本记录

### v0.0.1 (2026-05-01)

- 初始版本发布
- 支持抖音、快手、视频号、自媒体、直播五大平台数据管理
- 控制台数据可视化（柱状图、曲线图、总览卡片）
- 数据趋势历史快照与实时同步
- 数据源 API Key 管理与接口测试
- 用户认证与权限管理
- 数据录入动态通知

## License

MIT
