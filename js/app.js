// 全局状态管理中心
window.ERP_STORE = {
    system_rate: 3450, 
    currency_fee: 5,   
    filter_status: null, // ⚡ 核心追加：用于存储首页卡片点击后传递的过滤状态
    orders: [
        {
            id: "#ORD-78901",
            customer: "Tran Thi Mai (梅姐姐)",
            buyer_vnd: 4528125,
            items: [
                { platform: "淘宝", name: "潮流防晒衣 (亮黑色 M码)", cny: 1250, track: "SF142345566", status: "集运仓已到货" }
            ]
        },
        {
            id: "#ORD-78902",
            customer: "Linh Long (阿龙)",
            buyer_vnd: 1550000,
            items: [
                { platform: "1688", name: "跨境数码配件大宗采购", cny: 400, track: "ZT9988112233", status: "跨境清关运输中" }
            ]
        },
        {
            id: "#ORD-78903",
            customer: "Tran Thi Mai (梅姐姐)",
            buyer_vnd: 2800000,
            items: [
                { platform: "拼多多", name: "加厚马丁靴", cny: 500, track: "", status: "等待国内发货" },
                { platform: "淘宝", name: "工装休闲裤", cny: 250, track: "YTO7788990", status: "集运仓已到货" }
            ]
        }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    const mainView = document.getElementById("main-view");
    const pageTitle = document.getElementById("page-title");
    const menuItems = document.querySelectorAll(".menu-item");

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

        menuItems.forEach(item => {
            if (item.getAttribute("data-target") === viewKey) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        pageTitle.innerText = currentRoute.title;
        mainView.innerHTML = `<div class="view-section">${currentRoute.render()}</div>`;

        if (typeof currentRoute.init === "function") {
            currentRoute.init();
        }
    }

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            // 每次手动切换侧边栏菜单时，清空首页传过来的联动过滤状态
            if (item.getAttribute("data-target") === "orders") {
                window.ERP_STORE.filter_status = null;
            }
            const target = item.getAttribute("data-target");
            window.location.hash = target;
        });
    });

    window.addEventListener("hashchange", () => router(window.location.hash));
    router(window.location.hash);
});
