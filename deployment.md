# 部署指南

本指南介绍如何使用 Docker 或通过 Node.js 手动部署 Next.js 应用程序。

## 前置条件

- **Docker：** (用于 Docker 部署) 确保已安装并运行 Docker。
- **Node.js：** (用于手动部署) Node.js 18.17 或更高版本。

## 方法 1：Docker 部署（推荐）

1. **构建 Docker 镜像**

    在项目根目录下运行以下命令：

    ```bash
    docker build -t next-ui-app .
    ```

2. **运行容器**

    启动容器并映射端口 3000：

    ```bash
    docker run -p 3000:3000 next-ui-app
    ```

    应用程序随后可以通过 `http://localhost:3000` 访问。

3. **环境变量**

    要传递环境变量（例如数据库凭据），请使用 `-e` 标志或 env 文件：

    ```bash
    docker run -p 3000:3000 -e DATABASE_URL="your_db_url" next-ui-app
    ```

## 方法 2：手动 Node.js 部署

1. **构建应用程序**

    ```bash
    npm ci
    npm run build
    ```

    这将创建一个专为生产环境优化的 `.next/standalone` 文件夹。

2. **运行服务器**

    将 `public` 和 `.next/static` 文件夹复制到 standalone 目录，以确保静态资源被正确服务：

    ```bash
    # (可选，但建议严格按照 standalone 模式使用时执行)
    cp -r public .next/standalone/public
    cp -r .next/static .next/standalone/.next/static
    ```

    启动服务器：

    ```bash
    node .next/standalone/server.js
    ```

    或者使用 PM2：

    ```bash
    pm2 start .next/standalone/server.js --name next-ui-app
    ```
