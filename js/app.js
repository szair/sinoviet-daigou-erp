// ⚡ 核心全局配置：指向你绑定的自定义 API 域名
window.API_BASE_URL = "https://buyapi.imokla.ccwu.cc";

window.ERP_STORE = {
    system_rate: 3450, 
    currency_fee: 5,   
    filter_status: null,
    current_lang: "zh",
    
    // 全局共享数据集
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

// ⚡ 核心对接：从 D1 数据库拉取全量订单和客户数据
window.fetchGlobalDataFromD1 = async function() {
    try {
        const custRes = await fetch(`${window.API_BASE_URL}/api/customers`);
        if (custRes.ok) window.ERP_STORE.customers = await custRes.json();

        const orderRes = await fetch(`${window.API_BASE_URL}/api/orders`);
        if (orderRes.ok) window.ERP_STORE.orders = await orderRes.json();
    } catch (err) {
        console.error("D1 数据库连接或读取失败，请检查 API 域名或跨域设置:", err);
    }
};

// ==========================================
// 🔐 核心防盗：全自动网页端登录拦截控制中心
// ==========================================
window.checkSystemAuth = function() {
    // 检查 sessionStorage 是否存在合法的登录标记
    if (sessionStorage.getItem("is_logged_in") === "true") {
        return true; // 已登录，直接放行
    }

    // 未登录，动态向页面注入高保真毛玻璃登录拦截面板
    const loginOverlayHTML = `
        <div id="login-overlay" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn">
            <div class="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center m-4">
                <div class="w-14 h-14 bg-gradient-to-br from-indigo-600 to-amber-500 text-white mx-auto rounded-2xl flex items-center justify-center text-lg font-black shadow-lg mb-4 tracking-wider">
                    CN 🇻🇳 VN
                </div>
                <h2 class="text-base font-black text-slate-800 tracking-wide">中越通跨境代购 ERP</h2>
                <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 mb-6">Security Access Control</p>
                
                <div id="login-error-tip" class="hidden mb-4 bg-rose-50 text-rose-600 border border-rose-100 p-2.5 rounded-xl text-xs font-bold text-left animate-fadeIn">
                    ✕ 账号或密码错误，请重新输入
                </div>

                <form id="system-login-form" class="space-y-3.5 text-xs text-left font-semibold text-slate-600">
                    <div>
                        <label class="block text-slate-400 mb-1">运营账号 (Username)</label>
                        <input type="text" id="login-user" required placeholder="输入配置的环境变量账号" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-slate-400 mb-1">访问密码 (Password)</label>
                        <input type="password" id="login-pass" required placeholder="输入安全校验密码" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                    </div>
                    <button type="submit" id="btn-login-submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black shadow-md transition-all duration-200 mt-2 flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-shield-halved"></i> 验证凭证并解锁系统
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginOverlayHTML);

    // 监听登录表单提交事件
    document.getElementById("system-login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const username = document.getElementById("login-user").value.trim();
        const password = document.getElementById("login-pass").value.trim();
        const errorTip = document.getElementById("login-error-tip");
        const submitBtn = document.getElementById("btn-login-submit");

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> 正在安全验证...`;
        if (errorTip) errorTip.classList.add("hidden");

        try {
            // 🔒 异步将用户输入的账密发给你刚才绑定的 API 域名进行安全比对
            const response = await fetch(`${window.API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // 校验成功！在用户的浏览器会话中写入标记，使用 sessionStorage 确保关掉网页即自动失效
                sessionStorage.setItem("is_logged_in", "true");
                
                // 移除遮罩层
                document.getElementById("login-overlay").remove();
                
                // 放行！立刻去抓取 D1 云端数据并绘制系统
                await window.fetchGlobalDataFromD1();
                window.renderGlobalSkeleton();
            } else {
                throw new Error();
            }
        } catch (err) {
            // 校验失败逻辑
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> 验证凭证并解锁系统`;
            if (errorTip) errorTip.classList.remove("hidden");
        }
    });

    return false; // 拦截，不继续向下执行数据载入
};

// ==========================================
// 🚀 全栈系统启动入口
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    // 优先执行防盗拦截检查
    if (window.checkSystemAuth()) {
        // 如果已经登录过，无缝放行：拉取数据库并渲染
        await window.fetchGlobalDataFromD1();
        window.renderGlobalSkeleton(); 
    }
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
