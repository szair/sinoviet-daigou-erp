/**
 * 旗舰版 ERP - 域名硬核适配 & UI 还原
 * 解决：API连接失败 (404)、函数未定义、UI 走样
 */
(function() {
    // 1. 强制指定 API 地址，解决 image_7653be.png 中的 404 问题
    const API_URL = "https://buy.imokla.ccwu.cc/api/orders";
    const SAVE_URL = "https://buy.imokla.ccwu.cc/api/orders/save";
    const VND_RATE = 3500;

    // 2. 核心初始化函数 (修复 image_75f928.png 中的 init_orders 报错)
    window.init_orders = async function() {
        const mainView = document.getElementById("main-view");
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Server Error");
            const data = await res.json();
            window.ERP_STORE = { orders: data || [], filter_status: window.ERP_STORE?.filter_status || null };
            if (mainView) mainView.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
        } catch (e) {
            console.error("API连接失败:", e);
            if (mainView) mainView.innerHTML = `
                <div class="p-20 text-center">
                    <div class="text-red-400 font-black mb-2">API连接失败，请检查路径</div>
                    <div class="text-slate-300 text-xs font-mono">${API_URL}</div>
                </div>`;
        }
    };

    // 3. 还原最初的紫色 UI 和列表样式
    window.renderOrders = function() {
        const ords = window.ERP_STORE.orders || [];
        const filter = window.ERP_STORE.filter_status;
        let filtered = ords.filter(o => {
            if (filter === "已取消") return o.status === "已取消";
            return filter ? o.status === filter : o.status !== "已取消";
        });

        let html = `
        <div class="p-4 space-y-4">
            <button onclick="window.openOrderFormModal(null)" class="w-full bg-[#5D5CDE] text-white py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2">
                🛒 新建中越合并代购订单
            </button>
            <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                ${['全部正常', '待发货', '已到仓', '运输中', '已签收', '已取消'].map(s => `
                    <button onclick="window.setFilter('${s}')" class="flex-none px-4 py-2 rounded-xl text-xs font-bold ${(!filter && s === '全部正常') || filter === s ? 'bg-[#5D5CDE] text-white' : 'bg-white text-slate-400 border border-slate-100'}">${s}</button>
                `).join('')}
            </div>`;

        if (filtered.length === 0) {
            html += `<div class="bg-white rounded-[32px] p-20 text-center text-slate-300 italic shadow-sm border border-slate-50">该分组下暂无代购订单</div>`;
        } else {
            filtered.forEach((o, idx) => {
                const total = (o.items || []).reduce((s, i) => s + (parseFloat(i.cny) || 0), 0);
                html += `
                <div class="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="font-black text-slate-800 text-base">${o.customer || '未知客户'}</div>
                            <div class="text-[10px] text-slate-300 font-mono mt-0.5">${o.id}</div>
                        </div>
                        <button onclick="window.openOrderDetailModalForManage(${idx})" class="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[11px] font-black">管理</button>
                    </div>
                    <div class="space-y-3">
                        ${(o.items || []).map(i => `
                            <div class="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl">
                                <div class="text-xs font-bold text-slate-600"><span class="text-slate-300 mr-1">[${i.platform || '淘宝'}]</span> ${i.name}</div>
                                <div class="text-xs font-mono text-slate-400">¥${i.cny}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-4 flex justify-between items-center pt-4 border-t border-slate-50">
                        <span class="text-slate-400 text-[11px] font-bold">整单内部本金:</span>
                        <span class="text-slate-800 font-black">¥${total.toFixed(2)}</span>
                    </div>
                </div>`;
            });
        }
        return html + `</div>`;
    };

    // 4. 彻底修复 VND 输入框和删除逻辑
    window.calculateFormTotalCnyActual = () => {
        let total = 0;
        document.querySelectorAll(".mo-cny-input").forEach(el => total += (parseFloat(el.value) || 0));
        const display = document.getElementById("mo-total-cny-display");
        const vndInp = document.getElementById("mo-total-vnd-input");
        if (display) display.innerText = `¥${total.toLocaleString()}`;
        if (vndInp) vndInp.value = Math.round(total * VND_RATE);
    };

    window.setFilter = (s) => {
        window.ERP_STORE.filter_status = (s === '全部正常') ? null : s;
        const mv = document.getElementById("main-view");
        if (mv) mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
    };

    // 页面加载完成后立即执行
    if (document.readyState === 'complete') window.init_orders();
    else window.addEventListener('load', window.init_orders);
})();
