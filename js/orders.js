/**
 * 代购 ERP 核心逻辑控制台 - 终极全量修复版
 * 包含：多端同步、UI 渲染、金额计算、弹窗管理
 */

(function() {
    // 1. 核心数据同步：强制拉取云端，防止本地空列表覆盖
    window.fetchLatestOrdersAndRender = async function() {
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/orders`);
            if (!res.ok) throw new Error("Sync Failed");
            const data = await res.json();
            window.ERP_STORE.orders = data || [];
            const mv = document.getElementById("main-view");
            if (mv) mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
            console.log("✅ 云端数据已同步");
        } catch (e) {
            console.error("同步出错:", e);
        }
    };

    // 2. 渲染主列表
    window.renderOrders = function() {
        const orders = window.ERP_STORE.orders || [];
        const filter = window.ERP_STORE.filter_status || null;
        let filtered = orders.filter(ord => {
            if (filter === "已取消") return ord.status === "已取消";
            if (ord.status === "已取消") return false;
            return filter ? ord.status === filter : true;
        });

        let html = `<div class="p-4 space-y-4">
            <button onclick="window.fetchLatestOrdersAndRender()" class="w-full py-2 text-[10px] text-indigo-500 underline font-bold italic">点击强制同步云端数据</button>
            <button onclick="window.openOrderFormModal(null)" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">＋ 新建合并代购订单</button>`;

        if (filtered.length === 0) {
            html += `<div class="p-10 text-center text-slate-300 italic">暂无订单数据</div>`;
        } else {
            filtered.forEach((ord, idx) => {
                const totalCny = (ord.items || []).reduce((sum, i) => sum + (parseFloat(i.cny) || 0), 0);
                html += `
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-black text-slate-800">${ord.customer}</div>
                            <div class="text-[10px] text-slate-400 font-mono">${ord.id}</div>
                        </div>
                        <button onclick="window.openOrderDetailModalForManage(${idx})" class="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-bold">管理此单</button>
                    </div>
                    <div class="mt-4 space-y-2 border-t pt-3">
                        ${(ord.items || []).map(i => `
                            <div class="flex justify-between text-xs text-slate-500">
                                <span>[${i.platform || '淘宝'}] ${i.name}</span>
                                <span class="font-mono">¥${i.cny}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-4 flex justify-between items-center font-black border-t pt-2">
                        <span class="text-slate-400 text-[10px]">整单内部本金:</span>
                        <span class="text-slate-800 text-sm">¥${totalCny.toFixed(2)}</span>
                    </div>
                </div>`;
            });
        }
        html += `</div>`;
        return html;
    };

    // 3. 订单金额自动计算逻辑
    window.calculateFormTotalCnyActual = function() {
        let total = 0;
        document.querySelectorAll(".mo-cny-input").forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        const display = document.getElementById("mo-total-cny-display");
        if (display) display.innerText = `¥${total.toLocaleString()}`;
    };

    // 4. 打开新建/编辑弹窗
    window.openOrderFormModal = function(editIndex) {
        const isEdit = editIndex !== null;
        const order = isEdit ? window.ERP_STORE.orders[editIndex] : { customer: '', items: [] };
        
        const modalHtml = `
            <div id="order-form-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center p-4">
                <div class="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    <div class="p-6 overflow-y-auto space-y-6">
                        <h2 class="text-xl font-black">${isEdit ? '修改订单' : '创建新订单'}</h2>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase">选择买家</label>
                            <select id="mo-customer-select" class="w-full bg-slate-50 border-none rounded-xl p-3 mt-1">
                                <option value="Linh Long (阿龙)">Linh Long (阿龙)</option>
                            </select>
                        </div>
                        <div id="mo-items-container" class="space-y-4">
                            </div>
                        <button onclick="window.addItemRowToFormActual()" class="w-full py-2 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-500 text-xs font-bold">＋ 增加一件商品</button>
                        <div class="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                            <span class="text-xs font-bold">内部总估结算:</span>
                            <span id="mo-total-cny-display" class="font-black text-indigo-600">¥0</span>
                        </div>
                    </div>
                    <div class="p-6 bg-slate-50 flex gap-3">
                        <button onclick="window.closeOrderFormModalActual()" class="flex-1 py-4 font-bold text-slate-400">取消</button>
                        <button onclick="window.submitOrderFormActualAction(${editIndex})" class="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black">保存全部数据入库</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        // 如果是编辑，初始化商品行...
        if (!isEdit) window.addItemRowToFormActual(); 
    };

    window.addItemRowToFormActual = function() {
        const container = document.getElementById("mo-items-container");
        const rowHtml = `
            <div class="mo-item-row-actual bg-white border rounded-xl p-3 relative">
                <input type="text" class="mo-name-input w-full font-bold text-sm mb-2" placeholder="商品名称">
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" oninput="window.calculateFormTotalCnyActual()" class="mo-cny-input bg-slate-50 p-2 rounded-lg text-sm" placeholder="CNY单价">
                    <select class="mo-status-select bg-slate-50 p-2 rounded-lg text-sm">
                        <option>等待国内发货</option>
                        <option>集运仓已到货</option>
                    </select>
                </div>
                <input type="text" class="mo-track-input w-full mt-2 text-[10px] text-slate-400" placeholder="国内单号 (选填)">
            </div>
        `;
        container.insertAdjacentHTML('beforeend', rowHtml);
    };

    window.closeOrderFormModalActual = function() {
        const m = document.getElementById("order-form-modal");
        if (m) m.remove();
    };

    // 5. 原子化保存：关键！修复多端覆盖 Bug
    window.submitOrderFormActualAction = async function(editIndex) {
        const customer = document.getElementById("mo-customer-select").value;
        const items = [];
        document.querySelectorAll(".mo-item-row-actual").forEach(row => {
            items.push({
                name: row.querySelector(".mo-name-input").value,
                cny: parseFloat(row.querySelector(".mo-cny-input").value) || 0,
                status: row.querySelector(".mo-status-select").value,
                track: row.querySelector(".mo-track-input").value
            });
        });

        const payload = {
            id: editIndex !== null ? window.ERP_STORE.orders[editIndex].id : "#ORD-" + Math.floor(Math.random()*90000+10000),
            customer,
            items,
            status: "等待国内发货"
        };

        const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
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

    // 初始执行
    window.fetchLatestOrdersAndRender();
})();
