# <%= name %>

> 监控后台服务

## Preparation

确保已经安装了 `MySQL`

## Usage

初次启动，需要先初始化数据库

```bash
npm run prisma
```

初始化完成后即可启动服务

```bash
npm run dev
```

（确保 <%= mysql_port %> 端口未被占用）
