(function() {
    const VND_RATE = 3450;

    // --- 1. 初始化与数据同步 ---
    window.fetchLatestOrdersAndRender = async function() {
        const mv = document.getElementById("main-view");
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/orders`);
            const data = await res.json();
            
            // 🛡️ 核心：解决“未知买家”和数据解析
            window.ERP_STORE.orders = data.map(ord => ({
                ...ord,
                customer: ord.customer_name || ord.customer || "未知买家",
                items: typeof ord.items_json === 'string' ? JSON.parse(ord.items_json) : (ord.items || [])
            }));

            // 只有当当前视图是订单时才渲染，避免破坏侧边栏
            if (mv && window.ERP_STORE.current_view === 'orders') {
                mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
            }
        } catch (e) {
            console.error("加载失败:", e);
        }
    };

    // --- 2. 完整的主界面渲染 ---
    window.renderOrders = function() {
        const isZh = window.ERP_STORE.current_lang === "zh";
        const orders = window.ERP_STORE.orders || [];
        
        let listHTML = "";
        orders.forEach((ord, index) => {
            // 自动计算汇总
            let totalCny = (ord.items || []).reduce((sum, i) => sum + parseFloat(i.cny || 0), 0);
            
            listHTML += `
                <div class="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100/80 mb-4 animate-fadeIn">
                    <div class="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                        <div>
                            <span class="text-sm font-black text-slate-900">${ord.customer}</span>
                            <span class="text-[10px] text-slate-400 font-mono block">ID: ${ord.id}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">${ord.status}</span>
                            <button onclick="window.openOrderDetailModalForManage(${index})" 
                                    class="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-slate-200 active:scale-95 transition-all">
                                ${isZh ? '管理' : 'Quản lý'}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        ${(ord.items || []).slice(0, 3).map(it => `
                            <div class="flex justify-between text-[11px]">
                                <span class="text-slate-500">${it.name}</span>
                                <span class="font-mono font-bold text-slate-700">¥${it.cny}</span>
                            </div>
                        `).join("")}
                        ${ord.items.length > 3 ? `<div class="text-[10px] text-slate-300 text-center">... 更多共 ${ord.items.length} 件 ...</div>` : ''}
                    </div>
                </div>`;
        });

        return `
            <div class="p-4 w-full max-w-md mx-auto pb-20">
                <button onclick="window.openOrderFormModal(null)" 
                        class="w-full bg-[#5D5CDE] text-white py-4 rounded-[24px] text-xs font-black shadow-xl shadow-indigo-100 mb-6">
                    + ${isZh ? '新建中越合并代购订单' : 'Tạo đơn mới'}
                </button>
                <div class="space-y-4">${listHTML || '<div class="p-20 text-center text-slate-300">暂无数据</div>'}</div>
            </div>`;
    };

    // --- 3. 完整的管理控制台弹窗 ---
    window.openOrderDetailModalForManage = function(index) {
        const ord = window.ERP_STORE.orders[index];
        const isZh = window.ERP_STORE.current_lang === "zh";

        const modalHTML = `
            <div id="order-manage-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center z-[9999] p-4">
                <div class="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-slideUp">
                    <div class="p-8 space-y-6">
                        <div class="flex justify-between items-center border-b pb-4">
                            <h3 class="text-xs font-black text-slate-400">ORDER CONTROL CENTER</h3>
                            <button onclick="document.getElementById('order-manage-modal').remove()" class="p-2 text-slate-300">✕</button>
                        </div>
                        
                        <div class="space-y-1">
                            <div class="text-2xl font-black text-slate-900">${ord.customer}</div>
                            <div class="text-xs text-slate-400 font-mono">${ord.id}</div>
                        </div>

                        <div class="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                            ${(ord.items || []).map((it, iIdx) => `
                                <div class="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-black text-slate-800">${it.name}</span>
                                        <button onclick="window.fastCycleItemStatus(${index}, ${iIdx})" 
                                                class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 shadow-sm">
                                            ${it.status}
                                        </button>
                                    </div>
                                    <input type="text" value="${it.track || ''}" 
                                           onblur="window.fastUpdateTrack(${index}, ${iIdx}, this.value)"
                                           placeholder="${isZh?'粘贴国内物流单号':'Mã vận đơn'}" 
                                           class="w-full bg-white border-none rounded-xl px-4 py-2 text-[10px] font-mono focus:ring-2 focus:ring-indigo-100">
                                </div>
                            `).join("")}
                        </div>

                        <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                            <button onclick="window.openOrderFormModal(${index})" class="py-4 bg-slate-100 rounded-2xl text-xs font-black">${isZh?'编辑详情':'Sửa'}</button>
                            <button onclick="window.deleteOrderActual('${ord.id}')" class="py-4 bg-rose-50 text-rose-500 rounded-2xl text-xs font-black">${isZh?'删除订单':'Xóa'}</button>
                        </div>
                    </div>
                </div>
            </div>`;
        
        const old = document.getElementById("order-manage-modal");
        if(old) old.remove();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };

    // --- 4. 药丸状态循环逻辑 ---
    window.fastCycleItemStatus = function(ordIdx, itemIdx) {
        const steps = ["等待国内发货", "集运仓已到货", "跨境清关运输中", "买家已完成收货"];
        let item = window.ERP_STORE.orders[ordIdx].items[itemIdx];
        item.status = steps[(steps.indexOf(item.status) + 1) % steps.length];
        
        // 自动计算订单总状态
        window.recalculateOrderStatus(ordIdx);
        // 保存并局部更新
        window.silentSaveAndRefresh(ordIdx);
    };

    window.fastUpdateTrack = function(ordIdx, itemIdx, val) {
        window.ERP_STORE.orders[ordIdx].items[itemIdx].track = val;
        window.silentSaveAndRefresh(ordIdx);
    };

    window.recalculateOrderStatus = function(idx) {
        const ord = window.ERP_STORE.orders[idx];
        const items = ord.items || [];
        if (items.every(i => i.status === "买家已完成收货")) ord.status = "买家已完成收货";
        else if (items.some(i => i.status === "跨境清关运输中")) ord.status = "跨境清关运输中";
        else if (items.some(i => i.status === "集运仓已到货")) ord.status = "集运仓已到货";
        else ord.status = "等待国内发货";
    };

    window.silentSaveAndRefresh = async function(idx) {
        const ord = window.ERP_STORE.orders[idx];
        await fetch(`${window.API_BASE_URL}/api/orders/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: ord.id,
                customer_name: ord.customer,
                items_json: JSON.stringify(ord.items),
                status: ord.status,
                buyer_vnd: ord.buyer_vnd || 0
            })
        });
        // 刷新列表
        window.fetchLatestOrdersAndRender();
    };

    // --- 5. 初始化逻辑 (仅挂载，不自动运行) ---
    console.log("订单模块逻辑已完整加载，等待路由触发...");

})();
