/**
 * 代购 ERP 终极全量修复版 - 2026.05.20
 * 经过全局路径测试、多端并发保存测试
 */
(function() {
    // 1. 自动识别路径，防止出现 undefined/api 报错
    const BASE = window.API_BASE_URL || "";

    // --- 核心工具函数 ---
    window.closeOrderFormModalActual = () => {
        const m = document.getElementById("order-form-modal");
        if (m) m.remove();
    };

    window.calculateFormTotalCnyActual = () => {
        let t = 0;
        document.querySelectorAll(".mo-cny-input").forEach(i => t += (parseFloat(i.value) || 0));
        const d = document.getElementById("mo-total-cny-display");
        if (d) d.innerText = `¥${t.toLocaleString()}`;
    };

    // --- 数据同步与渲染 ---
    window.fetchLatestOrdersAndRender = async function() {
        try {
            const res = await fetch(`${BASE}/api/orders`);
            if (!res.ok) throw new Error("Sync Fail");
            const data = await res.json();
            window.ERP_STORE.orders = data || []; // 保持云端一致
            const mv = document.getElementById("main-view");
            if (mv) mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
        } catch (e) { console.error("同步异常", e); }
    };

    window.renderOrders = function() {
        const ords = window.ERP_STORE.orders || [];
        const filter = window.ERP_STORE.filter_status || null;
        let filtered = ords.filter(o => {
            if (filter === "已取消") return o.status === "已取消";
            return filter ? o.status === filter : o.status !== "已取消";
        });

        let html = `<div class="p-4 space-y-4">
            <button onclick="window.fetchLatestOrdersAndRender()" class="w-full py-2 text-[10px] text-indigo-500 underline italic font-bold">刷新同步云端</button>
            <button onclick="window.openOrderFormModal(null)" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">＋ 新建中越合并代购订单</button>`;

        if (!filtered.length) {
            html += `<div class="p-10 text-center text-slate-300 italic">该分组下暂无代购订单</div>`;
        } else {
            filtered.forEach((o, idx) => {
                const total = (o.items || []).reduce((s, i) => s + (parseFloat(i.cny) || 0), 0);
                html += `
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div><div class="font-black text-slate-800">${o.customer}</div><div class="text-[10px] text-slate-400 font-mono">${o.id}</div></div>
                        <button onclick="window.openOrderDetailModalForManage(${idx})" class="bg-slate-100 text-slate-900 px-3 py-1 rounded-lg text-xs font-bold">管理此单</button>
                    </div>
                    <div class="mt-4 space-y-2 border-t pt-3">
                        ${(o.items || []).map(i => `<div class="flex justify-between text-xs text-slate-500"><span>[淘宝] ${i.name}</span><span>¥${i.cny}</span></div>`).join('')}
                    </div>
                    <div class="mt-4 flex justify-between items-center font-black border-t pt-2"><span class="text-slate-400 text-[10px]">整单内部本金:</span><span class="text-slate-800 text-sm">¥${total.toFixed(2)}</span></div>
                </div>`;
            });
        }
        return html + `</div>`;
    };

    // --- 弹窗逻辑 (保留全部 UI 细节) ---
    window.addItemRowToFormActual = (data = {}) => {
        const c = document.getElementById("mo-items-container");
        const h = `
            <div class="mo-item-row-actual bg-slate-50 rounded-xl p-3 relative border border-slate-200 mb-3">
                <input type="text" class="mo-name-input w-full font-bold text-sm bg-transparent mb-2" placeholder="商品名称" value="${data.name || ''}">
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" oninput="window.calculateFormTotalCnyActual()" class="mo-cny-input bg-white p-2 rounded-lg text-sm border-none shadow-sm" placeholder="CNY单价" value="${data.cny || ''}">
                    <select class="mo-status-select bg-white p-2 rounded-lg text-sm border-none shadow-sm">
                        <option ${data.status==='等待国内发货'?'selected':''}>等待国内发货</option>
                        <option ${data.status==='集运仓已到货'?'selected':''}>集运仓已到货</option>
                    </select>
                </div>
                <input type="text" class="mo-track-input w-full mt-2 text-[10px] text-slate-400 bg-transparent" placeholder="国内单号 (选填)" value="${data.track || ''}">
            </div>`;
        c.insertAdjacentHTML('beforeend', h);
        window.calculateFormTotalCnyActual();
    };

    window.openOrderFormModal = (editIdx) => {
        const isE = editIdx !== null;
        const o = isE ? window.ERP_STORE.orders[editIdx] : { customer: 'Linh Long (阿龙)', items: [] };
        const modal = `
            <div id="order-form-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center p-4">
                <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    <div class="p-6 overflow-y-auto">
                        <h2 class="text-xl font-black mb-4">${isE ? '修改订单' : '创建新订单'}</h2>
                        <select id="mo-customer-select" class="w-full bg-slate-100 rounded-xl p-3 mb-4 border-none font-bold">
                            <option ${o.customer==='Linh Long (阿龙)'?'selected':''}>Linh Long (阿龙)</option>
                        </select>
                        <div id="mo-items-container"></div>
                        <button onclick="window.addItemRowToFormActual()" class="w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-500 text-xs font-bold mt-2">＋ 增加一件商品</button>
                        <div class="mt-6 bg-slate-50 p-4 rounded-2xl flex justify-between items-center"><span class="text-xs font-bold">内部总估结算:</span><span id="mo-total-cny-display" class="font-black text-indigo-600">¥0</span></div>
                    </div>
                    <div class="p-6 bg-slate-50 flex gap-3">
                        <button onclick="window.closeOrderFormModalActual()" class="flex-1 py-4 font-bold text-slate-400">取消</button>
                        <button onclick="window.submitOrderFormActualAction(${editIdx})" class="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">保存全部数据入库</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modal);
        if (isE) o.items.forEach(i => window.addItemRowToFormActual(i));
        else window.addItemRowToFormActual();
    };

    window.submitOrderFormActualAction = async (idx) => {
        const items = [];
        document.querySelectorAll(".mo-item-row-actual").forEach(r => items.push({
            name: r.querySelector(".mo-name-input").value,
            cny: parseFloat(r.querySelector(".mo-cny-input").value) || 0,
            status: r.querySelector(".mo-status-select").value,
            track: r.querySelector(".mo-track-input").value
        }));
        
        const payload = {
            id: idx !== null ? window.ERP_STORE.orders[idx].id : "#ORD-" + Math.floor(Math.random()*90000+10000),
            customer: document.getElementById("mo-customer-select").value,
            items,
            status: idx !== null ? window.ERP_STORE.orders[idx].status : "等待国内发货"
        };

        const res = await fetch(`${BASE}/api/orders/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            await window.fetchLatestOrdersAndRender();
            window.closeOrderFormModalActual();
            alert("✅ 同步成功！");
        }
    };

    // 解决 app.js 的 init_orders 报错
    window.init_orders = window.fetchLatestOrdersAndRender;
    window.fetchLatestOrdersAndRender();
})();
