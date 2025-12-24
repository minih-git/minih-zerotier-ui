# 🌐 MiniH ZeroTier UI

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

一个基于 Next.js 开发的 **ZeroTier** 网络管理界面，旨在提供简洁、现代且高效的成员管理与监控体验。

## ✨ 核心特性

- 🚀 **响应式设计**：完美适配桌面与移动端，随时随地管理网络。
- 👥 **成员管理**：轻松查看、授权、拒绝或移除网络成员。
- 📊 **状态监控**：实时查看成员连接状态、IP 地址及最后活跃时间。
- 🔒 **安全认证**：集成用户登录验证，保障管理后台安全。
- 🎨 **极简视觉**：采用现代 UI 设计，提供流畅的交互体验。

## 🛠️ 技术栈

- **前端框架**: [Next.js](https://nextjs.org/) (App Router)
- **核心库**: React, Lucide Icons
- **存储方案**: Node-persist (轻量级本地存储)
- **样式**: CSS Modules (Vanilla CSS)
- **认证**: JWT / Custom Session Management

## 📂 项目结构

```text
src/
├── app/          # 路由与界面组件
├── components/   # 通用 UI 组件与图标
├── lib/          # API 交互、数据库逻辑及工具类
└── public/       # 静态资源
```

## 🚀 快速开始

### 1. 环境准备

确保您的本地环境已安装 [Node.js](https://nodejs.org/) (建议 18.x+)。

### 2. 获取代码并安装依赖

```bash
git clone https://github.com/minih-git/minih-zerotier-ui.git
cd minih-zerotier-ui
npm install
```

### 3. 配置环境变量

在根目录下创建 `.env.local` 文件，并配置您的 ZeroTier API Token：

```env
ZEROTIER_API_TOKEN=your_api_token_here
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

## 🚢 部署指南

查看详细的 [部署指南 (deployment.md)](./deployment.md) 了解如何通过 Docker 或手动方式进行生产环境部署。

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

---

由 **MiniH** 团队精心打造。
