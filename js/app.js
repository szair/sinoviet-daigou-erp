// ⚡ 核心全局配置：指向你刚刚绑定的 Cloudflare Workers 真实域名
window.API_BASE_URL = "https://buyapi.imokla.ccwu.cc";

window.ERP_STORE = {
    system_rate: 3450, 
    currency_fee: 5,   
    filter_status: null,
    current_lang: "zh",
    
    // 全局共享数据集（初始化为空，全量从 D1 数据库拉取）
    customers: [],
    orders: [],
    
    // 🌍 多语言翻译包
    i18n: {
        zh: {
            menu_dash: "仪表盘 Dashboard",
            menu_orders: "订单管理 Order Mgmt",
            menu_cust: "客户管理 Customer Mgmt",
            menu_wh: "包裹/集运仓 Warehouse",
            menu_finance: "财务管理 Finance",
            menu_settings: "系统设置 Settings",
            role_admin: "管理员 (越南线)",
            lang_label: "切换全系统语言"
        },
        vi: {
            menu_dash: "Bảng điều khiển Dashboard",
            menu_orders: "Quản lý đơn hàng Order Mgmt",
            menu_cust: "Quản lý khách hàng Cust Mgmt",
            menu_wh: "Quản lý kho hàng Warehouse",
            menu_finance: "Quản lý tài chính Finance",
            menu_settings: "Cài đặt hệ thống Settings",
            role_admin: "Quản trị viên (Tuyến VN)",
            lang_label: "Thay đổi ngôn ngữ hệ thống"
        }
    }
};

window.getText = function(key) {
    const lang = window.ERP_STORE.current_lang;
    return window.ERP_STORE.i18n[lang][key] || key;
};

// ⚡ 核心对接：全自动从 D1 数据库拉取全量订单和客户数据
window.fetchGlobalDataFromD1 = async function() {
    try {
        // 同步拉取客户档案
        const custRes = await fetch(`${window.API_BASE_URL}/api/customers`);
        if (custRes.ok) window.ERP_STORE.customers = await custRes.json();

        // 同步拉取核心订单
        const orderRes = await fetch(`${window.API_BASE_URL}/api/orders`);
        if (orderRes.ok) window.ERP_STORE.orders = await orderRes.json();
    } catch (err) {
        console.error("D1 数据库连接或读取失败，请检查 API 域名或跨域设置:", err);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    // 第一步：先去云端 D1 数据库把真实数据抓下来
    await window.fetchGlobalDataFromD1();
    // 第二步：渲染多语言整体框架骨架
    window.renderGlobalSkeleton(); 
});

window.renderGlobalSkeleton = function() {
    const sidebarMenu = document.getElementById("sidebar-menu");
    const userRoleText = document.querySelector(".text-slate-700");
    const mainView = document.getElementById("main-view");
    const pageTitle = document.getElementById("page-title");
    
    if(!sidebarMenu) return;

    sidebarMenu.innerHTML = `
        <a href="#dashboard" data-target="dashboard" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-chart-pie w-5 text-sm"></i> ${window.getText('menu_dash')}
        </a>
        <a href="#orders" data-target="orders" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-file-invoice-dollar w-5 text-sm"></i> ${window.getText('menu_orders')}
        </a>
        <a href="#customers" data-target="customers" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-users w-5 text-sm"></i> ${window.getText('menu_cust')}
        </a>
        <a href="#warehouse" data-target="warehouse" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-warehouse w-5 text-sm"></i> ${window.getText('menu_wh')}
        </a>
        <a href="#finance" data-target="finance" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-wallet w-5 text-sm"></i> ${window.getText('menu_finance')}
        </a>
        <a href="#system" data-target="system" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-gears w-5 text-sm"></i> ${window.getText('menu_settings')}
        </a>
    `;

    if(userRoleText) userRoleText.innerText = window.getText('role_admin');

    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            if (item.getAttribute("data-target") === "orders") { window.ERP_STORE.filter_status = null; }
            window.location.hash = item.getAttribute("data-target");
        });
    });

    const routes = {
        dashboard: { title: window.getText('menu_dash'), render: renderDashboard, init: init_dashboard },
        orders: { title: window.getText('menu_orders'), render: renderOrders, init: init_orders },
        customers: { title: window.getText('menu_cust'), render: renderCustomers, init: init_customers },
        warehouse: { title: window.getText('menu_wh'), render: renderWarehouse, init: init_warehouse },
        finance: { title: window.getText('menu_finance'), render: renderFinance, init: null },
        system: { title: window.getText('menu_settings'), render: renderSystem, init: init_system }
    };

    const viewKey = window.location.hash.replace("#", "") || "dashboard";
    const currentRoute = routes[viewKey];
    
    if (currentRoute) {
        menuItems.forEach(item => {
            if (item.getAttribute("data-target") === viewKey) item.classList.add("active");
            else item.classList.remove("active");
        });
        pageTitle.innerText = currentRoute.title;
        mainView.innerHTML = `<div class="view-section">${currentRoute.render()}</div>`;
        if (typeof currentRoute.init === "function") currentRoute.init();
    }
};

window.addEventListener("hashchange", () => window.renderGlobalSkeleton());
