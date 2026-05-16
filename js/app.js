// ⚡ 核心全局配置：指向你绑定的自定义 API 域名
window.API_BASE_URL = "https://buyapi.imokla.ccwu.cc";

window.ERP_STORE = {
    system_rate: 3450, 
    currency_fee: 5,   
    filter_status: null,
    current_lang: "zh",
    
    customers: [],
    orders: [],
    
    i18n: {
        zh: {
            menu_dash: "大盘",
            menu_orders: "订单",
            menu_cust: "客户",
            menu_wh: "仓库",
            menu_finance: "财务",
            menu_settings: "设置",
            role_admin: "管理员 (越南线)",
            lang_label: "切换全系统语言"
        },
        vi: {
            menu_dash: "Tổng quan",
            menu_orders: "Đơn hàng",
            menu_cust: "Khách",
            menu_wh: "Kho",
            menu_finance: "Tài chính",
            menu_settings: "Cài đặt",
            role_admin: "Quản trị viên (Tuyến VN)",
            lang_label: "Thay đổi ngôn ngữ hệ thống"
        }
    }
};

window.getText = function(key) {
    const lang = window.ERP_STORE.current_lang;
    return window.ERP_STORE.i18n[lang][key] || key;
};

// 从 D1 数据库拉取全量订单和客户数据
window.fetchGlobalDataFromD1 = async function() {
    try {
        const custRes = await fetch(`${window.API_BASE_URL}/api/customers`);
        if (custRes.ok) window.ERP_STORE.customers = await custRes.json();

        const orderRes = await fetch(`${window.API_BASE_URL}/api/orders`);
        if (orderRes.ok) window.ERP_STORE.orders = await orderRes.json();
    } catch (err) {
        console.error("D1 数据库连接读取失败:", err);
    }
};

// ==========================================
// 🔐 核心防盗：全自动网页端登录拦截控制中心
// ==========================================
window.checkSystemAuth = function() {
    if (sessionStorage.getItem("is_logged_in") === "true") {
        return true; 
    }

    const loginOverlayHTML = `
        <div id="login-overlay" class="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-[99999] overflow-y-auto px-4">
            <div class="bg-white w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center my-auto">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-600 to-amber-500 text-white mx-auto rounded-xl flex items-center justify-center text-sm font-black shadow-lg mb-3 tracking-wider">
                    CN-VN
                </div>
                <h2 class="text-sm font-black text-slate-800 tracking-wide">中越通跨境代购 ERP</h2>
                <p class="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 mb-5">Security Access Control</p>
                
                <div id="login-error-tip" class="hidden mb-3 bg-rose-50 text-rose-600 border border-rose-100 p-2 rounded-xl text-[11px] font-bold text-left">
                    ✕ 账号或密码错误
                </div>

                <form id="system-login-form" class="space-y-3 text-left font-semibold text-slate-600 text-[11px]">
                    <div>
                        <label class="block text-slate-400 mb-0.5">运营账号 (Username)</label>
                        <input type="text" id="login-user" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-slate-400 mb-0.5">访问密码 (Password)</label>
                        <input type="password" id="login-pass" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none">
                    </div>
                    <button type="submit" id="btn-login-submit" class="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-black shadow-md mt-2 flex items-center justify-center gap-1.5 text-xs active:scale-[0.98] transition-all">
                        <i class="fa-solid fa-shield-halved"></i> 验证凭证并解锁系统
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginOverlayHTML);

    document.getElementById("system-login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-user").value.trim();
        const password = document.getElementById("login-pass").value.trim();
        const errorTip = document.getElementById("login-error-tip");
        const submitBtn = document.getElementById("btn-login-submit");

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> 正在验证...`;
        if (errorTip) errorTip.classList.add("hidden");

        try {
            const response = await fetch(`${window.API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                sessionStorage.setItem("is_logged_in", "true");
                document.getElementById("login-overlay").remove();
                await window.fetchGlobalDataFromD1();
                window.renderGlobalSkeleton();
            } else { throw new Error(); }
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> 验证凭证并解锁系统`;
            if (errorTip) errorTip.classList.remove("hidden");
        }
    });

    return false; 
};

// ==========================================
// 📱 核心新增：手机返回键/侧滑智能劫持与弹窗联动机制
// ==========================================

// 1. 每当任何业务模块「打开弹窗」时，必须要调用这个函数来向手机历史记录塞入一个虚拟盾牌
window.pushModalHistoryState = function(modalId) {
    // 塞入带有专属标记的当前状态，防止网页后退
    window.history.pushState({ modalActiveId: modalId }, "");
};

// 2. 监听全局手机返回键/浏览器后退手势 (popstate)
window.addEventListener("popstate", (event) => {
    // 抓取当前页面上所有可能存活的代购系统弹窗容器
    const orderModal = document.getElementById("order-modal");
    const custModal = document.getElementById("cust-modal");
    const manifestModal = document.getElementById("manifest-modal");

    // 智能拦截：如果发现有任意一个弹窗开着，立刻执行闭合，并阻断网页整体后退！
    if (orderModal || custModal || manifestModal) {
        if (orderModal) orderModal.remove();
        if (custModal) custModal.remove();
        if (manifestModal) manifestModal.remove();
        console.log("🛡️ 已成功拦截手机侧滑返回手势：弹窗已单手关闭，有效防止网页卡死退出。");
    }
});

// ==========================================
// 🚀 全栈系统启动入口
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    if (window.checkSystemAuth()) {
        await window.fetchGlobalDataFromD1();
        window.renderGlobalSkeleton(); 
    }
});

window.renderGlobalSkeleton = function() {
    const sidebarMenu = document.getElementById("sidebar-menu");
    const mobileBottomMenu = document.getElementById("mobile-bottom-menu");
    const userRoleText = document.querySelector(".text-slate-700");
    const mainView = document.getElementById("main-view");
    const pageTitle = document.getElementById("page-title");
    
    if(!sidebarMenu || !mobileBottomMenu) return;

    const menuItemsHTML = `
        <a href="#dashboard" data-target="dashboard" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-chart-pie w-5 text-sm"></i> ${window.getText('menu_dash')} Dashboard
        </a>
        <a href="#orders" data-target="orders" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-file-invoice-dollar w-5 text-sm"></i> ${window.getText('menu_orders')} Order Mgmt
        </a>
        <a href="#customers" data-target="customers" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-users w-5 text-sm"></i> ${window.getText('menu_cust')} Cust Mgmt
        </a>
        <a href="#warehouse" data-target="warehouse" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-warehouse w-5 text-sm"></i> ${window.getText('menu_wh')} Warehouse
        </a>
        <a href="#finance" data-target="finance" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-wallet w-5 text-sm"></i> ${window.getText('menu_finance')} Finance
        </a>
        <a href="#system" data-target="system" class="menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs font-semibold">
            <i class="fa-solid fa-gears w-5 text-sm"></i> ${window.getText('menu_settings')} Settings
        </a>
    `;
    sidebarMenu.innerHTML = menuItemsHTML;

    mobileBottomMenu.innerHTML = `
        <a href="#dashboard" data-target="dashboard" class="mobile-menu-item flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-bold transition-all">
            <i class="fa-solid fa-chart-pie text-base mb-0.5"></i><span>${window.getText('menu_dash')}</span>
        </a>
        <a href="#orders" data-target="orders" class="mobile-menu-item flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-bold transition-all">
            <i class="fa-solid fa-file-invoice-dollar text-base mb-0.5"></i><span>${window.getText('menu_orders')}</span>
        </a>
        <a href="#customers" data-target="customers" class="mobile-menu-item flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-bold transition-all">
            <i class="fa-solid fa-users text-base mb-0.5"></i><span>${window.getText('menu_cust')}</span>
        </a>
        <a href="#warehouse" data-target="warehouse" class="mobile-menu-item flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-bold transition-all">
            <i class="fa-solid fa-warehouse text-base mb-0.5"></i><span>${window.getText('menu_wh')}</span>
        </a>
        <a href="#finance" data-target="finance" class="mobile-menu-item flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-bold transition-all">
            <i class="fa-solid fa-wallet text-base mb-0.5"></i><span>${window.getText('menu_finance')}</span>
        </a>
        <a href="#system" data-target="system" class="mobile-menu-item flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-bold transition-all">
            <i class="fa-solid fa-gears text-base mb-0.5"></i><span>${window.getText('menu_settings')}</span>
        </a>
    `;

    if(userRoleText) userRoleText.innerText = window.getText('role_admin');

    const viewKey = window.location.hash.replace("#", "") || "dashboard";

    const allLinks = document.querySelectorAll(".menu-item, .mobile-menu-item");
    allLinks.forEach(item => {
        const target = item.getAttribute("data-target");
        if (target === viewKey) {
            item.classList.add("text-indigo-500", "active");
            if(item.classList.contains("menu-item")) item.classList.remove("text-indigo-500"); 
        } else {
            item.classList.remove("text-indigo-500", "active");
        }
        
        item.addEventListener("click", (e) => {
            e.preventDefault();
            if (target === "orders") { window.ERP_STORE.filter_status = null; }
            window.location.hash = target;
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

    const currentRoute = routes[viewKey];
    if (currentRoute) {
        pageTitle.innerText = currentRoute.title;
        mainView.innerHTML = `<div class="view-section h-full">${currentRoute.render()}</div>`;
        if (typeof currentRoute.init === "function") currentRoute.init();
    }
};

window.addEventListener("hashchange", () => window.renderGlobalSkeleton());
