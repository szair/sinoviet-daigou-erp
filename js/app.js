// 全局状态管理中心，供各个模块读取
window.ERP_STORE = {
    system_rate: 3450, // 初始系统默认汇率 1 CNY = 3450 VND
    currency_fee: 5,   // 默认代购手续费 5%
    orders: [
        { id: "#ORD-78901", customer: "Tran Thi Mai", desc: "淘宝代购（美妆/服饰）", status: "已国内签收", cny: 1250, vtrack: "广州仓 ➔ 凭祥" },
        { id: "#ORD-78902", customer: "Tran Thi Mai", desc: "淘宝代购（美妆/服饰）", status: "已国内签收", cny: 1250, vtrack: "广州仓 ➔ 凭祥" },
        { id: "#ORD-78903", customer: "Tran Thi Mai", desc: "淘宝代购（美妆/服饰）", status: "已国内签收", cny: 1250, vtrack: "广州仓 ➔ 凭祥" },
        { id: "#ORD-78904", customer: "Tran Thi Mai", desc: "淘宝代购（美妆/服饰）", status: "已国内签收", cny: 1250, vtrack: "广州仓 ➔ 凭祥" },
        { id: "#ORD-78905", customer: "Tran Thi Mai", desc: "淘宝代购（美妆/服饰）", status: "已国内签收", cny: 1250, vtrack: "广州仓 ➔ 凭祥" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    const mainView = document.getElementById("main-view");
    const pageTitle = document.getElementById("page-title");
    const menuItems = document.querySelectorAll(".menu-item");

    // 各个子模块路由配置表
    const routes = {
        dashboard: { title: "仪表盘 Dashboard", render: renderDashboard, init: init_dashboard },
        orders: { title: "订单管理 (CN ➔ VN)", render: renderOrders, init: init_orders },
        customers: { title: "中越客户管理 Customer Mgmt", render: renderCustomers, init: null },
        warehouse: { title: "包裹/跨境集运仓 Warehouse", render: renderWarehouse, init: init_warehouse },
        finance: { title: "财务管理 Finance Center", render: renderFinance, init: null },
        system: { title: "核心系统设置 Settings", render: renderSystem, init: init_system }
    };

    function router(targetHash) {
        const viewKey = targetHash.replace("#", "") || "dashboard";
        const currentRoute = routes[viewKey];
        if (!currentRoute) return;

        // 1. 更新左侧菜单高亮状态
        menuItems.forEach(item => {
            if (item.getAttribute("data-target") === viewKey) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        // 2. 更新右侧顶部标题
        pageTitle.innerText = currentRoute.title;

        // 3. 动态渲染模块 HTML，加入渐显包裹动画层
        mainView.innerHTML = `<div class="view-section">${currentRoute.render()}</div>`;

        // 4. 执行该模块独有的 DOM 动态交互监听绑定
        if (typeof currentRoute.init === "function") {
            currentRoute.init();
        }
    }

    // 绑定侧边栏点击跳转事件
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const target = item.getAttribute("data-target");
            window.location.hash = target;
        });
    });

    // 监听浏览器路由 Hash 的上下游前进与回退变动
    window.addEventListener("hashchange", () => router(window.location.hash));
    
    // 初始化首屏加载
    router(window.location.hash);
});

// 全局更新左侧底栏汇率显示辅助函数
window.updateSidebarRate = function(newRate) {
    window.ERP_STORE.system_rate = newRate;
    const disp = document.getElementById("sidebar-rate-display");
    if(disp) disp.innerText = `1 CNY = ${newRate.toLocaleString()} VND`;
};
