/**
 * 代购 ERP 旗舰版 - 完整 UI 复刻 & 稳健逻辑
 * 还原：紫色圆角 UI、VND 货款框、商品删除功能、管理面板
 */
(function() {
    const BASE = window.API_BASE_URL || "";
    const VND_RATE = 3500;

    // --- 1. 初始化 & 自动路径纠偏 ---
    window.fetchLatestOrdersAndRender = async function() {
        try {
            const res = await fetch(`${BASE}/api/orders`);
            if (!res.ok) throw new Error("Sync Fail");
            const data = await res.json();
            window.ERP_STORE.orders = data || [];
            const mv = document.getElementById("main-view");
            if (mv) mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
        } catch (e) { 
            console.error("同步异常:", e);
            const mv = document.getElementById("main-view");
            if (mv) mv.innerHTML = `<div class="p-10 text-center text-red-400">API连接失败，请检查路径</div>`;
        }
    };

    // --- 2. 列表界面还原 (紫色圆角风格) ---
    window.renderOrders = function() {
        const ords = window.ERP_STORE.orders || [];
        const filter = window.ERP_STORE.filter_status || null;
        let filtered = ords.filter(o => {
            if (filter === "已取消") return o.status === "已取消";
            return filter ? o.status === filter : o.status !== "已取消";
        });

        let html = `
        <div class="p-4 space-y-4">
            <button onclick="window.openOrderFormModal(null)" class="w-full bg-[#5D5CDE] text-white py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 text-sm">
                🛒 新建中越合并代购订单
            </button>
            <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                ${['全部正常', '待发货', '已到仓', '运输中', '已签收', '已取消'].map(s => `
                    <button onclick="window.setFilter('${s}')" class="flex-none px-4 py-2 rounded-xl text-xs font-bold ${filter === s || (!filter && s === '全部正常') ? 'bg-[#5D5CDE] text-white' : 'bg-white text-slate-400 border border-slate-100'}">${s}</button>
                `).join('')}
            </div>`;

        if (!filtered.length) {
            html += `<div class="bg-white rounded-[32px] p-20 text-center text-slate-300 italic shadow-sm border border-slate-50">该分组下暂无代购订单</div>`;
        } else {
            filtered.forEach((o, idx) => {
                const total = (o.items || []).reduce((s, i) => s + (parseFloat(i.cny) || 0), 0);
                html += `
                <div class="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="font-black text-slate-800 text-base">${o.customer}</div>
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

    // --- 3. 弹窗 UI 复刻 (含删除商品、VND 输入框) ---
    window.openOrderFormModal = (idx) => {
        const isE = idx !== null;
        const o = isE ? window.ERP_STORE.orders[idx] : { customer: '1002 - Linh Long (阿龙)', items: [], buyer_vnd: 0 };
        
        const modal = `
            <div id="order-form-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-end sm:items-center justify-center p-4">
                <div class="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                    <div class="p-8 overflow-y-auto custom-scrollbar">
                        <div class="flex justify-between items-center mb-8">
                            <h2 class="text-xl font-black text-slate-800">${isE ? '修改合并代购订单' : '创建新代购订单'}</h2>
                            <button onclick="window.closeOrderFormModalActual()" class="text-slate-300 hover:text-slate-500">✕</button>
                        </div>
                        
                        <div class="mb-8">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">选择越南买家</label>
                            <select id="mo-customer-select" class="w-full bg-slate-50 rounded-2xl p-4 mt-2 border-none font-bold text-slate-700 appearance-none shadow-inner">
                                <option ${o.customer.includes('阿龙')?'selected':''}>1002 - Linh Long (阿龙)</option>
                            </select>
                        </div>

                        <div id="mo-items-container" class="space-y-4"></div>

                        <button onclick="window.addItemRowToFormActual()" class="w-full py-4 border-2 border-dashed border-indigo-100 rounded-[24px] text-[#5D5CDE] text-xs font-black mt-4 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                            <span class="text-lg">＋</span> 增加一件商品
                        </button>

                        <div class="mt-8 p-6 bg-slate-50/80 rounded-[32px] space-y-6">
                            <div class="flex justify-between items-center px-2">
                                <span class="text-xs font-black text-slate-400">内部总本金估算:</span>
                                <span id="mo-total-cny-display" class="font-black text-slate-800">¥0</span>
                            </div>
                            <div class="pt-4 border-t border-slate-200/50">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">收取买家固定货款 (VND)</label>
                                <div class="flex items-end gap-2 mt-2">
                                    <input type="number" id="mo-total-vnd-input" class="flex-1 text-2xl font-black text-[#5D5CDE] bg-transparent border-none p-0 focus:ring-0" value="${o.buyer_vnd || 0}">
                                    <span class="text-slate-300 font-bold mb-1 italic">₫</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-8 bg-slate-50/50 flex gap-4">
                        <button onclick="window.closeOrderFormModalActual()" class="flex-1 py-5 font-black text-slate-400 hover:text-slate-600">取消</button>
                        <button onclick="window.submitOrderFormActualAction(${idx})" class="flex-[2.5] bg-[#5D5CDE] text-white py-5 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all">保存全部数据入库</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modal);
        if (isE && o.items.length) o.items.forEach(i => window.addItemRowToFormActual(i));
        else window.addItemRowToFormActual();
    };

    window.addItemRowToFormActual = (d = {}) => {
        const id = 'row-' + Math.random().toString(36).substr(2, 9);
        const h = `
            <div id="${id}" class="mo-item-row-actual bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm relative group">
                <button onclick="document.getElementById('${id}').remove(); window.calculateFormTotalCnyActual();" class="absolute -right-2 -top-2 bg-red-50 text-red-400 w-8 h-8 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm">✕ 删除</button>
                <div class="flex gap-3 mb-4">
                    <select class="mo-platform-select bg-slate-50 rounded-xl text-xs px-3 py-2 border-none font-black text-slate-500">
                        <option ${d.platform==='淘宝'?'selected':''}>淘宝</option><option ${d.platform==='1688'?'selected':''}>1688</option>
                    </select>
                    <input type="text" class="mo-name-input flex-1 font-bold text-sm bg-slate-50 rounded-xl px-4 py-2 border-none placeholder:text-slate-300" placeholder="mo" value="${d.name || ''}">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="relative flex items-center bg-slate-50 rounded-xl px-4">
                        <span class="text-xs text-slate-300 font-bold mr-2">¥</span>
                        <input type="number" oninput="window.calculateFormTotalCnyActual()" class="mo-cny-input w-full bg-transparent py-3 text-sm font-black text-slate-700 border-none focus:ring-0" placeholder="CNY单价" value="${d.cny || ''}">
                    </div>
                    <select class="mo-status-select bg-slate-50 rounded-xl text-xs px-4 py-3 border-none font-bold text-slate-600">
                        <option ${d.status==='等待国内发货'?'selected':''}>等待国内发货</option>
                        <option ${d.status==='集运仓已到货'?'selected':''}>集运仓已到货</option>
                        <option ${d.status==='运输中'?'selected':''}>运输中</option>
                    </select>
                </div>
                <div class="flex items-center gap-2 mt-4 bg-slate-50/50 rounded-xl px-4 py-2">
                    <input type="text" class="mo-track-input w-full text-[10px] text-slate-400 bg-transparent border-none p-0 focus:ring-0" placeholder="国内单号 (选填)" value="${d.track || ''}">
                    <span class="text-[14px] text-slate-200">🕒</span>
                </div>
            </div>`;
        document.getElementById("mo-items-container").insertAdjacentHTML('beforeend', h);
        window.calculateFormTotalCnyActual();
    };

    // --- 4. 辅助逻辑 ---
    window.calculateFormTotalCnyActual = () => {
        let total = 0;
        document.querySelectorAll(".mo-cny-input").forEach(i => total += (parseFloat(i.value) || 0));
        document.getElementById("mo-total-cny-display").innerText = `¥${total.toLocaleString()}`;
        document.getElementById("mo-total-vnd-input").value = Math.round(total * VND_RATE);
    };

    window.closeOrderFormModalActual = () => {
        const m = document.getElementById("order-form-modal");
        if (m) m.remove();
    };

    // --- 5. 提交逻辑 ---
    window.submitOrderFormActualAction = async (idx) => {
        const items = [];
        document.querySelectorAll(".mo-item-row-actual").forEach(r => items.push({
            platform: r.querySelector(".mo-platform-select").value,
            name: r.querySelector(".mo-name-input").value,
            cny: parseFloat(r.querySelector(".mo-cny-input").value) || 0,
            status: r.querySelector(".mo-status-select").value,
            track: r.querySelector(".mo-track-input").value
        }));
        
        const payload = {
            id: idx !== null ? window.ERP_STORE.orders[idx].id : "#ORD-" + Math.floor(Math.random()*90000+10000),
            customer: document.getElementById("mo-customer-select").value,
            buyer_vnd: parseInt(document.getElementById("mo-total-vnd-input").value) || 0,
            items,
            status: items[0]?.status || "待发货"
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

    // 绑定初始加载
    window.init_orders = window.fetchLatestOrdersAndRender;
    window.fetchLatestOrdersAndRender();
})();
