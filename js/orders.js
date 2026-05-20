// =========================================================
// 📦 中越通跨境代购 ERP - 订单业务 H5 核心模块 (最终商用大圆满旗舰版 - 修复版)
// =========================================================

(function() {
    // ⚡ 终极安全路径清洗锁：拦截宿主环境错配的前端域名，强制纠偏并洗涤路径，彻底封杀 404 报错
    const getBaseUrl = () => {
        let rawUrl = window.API_BASE_URL;
        if (rawUrl && rawUrl !== "undefined" && rawUrl.trim() !== "") {
            rawUrl = rawUrl.trim();
            // 🛡️ 如果宿主环境将 API 域名误配成了前端域名 "https://buy.imokla.ccwu.cc"，强制拦截并清洗重写为正确的 "https://buyapi.imokla.ccwu.cc"
            if (rawUrl.includes("buy.imokla.ccwu.cc") && !rawUrl.includes("buyapi")) {
                return "https://buyapi.imokla.ccwu.cc";
            }
            return rawUrl;
        }
        return "https://buyapi.imokla.ccwu.cc";
    };

    const VND_RATE = 3450; // 默认系统计算汇率

    // --- 1. 全局数据同步拉取引擎 ---
    window.fetchLatestOrdersAndRender = async function() {
        const mv = document.getElementById("main-view");
        try {
            console.log("正在同步云端数据，API 终点:", `${getBaseUrl()}/api/orders`);
            const res = await fetch(`${getBaseUrl()}/api/orders`);
            if (!res.ok) throw new Error("Server Response Error");
            const data = await res.json();
            
            // 原子化数据同步：强对齐云端，绝不覆盖
            window.ERP_STORE.orders = data || [];
            
            if (mv) mv.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
            
            // 🛡️ 【终极修复】彻底切断无限死循环链条
        } catch (e) {
            console.error("D1 API 连接失败:", e);
            if (mv) {
                mv.innerHTML = `
                    <div class="p-16 text-center space-y-3">
                        <div class="text-rose-500 font-black text-sm">⚠️ API连接失败，请确认后端 Workers 状态</div>
                        <div class="text-slate-300 text-[10px] font-mono break-all">${getBaseUrl()}/api/orders</div>
                    </div>`;
            }
        }
    };

    // --- 2. 主页面大盘渲染 (紫色圆角 UI 还原) ---
    window.renderOrders = function() {
        const isZh = window.ERP_STORE.current_lang === "zh";
        
        if (window.ERP_STORE.filter_status === undefined) {
            window.ERP_STORE.filter_status = null; 
        }
        const currentFilter = window.ERP_STORE.filter_status;

        const statuses = ["等待国内发货", "集运仓已到货", "跨境清关运输中", "买家已完成收货", "已取消"];
        const statusLabels = {
            "等待国内发货": isZh ? "🕒 待发货" : "Chờ giao",
            "集运仓已到货": isZh ? "📦 已到仓" : "Đến kho",
            "跨境清关运输中": isZh ? "🚛 运输中" : "Vận chuyển",
            "买家已完成收货": isZh ? "✅ 已签收" : "Đã nhận",
            "已取消": isZh ? "❌ 已取消" : "Đã hủy"
        };

        // 药丸过滤器 HTML
        let pillsHTML = `
            <button onclick="window.filterOrdersByStatus(null)" class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${currentFilter === null ? 'bg-[#5D5CDE] text-white border-[#5D5CDE] shadow-sm' : 'bg-white text-slate-500 border-slate-200'}" style="touch-action: manipulation;">
                ${isZh ? "全部正常" : "Tất cả"}
            </button>
        `;

        statuses.forEach(st => {
            const isActive = currentFilter === st;
            let activeClass = isActive ? "bg-[#5D5CDE] text-white border-[#5D5CDE] shadow-sm" : "bg-white text-slate-500 border-slate-200";
            if (st === "已取消" && isActive) activeClass = "bg-slate-500 text-white border-slate-500 shadow-sm";

            pillsHTML += `
                <button onclick="window.filterOrdersByStatus('${st}')" class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${activeClass}" style="touch-action: manipulation;">
                    ${statusLabels[st]}
                </button>
            `;
        });

        // ⚡ 状态降级分类路由过滤算法 (多端安全隔离核心)
        let filteredOrders = window.ERP_STORE.orders.filter(ord => {
            let actualItems = ord.items;
            if (typeof actualItems === "string") {
                try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
            }
            actualItems = actualItems || [];

            if (currentFilter === "Spacer" || currentFilter === "已取消") {
                return ord.status === "已取消";
            }
            if (ord.status === "Alice" || ord.status === "已取消") return false;
            if (currentFilter === null) return true;

            let hasUnshipped = false;
            let hasInWarehouse = false;
            let hasInTransit = false;
            let hasReceived = false;

            actualItems.forEach(item => {
                if (item.status === "等待国内发货") hasUnshipped = true;
                if (item.status === "集运仓已到货") hasInWarehouse = true;
                if (item.status === "跨境清关运输中") hasInTransit = true;
                if (item.status === "买家已完成收货") hasReceived = true;
            });

            if (currentFilter === "等待国内发货") {
                return hasUnshipped || (!hasInWarehouse && !hasInTransit && !hasReceived);
            }
            if (currentFilter === "集运仓已到货") {
                return !hasUnshipped && hasInWarehouse;
            }
            if (currentFilter === "跨境清关运输中") {
                return !hasUnshipped && !hasInWarehouse && hasInTransit;
            }
            if (currentFilter === "买家已完成收货") {
                return !hasUnshipped && !hasInWarehouse && !hasInTransit && hasReceived;
            }
            return ord.status === currentFilter;
        });

        let listHTML = "";
        filteredOrders.forEach((ord, index) => {
            let itemsSummary = "";
            let totalCny = 0;
            
            let actualItems = ord.items;
            if (typeof actualItems === "string") {
                try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
            }
            actualItems = actualItems || [];

            actualItems.forEach(item => {
                totalCny += parseFloat(item.cny || 0);

                let subBadgeStyle = "bg-slate-100 text-slate-500";
                if (item.status === "集运仓已到货") subBadgeStyle = "bg-amber-100 text-amber-700";
                if (item.status === "跨境清关运输中") subBadgeStyle = "bg-indigo-100 text-indigo-700";
                if (item.status === "买家已完成收货") subBadgeStyle = "bg-emerald-100 text-emerald-700";

                itemsSummary += `
                    <div class="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60 text-xs mt-1">
                        <div class="max-w-[65%] truncate">
                            <span class="text-slate-400 font-black">[${item.platform || '淘宝'}]</span>
                            <span class="text-slate-700 font-bold ml-1">${item.name || '未命名商品'}</span>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <span class="text-[9px] px-1.5 py-0.5 rounded-md font-black scale-90 ${subBadgeStyle}">${item.status.replace("🕒 ","").replace("📦 ","").replace("运输中","Vận chuyển").replace("已到仓","Đến kho").replace("待发货","Chờ giao").replace("已签收","Đã nhận")}</span>
                            <span class="font-mono font-black text-slate-500">¥${item.cny || 0}</span>
                        </div>
                    </div>
                `;
            });

            const isCanceled = ord.status === "已取消";
            const cardOpacity = isCanceled ? "opacity-65 bg-slate-50/70 border-slate-200" : "bg-white border-slate-100";
            
            let customerName = ord.customer || "未知买家";
            if (customerName.startsWith("CUST-CUST-")) {
                customerName = customerName.replace("CUST-CUST-", "");
            }

            let globalStatusLabel = ord.status || "等待国内发货";
            let unShippedCount = actualItems.filter(i => i.status === "等待国内发货").length;
            if (unShippedCount > 0 && unShippedCount < actualItems.length) {
                globalStatusLabel = isZh ? "⚠️ 部分已到仓" : "⚠️ Đến kho 1 phần";
            }

            listHTML += `
                <div class="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100/80 space-y-4 transition-all ${cardOpacity} mb-4">
                    <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-black text-slate-900">${customerName}</span>
                                ${isCanceled ? `<span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-black">已取消</span>` : ''}
                            </div>
                            <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">${ord.id}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">${globalStatusLabel}</span>
                            <button onclick="window.openOrderDetailModalForManage(${index})" class="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-black active:bg-[#5D5CDE] transition-all shadow-sm">
                                ${isZh ? '管理' : 'Quản lý'}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2">${itemsSummary}</div>
                    <div class="flex justify-between items-center pt-2 text-xs">
                        <span class="text-slate-400 font-bold">${isZh?'整单内部本金':'Tổng tiền vốn'}:</span>
                        <span class="font-mono font-black text-slate-900 text-sm">¥${totalCny.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            `;
        });

        if (listHTML === "") {
            listHTML = `<div class="bg-white rounded-[32px] p-12 border border-slate-100 text-center italic text-slate-400 text-xs shadow-sm">${isZh?'该分组下暂无代购订单':'Không có dữ liệu đơn hàng'}</div>`;
        }

        return `
            <div class="space-y-4 w-full max-w-md mx-auto pb-12">
                <button id="btn-trigger-add-order" onclick="window.openCreateOrderModalDirectly()" class="w-full bg-[#5D5CDE] text-white py-3.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                    <i class="fa-solid fa-cart-plus"></i> ${isZh ? '新建中越合并代购订单' : 'Tạo đơn hàng mới'}
                </button>
                <div class="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">${pillsHTML}</div>
                <div class="space-y-4">${listHTML}</div>
            </div>
        `;
    };

    window.filterOrdersByStatus = function(status) {
        window.ERP_STORE.filter_status = status;
        window.fetchLatestOrdersAndRender();
    };

    window.openCreateOrderModalDirectly = function() {
        window.openOrderFormModal(null);
    };

    // --- 3. 新建/修改大表单弹窗还原 ---
    window.openOrderFormModal = function(editIndex = null) {
        const existModal = document.getElementById("order-form-modal");
        if(existModal) existModal.remove();

        const isEdit = editIndex !== null;
        const isZh = window.ERP_STORE.current_lang === "zh";
        const targetOrder = isEdit ? window.ERP_STORE.orders[editIndex] : { id: "", customer: "", buyer_vnd: 0, items: [] };

        let customerOptions = "";
        window.ERP_STORE.customers.forEach(c => {
            const selected = (!isEdit && window.ERP_STORE.customers.length === 1) || (isEdit && targetOrder.customer === c.name) ? "selected" : "";
            customerOptions += `<option value="${c.name}" ${selected}>${c.id.replace("CUST-", "")} - ${c.name}</option>`;
        });

        let itemsFormHTML = "";
        let actualItems = targetOrder.items || [];
        if (typeof actualItems === "string") {
            try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
        }

        if (isEdit && actualItems.length > 0) {
            actualItems.forEach((item) => {
                itemsFormHTML += window.createPlatformItemRowTemplate(item.platform, item.name, item.cny, item.track, item.status, item.express_company);
            });
        } else {
            itemsFormHTML += window.createPlatformItemRowTemplate("淘宝", "", "", "", "等待国内发货", "中通");
        }

        const modalHTML = `
            <div id="order-form-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-4">
                <div class="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 max-h-[88vh] flex flex-col animate-fadeIn">
                    <div class="flex justify-between items-center border-b border-slate-100 p-6 shrink-0">
                        <h3 class="text-sm font-black text-slate-800"><i class="fa-solid fa-cart-plus text-[#5D5CDE]"></i> ${isEdit ? (isZh?'修改合并代购订单':'Chỉnh sửa đơn') : (isZh?'创建新代购订单':'Thêm đơn mới')}</h3>
                        <button type="button" onclick="window.closeOrderFormModalActual()" class="text-slate-300 text-lg hover:text-slate-500">✕</button>
                    </div>
                    <form id="add-order-form-actual" class="p-6 space-y-4 overflow-y-auto grow text-xs font-bold text-slate-600">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">${isZh?'选择越南买家':'Chọn khách hàng'}</label>
                        <select id="mo-customer-select" class="w-full bg-slate-50 rounded-2xl p-4 mt-2 border-none font-bold text-slate-700 appearance-none shadow-inner">${customerOptions}</select>
                        <div class="flex justify-between items-center pt-2">
                            <label class="text-slate-400">${isZh?'采购商品明细':'Danh sách sản phẩm'}</label>
                            <button type="button" onclick="window.addItemRowToFormActualDynamic()" class="text-[#5D5CDE] font-black flex items-center gap-1 text-[11px]">+ ${isZh?'增加一件商品':'Thêm hàng'}</button>
                        </div>
                        <div id="mo-items-container-actual" class="space-y-3">${itemsFormHTML}</div>
                        <div class="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                            <div class="flex justify-between items-center"><span class="text-slate-400">${isZh?'内部总本金估算':'Tổng vốn CNY'}:</span><span id="mo-total-cny-display-actual" class="font-mono font-black text-slate-900">¥0</span></div>
                            <div class="pt-4 border-t border-slate-200/50">
                                <label class="block text-indigo-950 font-bold mb-1">${isZh?'收取买家固定货款 (VND)':'Số tiền thu khách (VND)'}</label>
                                <input type="number" id="mo-buyer-vnd-actual" value="${isEdit ? targetOrder.buyer_vnd : ''}" required class="w-full text-2xl font-black text-[#5D5CDE] bg-transparent border-none p-0 text-right" placeholder="0">
                            </div>
                        </div>
                    </form>
                    <div class="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                        <button type="button" onclick="window.closeOrderFormModalActual()" class="w-1/4 bg-white border border-slate-200 text-slate-500 py-4 rounded-2xl font-bold">${isZh?'取消':'Hủy'}</button>
                        <button type="button" onclick="window.submitOrderFormActualAction(${editIndex})" class="flex-grow bg-[#5D5CDE] text-white py-4 rounded-2xl font-black shadow-md">${isZh?'保存全部数据入库':'Lưu đơn hàng'}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        window.calculateFormTotalCnyActual();
    };

    window.createPlatformItemRowTemplate = function(platform, name, cny, track, status, expressCompany = "中通") {
        const isZh = window.ERP_STORE.current_lang === "zh";
        const id = 'row-' + Math.random().toString(36).substr(2, 9);
        const pOpts = ["淘宝", "1688", "拼多多", "咸鱼", "其他"].map(p => `<option value="${p}" ${platform === p ? 'selected' : ''}>${p}</option>`).join("");
        const expOpts = ["中通", "圆通", "申通", "韵达", "顺丰", "极兔", "邮政", "京东"].map(e => `<option value="${e}" ${expressCompany === e ? 'selected' : ''}>${e}</option>`).join("");
        const sOpts = [
            { v: "等待国内发货", t: isZh ? "🕒 待发货" : "🕒 Chờ giao" },
            { v: "集运仓已到货", t: isZh ? "📦 已到仓" : "📦 Đến kho" },
            { v: "跨境清关运输中", t: isZh ? "🚛 运输中" : "🚛 Vận chuyển" },
            { v: "买家已完成收货", t: isZh ? "✅ 已签收" : "✅ Đã nhận" }
        ].map(s => `<option value="${s.v}" ${status === s.v ? 'selected' : ''}>${s.t}</option>`).join("");

        return `
            <div id="${id}" class="mo-item-row-actual bg-white border border-slate-100 rounded-[28px] p-4 shadow-sm relative group">
                <button type="button" onclick="window.removeItemRowFromFormActual('${id}')" class="absolute -right-2 -top-2 bg-red-50 text-red-400 w-8 h-8 rounded-full flex items-center justify-center text-xs opacity-100 z-10">✕</button>
                <div class="flex gap-2 mb-3">
                    <select class="mo-platform-select bg-slate-50 rounded-xl text-xs px-3 py-2 border-none font-black text-slate-500 w-1/3">${pOpts}</select>
                    <input type="text" class="mo-name-input flex-1 font-bold text-sm bg-slate-50 rounded-xl px-4 py-2 border-none" value="${name}" placeholder="${isZh?'商品名称':'Tên sản phẩm'}" required>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="relative flex items-center bg-slate-50 rounded-xl px-3">
                        <span class="text-xs text-slate-300 font-bold mr-1">¥</span>
                        <input type="number" step="any" class="mo-cny-input w-full bg-transparent py-2.5 text-sm font-black text-slate-700 border-none" value="${cny}" placeholder="${isZh?'本金':'Vốn'}" oninput="window.calculateFormTotalCnyActual()" required>
                    </div>
                    <select class="mo-express-select bg-slate-50 rounded-xl text-xs px-3 py-2.5 border-none font-bold text-slate-600">${expOpts}</select>
                </div>
                <div class="flex items-center gap-2 mt-3 bg-slate-50 rounded-xl px-3 py-1.5">
                    <input type="text" class="mo-track-input w-full text-[10px] text-slate-400 bg-transparent border-none" value="${track || ''}" placeholder="${isZh?'国内单号 (选填)':'Mã vận đơn'}">
                    <select class="mo-status-select bg-transparent border-none text-[10px] font-bold text-slate-400 w-2/5">${sOpts}</select>
                </div>
            </div>
        `;
    };

    window.calculateFormTotalCnyActual = function() {
        let total = 0;
        document.querySelectorAll(".mo-cny-input").forEach(input => { total += (parseFloat(input.value) || 0); });
        const el = document.getElementById("mo-total-cny-display-actual");
        if(el) el.innerText = "¥" + total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        const vndEl = document.getElementById("mo-buyer-vnd-actual");
        if(vndEl && (!vndEl.value || vndEl.value == 0)) { vndEl.value = Math.round(total * VND_RATE); }
    };

    window.addItemRowToFormActualDynamic = function() {
        const container = document.getElementById("mo-items-container-actual");
        if(container) container.insertAdjacentHTML('beforeend', window.createPlatformItemRowTemplate("淘宝", "", "", "", "等待国内发货", "中通"));
    };

    window.removeItemRowFromFormActual = function(rowId) {
        const container = document.getElementById("mo-items-container-actual");
        if(container && container.querySelectorAll(".mo-item-row-actual").length > 1) {
            const el = document.getElementById(rowId);
            if(el) el.remove();
            window.calculateFormTotalCnyActual();
        }
    };

    window.closeOrderFormModalActual = function() {
        const m = document.getElementById("order-form-modal");
        if(m) m.remove();
    };

    // --- 4. 【核心修复位置】云端数据写入与同步 ---
    window.submitOrderFormActualAction = async function(editIndex) {
        const isEdit = editIndex !== null;
        const isZh = window.ERP_STORE.current_lang === "zh";
        const customer = document.getElementById("mo-customer-select").value;
        const buyerVnd = parseFloat(document.getElementById("mo-buyer-vnd-actual").value) || 0;
        const itemsList = [];
        let isFormValid = true;

        document.querySelectorAll(".mo-item-row-actual").forEach(row => {
            const name = row.querySelector(".mo-name-input").value.trim();
            const cny = parseFloat(row.querySelector(".mo-cny-input").value) || 0;
            if(!name) isFormValid = false;
            itemsList.push({
                platform: row.querySelector(".mo-platform-select").value,
                name: name,
                cny: cny,
                express_company: row.querySelector(".mo-express-select").value,
                track: row.querySelector(".mo-track-input").value.trim(),
                status: row.querySelector(".mo-status-select").value
            });
        });

        if(!isFormValid || itemsList.length === 0) {
            alert(isZh ? "❌ 请完整填写商品名称！" : "Vui lòng điền đủ thông tin!");
            return;
        }

        let targetId = isEdit ? window.ERP_STORE.orders[editIndex].id : "#ORD-" + Math.floor(10000 + Math.random() * 90000);
        
        const payload = {
            id: targetId,
            customer: customer,
            buyer_vnd: buyerVnd,
            items: itemsList,
            status: isEdit ? window.ERP_STORE.orders[editIndex].status : "等待国内发货"
        };

        const res = await fetch(`${getBaseUrl()}/api/orders/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // ✨ 关键补丁：保存后立即刷新数据，解决不显示问题
            await window.fetchLatestOrdersAndRender();
            window.closeOrderFormModalActual();
            
            // 安全调用提示框
            if (typeof window.showErpToast === "function") {
                window.showErpToast(isZh ? "🎉 订单已存入数据库！" : "🎉 Đã lưu thành công!");
            } else {
                console.log("订单已存入数据库");
            }
        }
    };

    // 初始化
    document.addEventListener("DOMContentLoaded", () => {
        window.fetchLatestOrdersAndRender();
    });

})();
