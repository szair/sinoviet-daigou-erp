// =========================================================
// 📦 中越通跨境代购 ERP - 订单业务 H5 核心模块 (最终商用精准修正版)
// =========================================================

(function() {
    // ⚡ 终极安全路径清洗锁
    const getBaseUrl = () => {
        let rawUrl = window.API_BASE_URL;
        if (rawUrl && rawUrl !== "undefined" && rawUrl.trim() !== "") {
            rawUrl = rawUrl.trim();
            if (rawUrl.includes("buy.imokla.ccwu.cc") && !rawUrl.includes("buyapi")) {
                return "https://buyapi.imokla.ccwu.cc";
            }
            return rawUrl;
        }
        return "https://buyapi.imokla.ccwu.cc";
    };

    const VND_RATE = 3450; 

    // 🟢 修正点 1: 补齐缺失的全局 UI 反馈函数（防止提交时 ReferenceError 崩溃）
    window.showErpToast = function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-10 left-1/2 -translate-x-1/2 z-[100000] px-6 py-3 rounded-2xl shadow-2xl border text-sm font-black transition-all animate-fadeIn`;
        if (type === 'success') {
            toast.className += " bg-white text-emerald-600 border-emerald-100";
            toast.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i> ${message}`;
        } else {
            toast.className += " bg-white text-rose-600 border-rose-100";
            toast.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-2"></i> ${message}`;
        }
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => toast.remove(), 500);
        }, 2500);
    };

    // --- 1. 全局数据同步拉取引擎 ---
    window.fetchLatestOrdersAndRender = async function() {
        const mv = document.getElementById("main-view");
        try {
            const res = await fetch(`${getBaseUrl()}/api/orders`);
            if (!res.ok) throw new Error("Server Response Error");
            const data = await res.json();
            window.ERP_STORE.orders = data || [];
            if (mv) mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
        } catch (e) {
            console.error("D1 API 连接失败:", e);
            if (mv) {
                mv.innerHTML = `<div class="p-16 text-center text-rose-500 font-black text-sm">⚠️ API连接失败</div>`;
            }
        }
    };

    // --- 2. 主页面大盘渲染 (保留你原始的过滤算法与多语言逻辑) ---
    window.renderOrders = function() {
        const isZh = window.ERP_STORE.current_lang === "zh";
        if (window.ERP_STORE.filter_status === undefined) window.ERP_STORE.filter_status = null;
        const currentFilter = window.ERP_STORE.filter_status;

        const statuses = ["等待国内发货", "集运仓已到货", "跨境清关运输中", "买家已完成收货", "已取消"];
        const statusLabels = {
            "等待国内发货": isZh ? "🕒 待发货" : "Chờ giao",
            "集运仓已到货": isZh ? "📦 已到仓" : "Đến kho",
            "跨境清关运输中": isZh ? "🚛 运输中" : "Vận chuyển",
            "买家已完成收货": isZh ? "✅ 已签收" : "Đã nhận",
            "已取消": isZh ? "❌ 已取消" : "Đã hủy"
        };

        let pillsHTML = `<button onclick="window.filterOrdersByStatus(null)" class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${currentFilter === null ? 'bg-[#5D5CDE] text-white border-[#5D5CDE]' : 'bg-white text-slate-500 border-slate-200'}">${isZh ? "全部正常" : "Tất cả"}</button>`;
        statuses.forEach(st => {
            const isActive = currentFilter === st;
            let activeClass = isActive ? "bg-[#5D5CDE] text-white border-[#5D5CDE]" : "bg-white text-slate-500 border-slate-200";
            pillsHTML += `<button onclick="window.filterOrdersByStatus('${st}')" class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${activeClass}">${statusLabels[st]}</button>`;
        });

        // 🛡️ 保留你原始的“状态降级分类路由过滤算法”
        let filteredOrders = window.ERP_STORE.orders.filter(ord => {
            let actualItems = typeof ord.items === "string" ? JSON.parse(ord.items || "[]") : (ord.items || []);
            if (currentFilter === "已取消") return ord.status === "已取消";
            if (ord.status === "已取消") return false;
            if (currentFilter === null) return true;

            let hasUnshipped = actualItems.some(i => i.status === "等待国内发货");
            let hasInWarehouse = actualItems.some(i => i.status === "集运仓已到货");
            let hasInTransit = actualItems.some(i => i.status === "跨境清关运输中");
            let hasReceived = actualItems.some(i => i.status === "买家已完成收货");

            if (currentFilter === "等待国内发货") return hasUnshipped || (!hasInWarehouse && !hasInTransit && !hasReceived);
            if (currentFilter === "集运仓已到货") return !hasUnshipped && hasInWarehouse;
            if (currentFilter === "跨境清关运输中") return !hasUnshipped && !hasInWarehouse && hasInTransit;
            if (currentFilter === "买家已完成收货") return !hasUnshipped && !hasInWarehouse && !hasInTransit && hasReceived;
            return ord.status === currentFilter;
        });

        let listHTML = "";
        filteredOrders.forEach((ord, index) => {
            let itemsSummary = "";
            let totalCny = 0;
            let actualItems = typeof ord.items === "string" ? JSON.parse(ord.items || "[]") : (ord.items || []);

            actualItems.forEach(item => {
                totalCny += parseFloat(item.cny || 0);
                itemsSummary += `
                    <div class="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60 text-xs mt-1">
                        <div class="max-w-[65%] truncate"><span class="text-slate-400 font-black">[${item.platform || '淘宝'}]</span> ${item.name || '未命名'}</div>
                        <span class="font-mono font-black text-slate-500">¥${item.cny || 0}</span>
                    </div>`;
            });

            listHTML += `
                <div class="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100/80 space-y-4 mb-4">
                    <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                            <span class="text-sm font-black text-slate-900">${ord.customer.replace("CUST-", "")}</span>
                            <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">${ord.id}</span>
                        </div>
                        <button onclick="window.openOrderDetailModalForManage(${index})" class="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-black">管理</button>
                    </div>
                    ${itemsSummary}
                    <div class="flex justify-between items-center pt-2 text-xs">
                        <span class="text-slate-400 font-bold">${isZh?'整单本金':'Tổng tiền'}:</span>
                        <span class="font-mono font-black text-slate-900 text-sm">¥${totalCny.toLocaleString()}</span>
                    </div>
                </div>`;
        });

        return `
            <div class="space-y-4 w-full max-w-md mx-auto pb-12">
                <button onclick="window.openCreateOrderModalDirectly()" class="w-full bg-[#5D5CDE] text-white py-3.5 rounded-2xl text-xs font-black shadow-md"><i class="fa-solid fa-cart-plus"></i> ${isZh ? '新建中越合并代购订单' : 'Tạo đơn hàng mới'}</button>
                <div class="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">${pillsHTML}</div>
                <div class="space-y-4">${listHTML || '<div class="text-center p-12 text-slate-400 text-xs">暂无数据</div>'}</div>
            </div>`;
    };

    window.filterOrdersByStatus = function(status) {
        window.ERP_STORE.filter_status = status;
        const mv = document.getElementById("main-view");
        if(mv) mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
    };

    window.openCreateOrderModalDirectly = function() { window.openOrderFormModal(null); };

    // --- 3. 新建/修改表单弹窗 (保留你原始的所有输入框与样式) ---
    window.openOrderFormModal = function(editIndex = null) {
        const isEdit = editIndex !== null;
        const isZh = window.ERP_STORE.current_lang === "zh";
        const targetOrder = isEdit ? window.ERP_STORE.orders[editIndex] : { id: "", customer: "", buyer_vnd: 0, items: [] };

        let itemsFormHTML = "";
        let actualItems = typeof targetOrder.items === "string" ? JSON.parse(targetOrder.items || "[]") : (targetOrder.items || []);

        if (isEdit && actualItems.length > 0) {
            actualItems.forEach(item => itemsFormHTML += window.createPlatformItemRowTemplate(item.platform, item.name, item.cny, item.track, item.status, item.express_company));
        } else {
            itemsFormHTML += window.createPlatformItemRowTemplate("淘宝", "", "", "", "等待国内发货", "中通");
        }

        const modalHTML = `
            <div id="order-form-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center z-[9999] p-4">
                <div class="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-fadeIn">
                    <div class="flex justify-between items-center border-b p-6">
                        <h3 class="text-sm font-black text-slate-800">${isEdit ? '修改订单' : '创建新订单'}</h3>
                        <button onclick="window.closeOrderFormModalActual()" class="text-slate-300">✕</button>
                    </div>
                    <form id="add-order-form-actual" class="p-6 space-y-4 overflow-y-auto">
                        <label class="block text-[10px] font-black text-slate-400 uppercase">选择买家</label>
                        <select id="mo-customer-select" class="w-full bg-slate-50 rounded-2xl p-4 font-bold">
                            ${window.ERP_STORE.customers.map(c => `<option value="${c.name}" ${targetOrder.customer===c.name?'selected':''}>${c.name}</option>`).join('')}
                        </select>
                        <div id="mo-items-container-actual" class="space-y-3">${itemsFormHTML}</div>
                        <button type="button" onclick="window.addItemRowToFormActualDynamic()" class="text-[#5D5CDE] font-black text-[11px]">+ 增加商品</button>
                        <div class="bg-slate-50 p-6 rounded-[32px] space-y-4">
                            <div class="flex justify-between"><span class="text-slate-400">内部总本金:</span><span id="mo-total-cny-display-actual" class="font-black">¥0</span></div>
                            <div>
                                <label class="block text-indigo-950 font-bold mb-1">收取买家货款 (VND)</label>
                                <input type="number" id="mo-buyer-vnd-actual" value="${targetOrder.buyer_vnd || ''}" class="w-full bg-transparent text-2xl font-black text-[#5D5CDE]" placeholder="0">
                            </div>
                        </div>
                    </form>
                    <div class="p-6 border-t flex gap-3">
                        <button onclick="window.closeOrderFormModalActual()" class="w-1/4 py-4 text-slate-500 font-bold">取消</button>
                        <button onclick="window.submitOrderFormActualAction(${editIndex})" class="flex-grow bg-[#5D5CDE] text-white py-4 rounded-2xl font-black">保存全部入库</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        window.calculateFormTotalCnyActual();
    };

    // --- 4. 云端原子数据写入 (关键修正点) ---
    window.submitOrderFormActualAction = async function(editIndex) {
        const isEdit = editIndex !== null;
        const isZh = window.ERP_STORE.current_lang === "zh";

        const customer = document.getElementById("mo-customer-select").value;
        const buyerVnd = parseFloat(document.getElementById("mo-buyer-vnd-actual").value) || 0;
        const itemsList = [];

        document.querySelectorAll(".mo-item-row-actual").forEach(row => {
            itemsList.push({
                platform: row.querySelector(".mo-platform-select").value,
                name: row.querySelector(".mo-name-input").value.trim(),
                cny: parseFloat(row.querySelector(".mo-cny-input").value) || 0,
                express_company: row.querySelector(".mo-express-select").value,
                track: row.querySelector(".mo-track-input").value.trim(),
                status: row.querySelector(".mo-status-select").value
            });
        });

        // 🟢 修正点 2: 保持你的逻辑，并确保 ID 稳固
        let targetId = isEdit ? window.ERP_STORE.orders[editIndex].id : "#ORD-" + Math.floor(10000 + Math.random() * 90000);
        
        const payload = {
            id: targetId,
            customer: customer,
            buyer_vnd: buyerVnd,
            items: itemsList,
            status: isEdit ? window.ERP_STORE.orders[editIndex].status : "等待国内发货"
        };

        try {
            // 🟢 修正点 3: 必须指向正确的 /save 接口，并刷新列表
            const res = await fetch(`${getBaseUrl()}/api/orders/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await window.fetchLatestOrdersAndRender(); // 重新拉取并重绘
                window.closeOrderFormModalActual();
                window.showErpToast(isZh ? "🎉 订单已成功存储入库！" : "🎉 Đã lưu đơn hàng!");
            } else {
                window.showErpToast("D1 Save Failed", "error");
            }
        } catch (e) {
            window.showErpToast("Connection Error", "error");
        }
    };

    // 辅助函数 (保持原样)
    window.createPlatformItemRowTemplate = function(platform, name, cny, track, status, expressCompany = "中通") {
        const id = 'row-' + Math.random().toString(36).substr(2, 9);
        return `
            <div id="${id}" class="mo-item-row-actual bg-white border border-slate-100 rounded-[28px] p-4 relative group">
                <button type="button" onclick="window.removeItemRowFromFormActual('${id}')" class="absolute -right-2 -top-2 bg-red-50 text-red-400 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                <div class="flex gap-2 mb-2">
                    <select class="mo-platform-select bg-slate-50 rounded-xl text-[10px] w-1/3">
                        <option value="淘宝" ${platform==='淘宝'?'selected':''}>淘宝</option>
                        <option value="1688" ${platform==='1688'?'selected':''}>1688</option>
                        <option value="拼多多" ${platform==='拼多多'?'selected':''}>拼多多</option>
                    </select>
                    <input type="text" class="mo-name-input flex-1 font-bold text-sm bg-slate-50 rounded-xl px-3 py-2" value="${name}" placeholder="商品名">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" class="mo-cny-input bg-slate-50 rounded-xl px-3 py-2 text-sm font-black" value="${cny}" placeholder="本金" oninput="window.calculateFormTotalCnyActual()">
                    <select class="mo-express-select bg-slate-50 rounded-xl text-[10px]">
                        <option value="中通" ${expressCompany==='中通'?'selected':''}>中通</option>
                        <option value="顺丰" ${expressCompany==='顺丰'?'selected':''}>顺丰</option>
                    </select>
                </div>
                <div class="flex gap-2 mt-2">
                    <input type="text" class="mo-track-input flex-1 bg-slate-50 rounded-xl px-3 py-1 text-[10px]" value="${track}" placeholder="单号">
                    <select class="mo-status-select bg-slate-50 rounded-xl text-[10px] w-2/5">
                        <option value="等待国内发货" ${status==='等待国内发货'?'selected':''}>🕒 待发货</option>
                        <option value="集运仓已到货" ${status==='集运仓已到货'?'selected':''}>📦 已到仓</option>
                    </select>
                </div>
            </div>`;
    };

    window.calculateFormTotalCnyActual = function() {
        let total = 0;
        document.querySelectorAll(".mo-cny-input").forEach(input => total += (parseFloat(input.value) || 0));
        const el = document.getElementById("mo-total-cny-display-actual");
        if(el) el.innerText = "¥" + total.toFixed(2);
        const vndEl = document.getElementById("mo-buyer-vnd-actual");
        if(vndEl && (!vndEl.value || vndEl.value == 0)) vndEl.value = Math.round(total * VND_RATE);
    };

    window.addItemRowToFormActualDynamic = function() {
        document.getElementById("mo-items-container-actual").insertAdjacentHTML('beforeend', window.createPlatformItemRowTemplate("淘宝", "", "", "", "等待国内发货", "中通"));
    };

    window.removeItemRowFromFormActual = function(id) {
        const el = document.getElementById(id);
        if(el) { el.remove(); window.calculateFormTotalCnyActual(); }
    };

    window.closeOrderFormModalActual = function() {
        const m = document.getElementById("order-form-modal");
        if(m) m.remove();
    };

    // 初始加载
    document.addEventListener("DOMContentLoaded", () => {
        window.fetchLatestOrdersAndRender();
    });

})();
