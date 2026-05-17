你可以直接鼠标滑到下方代码框的右上角，点击 “复制 (Copy)” 按钮，然后在你电脑桌面新建一个文本文档，把内容粘进去，再把文件名重命名为 README.md 就大功告成了！

Markdown

# 🇻🇳🇨🇳 中越通跨境代购 ERP 运营系统 (Sino-Viet Express ERP)

一款专为**中越跨国代购、货代及自媒体内容创作者**量身定制的轻量级、高性能全栈 ERP 运营系统。采用纯正的
**H5移动端卡片化大字流布局**，完美契合大拇指单手高频盲操触控，支持中越双语无刷新热重绘切换。

### ⚡ 核心亮点

- **零成本全栈架构**：前端托管于 GitHub Pages，后端及数据库跑在 Cloudflare 边缘计算集群，完全免去服务器租用及维护成本。
- **极速流畅响应**：基于 Cloudflare D1 关系型数据库，前后端毫秒级高并发握手。
- **高安全性防盗锁**：前置磨砂玻璃会话级鉴权拦截墙，关键操作（如物理删单）内置手动输尾号的二次高阻断防误删安全锁。
- **国际化架构**：全系统一键无缝热重绘切换 **中文 / Tiếng Việt**，数据字段彻底清洗，拒绝 `undefined` 乱码。

---

## 🛠️ 项目技术栈

- **前端 (Frontend)**: HTML5 + Tailwind CSS (CDN) + FontAwesome 图标库 + Vanilla JS (模块化原生生命周期钩子)
- **后端 (Backend)**: Cloudflare Workers (高性能路由分发总控)
- **数据库 (Database)**: Cloudflare D1 (关系型 SQLite 边缘数据库集群)

---

## 📂 数据库初始化代码 (Cloudflare D1 SQL)

在部署系统前，请先前往 Cloudflare Dashboard 创一个 **D1 Database**，并在其 **Console (控制台)** 中一次性复制并执行以下
SQL语句，以建立核心的关系型数据表结构：

```sql
-- 1. 创建越南买家档案表    
CREATE TABLE IF NOT EXISTS customers (    
    id TEXT PRIMARY KEY,          -- 唯一识别ID (如 CUST-1001)    
    name TEXT NOT NULL,           -- 买家姓名 / 微信昵称    
    social TEXT DEFAULT '未登记',  -- 社交账号 (微信/Zalo)    
    phone TEXT NOT NULL,          -- 越南本土联系电话    
    address TEXT NOT NULL         -- 越南本土完整收货地址    
);    
    
-- 2. 创建合并代购订单表    
CREATE TABLE IF NOT EXISTS orders (    
    id TEXT PRIMARY KEY,          -- 订单合并ID (如 #ORD-40607)    
    customer TEXT NOT NULL,       -- 关联买家姓名    
    buyer_vnd INTEGER DEFAULT 0,  -- 收取买家的固定越南盾货款    
    shipping_fee_cny REAL DEFAULT 0, -- 跨境国际运费 (CNY)    
    items TEXT,                   -- 商品明细清单 (在D1中以扁平化 JSON 字符串存储)    
    status TEXT DEFAULT '等待国内发货' -- 整单生命周期状态标签    
);    
    
-- 3. 索引优化 (加速大盘高频模糊搜索检索)    
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer);    
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);  
```

🚀 5分钟全栈极速部署指南  
第一步：克隆并托管前端代码 (GitHub Pages)  
将本项目的所有前端源码上传到你的 GitHub 仓库。

确保项目根目录包含以下标准的 H5 模块化文件目录：

Plaintext

├── index.html          # 极简吸顶顶栏、吸底金刚操控台总外壳  
├── style.css           # 基础全局样式及动效  
├── js/  
│   ├── app.js          # 全局总控调度中心 (安全鉴权、数据洗涤、热重绘)  
│   ├── dashboard.js    # 仪表盘大盘模块
(含指标下钻、人民币兑越南盾换算器)  
│   ├── orders.js       # 订单管理模块
(含新建、深度修改、软取消、硬粉碎)  
│   ├── customers.js    # 客户管理模块 (含一键复制打单文本、热修改弹窗)

> 
> │   └── ...             # 其他辅助业务子模块  

> 前往仓库的 Settings -> Pages，将 Build and deployment 的 Source 设置为 Deploy from a branch，分支选择 main (或 master) 并保存。
> 

稍等 1 分钟，GitHub 会为你吐出一个专属的前端访问链接 (如 [https://yourname.github.io/repo/](https://yourname.github.io/repo/))。

第二步：部署边缘总控后端 (Cloudflare Workers)  
登录 Cloudflare Dashboard，点击左侧菜单的 Workers & Pages -> Create Application -> Create Worker。

命名你的 Workers 项目（例如 buyapi），点击 Deploy。

点击 Quick Edit (快速编辑)，将项目后端的 index.js 全量源码完整覆盖进去，点击右上角的 Save and Deploy (保存并部署)。

第三步：绑定 D1 数据库与安全防盗锁 (关键步骤)  
回到刚才创建的 Cloudflare Worker 主页面，切换到 Settings (设置) 选项卡。

绑定 D1 关系型数据库：

滚动到 Variables (变量) 区域，找到 D1 database bindings。

点击 Add binding。

Variable name (变量名称) 必须严格填写：DB（大写，代码正在呼叫此硬件）。

D1 database 选择你刚才创建并初始化了 SQL 的那个数据库。

配制安全防盗锁密码：

在同一个页面找到 Environment Variables (环境变量) 区域。

点击 Add variable，添加以下两个高强度加密秘密变量：

ADMIN_USER : 设置你登录 ERP 系统的管理员账号 (例如 imaide5)。

ADMIN_PASS : 设置你解锁磨砂玻璃拦截墙的后台密码。

点击 Save and Deploy 重新触发生效。

第四步：前后端双向完美对齐  
回到 Workers 页面顶部，复制 Cloudflare 为你分配的后端 API 域名 (例如 [https://buyapi.xxxx.workers.dev](https://buyapi.xxxx.workers.dev))，或者你绑定的自定义路由 https:///api.ila.c.cc。

打开前端项目中的 js/app.js，在文件最顶部找到变量 window.API_BASE_URL，将其值修改为你的真实后端 API 地址：

JavaScript

window.API_BASE_URL = "[https://api.ila.c.cc](https:///api.ila.c.cc)"; // 换成你的真实后端域名  
提交修改并推送到 GitHub。

📱 移动端高频运营使用小贴士  
首次登录防转圈提示：  
由于前端对云端数据有高强度的本地安全缓存策略，当你在前后端代码首次覆盖上线时，请在手机端彻底杀掉浏览器/微信/Zalo后台进程，或者直接开启无痕浏览模式访问前端链接，即可完美瞬间破开圈圈、畅通无阻。

极速一键打单复制：  
在「客户管理」模块中，单手大拇指轻触名片底部的「一键复制完整寄件打单文本」，系统会自动在系统剪贴板中组装出符合越南本土货代、Viettel Post、GHTK 100% 兼容的规范文本：

Plaintext

Người nhận: Linh Long (阿龙)  
SĐT: 0988776655  
Địa chỉ: 123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM  
优雅的客户退单处理：  
当代购买家发生整单不要、退单时，点击「管理此单」->「客户整单取消」，该订单会优雅变灰并自动被洗入右上角的「已取消」灰色胶囊隔离区，大盘财务流水会自动扣除该笔款项为 0，还你一个绝对纯净且对账精准的控盘作业区。

 
