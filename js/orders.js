// =========================================================
// 📦 中越通跨境代购 ERP - 订单业务 H5 核心模块 (全局无错大圆满完全体)
// =========================================================

function renderOrders() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    if (window.ERP_STORE.filter_status === undefined) {
        window.ERP_STORE.filter_status = null; 
    }
    const currentFilter = window.ERP_STORE.filter_status;

    // 📱 H5 顶级多维动态药丸导航控制台
    const statuses = ["等待国内发货", "集运仓已到货", "跨境清关运输中", "买家已完成收货", "已取消"];
    const statusLabels = {
        "等待国内发货": isZh ? "🕒 待发货" : "Chờ giao",
        "集运仓已到货": isZh ? "📦 已到仓" : "Đến kho",
        "跨境清关运输中": isZh ? "🚛 运输中" : "Vận chuyển",
        "买家已完成收货": isZh ? "✅ 已签收" : "Đã nhận",
        "已取消": isZh ? "❌ 已取消" : "Đã hủy"
    };

    let pillsHTML = `
        <button onclick="filterOrdersByStatus(null)" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${currentFilter === null ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200'}" style="touch-action: manipulation;">
            ${isZh ? "全部正常" : "Tất cả"}
        </button>
    `;

    statuses.forEach(st => {
        const isActive = currentFilter === st;
        let activeClass = isActive ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-500 border-slate-200";
        if (st === "已取消" && isActive) activeClass = "bg-slate-500 text-white border-slate-500 shadow-sm";

        pillsHTML += `
            <button onclick="filterOrdersByStatus('${st}')" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${activeClass}" style="touch-action: manipulation;">
                ${statusLabels[st]}
            </button>
        `;
    });

    // ⚡ 核心全局测试进化 1：精细化全自动化状态降级分类路由算法
    let filteredOrders = window.ERP_STORE.orders.filter(ord => {
        // 先解压商品清单
        let actualItems = ord.items;
        if (typeof actualItems === "string") {
            try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
        }
        actualItems = actualItems || [];

        // 如果用户点的是“已取消”胶囊
        if (currentFilter === "已取消") {
            return ord.status === "已取消";
        }
        
        // 过滤掉已被主动取消的废单
        if (ord.status === "已取消") return false;

        // 如果用户点的是“全部正常”胶囊
        if (currentFilter === null) return true;

        // 【关键防御核心】：遍历这笔订单下的所有单独包裹散件
        let hasUnshipped = false;      // 是否包含待发货件
        let hasInWarehouse = false;    // 是否包含已到仓件
        let hasInTransit = false;      // 是否包含运输中件
        let hasReceived = false;       // 是否包含已签收件

        actualItems.forEach(item => {
            if (item.status === "等待国内发货") hasUnshipped = true;
            if (item.status === "集运仓已到货") hasInWarehouse = true;
            if (item.status === "跨境清关运输中") hasInTransit = true;
            if (item.status === "买家已完成收货") hasReceived = true;
        });

        // 🛡️ 状态降级大闸闭合判定：
        // 只要还有1件货没发，不管别的货到哪了，整单死卡在「等待国内发货」分类，拒绝滑走！
        if (currentFilter === "等待国内发货") {
            return hasUnshipped || (!hasInWarehouse && !hasInTransit && !hasReceived);
        }
        
        // 只有且必须当未发件全部清空，且最慢的件刚到集运仓时，才准滑入「集运仓已到货」
        if (currentFilter === "集运仓已到货") {
            return !hasUnshipped && hasInWarehouse;
        }

        // 只有所有件都离开国内，且最慢的在跨国运输中，才滑入「跨境清关运输中」
        if (currentFilter === "跨境清关运输中") {
            return !hasUnshipped && !hasInWarehouse && hasInTransit;
        }

        // 必须且只有所有件全部被越南买家签收，才滑入「买家已完成收货」
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

            // ⚡ 核心全局测试进化 2：主界面散件状态标签直接外显打印，一眼识破“部分到仓”
            let subBadgeStyle = "bg-slate-100 text-slate-500";
            if (item.status === "集运仓已到货") subBadgeStyle = "bg-amber-100 text-amber-700";
            if (item.status === "跨境清关运输中") subBadgeStyle = "bg-indigo-100 text-indigo-700";
            if (item.status === "买家已完成收货") subBadgeStyle = "bg-emerald-100 text-emerald-700";

            itemsSummary += `
                <div class="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60 text-xs">
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

        // 动态计算整单宏观状态，显示在大卡片右上角
        let globalStatusLabel = ord.status || "等待国内发货";
        let unShippedCount = actualItems.filter(i => i.status === "等待国内发货").length;
        if (unShippedCount > 0 && unShippedCount < actualItems.length) {
            globalStatusLabel = isZh ? "⚠️ 部分已到仓" : "⚠️ Đến kho 1 phần";
        }

        listHTML += `
            <div class="bg-white rounded-2xl p-5 shadow-sm border space-y-4 transition-all ${cardOpacity}">
                <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-black text-slate-900">${customerName}</span>
                            ${isCanceled ? `<span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-black">已取消</span>` : ''}
                        </div>
                        <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">${ord.id}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">${globalStatusLabel}</span>
                        <button onclick="openOrderDetailModalForManage(${index})" class="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-black active:bg-indigo-600 transition-all shadow-sm">
                            ${isZh ? '管理' : 'Quản lý'}
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    ${itemsSummary}
                </div>

                <div class="flex justify-between items-center pt-2 text-xs">
                    <span class="text-slate-400 font-bold">${isZh?'整单内部本金':'Tổng tiền vốn'}:</span>
                    <span class="font-mono font-black text-slate-900 text-sm">¥${totalCny.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
        `;
    });

    if (listHTML === "") {
        listHTML = `<div class="bg-white p-12 rounded-2xl border border-slate-100 text-center italic text-slate-400 text-xs">${isZh?'该分组下暂无代购订单':'Không có dữ liệu đơn hàng'}</div>`;
    }

    return `
        <div class="space-y-4 w-full max-w-md mx-auto pb-12">
            <button id="btn-trigger-add-order" onclick="openCreateOrderModalDirectly()" class="w-full bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                <i class="fa-solid fa-cart-plus"></i> ${isZh ? '新建中越合并代购订单' : 'Tạo đơn hàng mới'}
            </button>
            
            <div class="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                ${pillsHTML}
            </div>

            <div class="space-y-4">
                ${listHTML}
            </div>
        </div>
    `;
}

window.filterOrdersByStatus = function(status) {
    window.ERP_STORE.filter_status = status;
    const mv = document.getElementById("main-view");
    if(mv) mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
};

window.init_orders = function() {
    const btn = document.getElementById("btn-trigger-add-order");
    if(btn) {
        btn.removeEventListener("click", openCreateOrderModalDirectly);
        btn.addEventListener("click", openCreateOrderModalDirectly);
    }
};

window.openCreateOrderModalDirectly = function() {
    openOrderFormModal(null);
};

// =========================================================
// 🔄 动态新建与修改大表单核心
// =========================================================
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
            itemsFormHTML += createPlatformItemRowTemplate(item.platform, item.name, item.cny, item.track, item.status, item.express_company);
        });
    } else {
        itemsFormHTML += createPlatformItemRowTemplate("淘宝", "", "", "", "等待国内发货", "中通");
    }

    const modalHTML = `
        <div id="order-form-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col animate-fadeIn">
                
                <div class="flex justify-between items-center border-b border-slate-100 p-4 shrink-0">
                    <h3 class="text-xs font-black text-slate-800"><i class="fa-solid fa-cart-plus text-indigo-500"></i> ${isEdit ? (isZh?'修改合并代购订单':'Chỉnh sửa đơn hàng') : (isZh?'创建新代购订单':'Thêm đơn hàng mới')}</h3>
                    <button type="button" onclick="closeOrderFormModalActual()" class="text-slate-400 text-lg">✕</button>
                </div>
                
                <form id="add-order-form-actual" class="p-4 space-y-4 overflow-y-auto grow text-xs font-bold text-slate-600">
                    <div>
                        <label class="block text-slate-400 mb-1">${isZh?'选择越南买家':'Chọn khách hàng'}</label>
                        <select id="mo-customer-select" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-black text-slate-800">
                            ${customerOptions}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <label class="text-slate-400">${isZh?'采购商品明细':'Danh sách sản phẩm'}</label>
                            <button type="button" onclick="addItemRowToFormActualDynamic()" class="text-indigo-600 font-black flex items-center gap-1 text-[11px]"><i class="fa-solid fa-circle-plus"></i> ${isZh?'增加一件商品':'Thêm hàng'}</button>
                        </div>
                        <div id="mo-items-container-actual" class="space-y-3">
                            ${itemsFormHTML}
                        </div>
                    </div>

                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 shrink-0">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-400">${isZh?'内部总本金估算':'Tổng vốn CNY'}:</span>
                            <span id="mo-total-cny-display-actual" class="font-mono font-black text-slate-900 text-sm">¥0</span>
                        </div>
                        <div>
                            <label class="block text-indigo-950 font-bold mb-1">${isZh?'收取买家固定货款 (VND)':'Số tiền thu khách (VND)'}</label>
                            <input type="number" id="mo-buyer-vnd-actual" value="${isEdit ? targetOrder.buyer_vnd : ''}" required class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-black text-right text-indigo-600 focus:outline-none text-sm" placeholder="0 ₫">
                        </div>
                    </div>
                </form>

                <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0">
                    <button type="button" onclick="closeOrderFormModalActual()" class="w-1/4 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold">${isZh?'取消':'Hủy'}</button>
                    <button type="button" onclick="submitOrderFormActualAction(${editIndex})" class="flex-grow bg-indigo-600 text-white py-3 rounded-xl font-black shadow-md active:scale-[0.98] transition-all">${isZh?'保存全部数据入库':'Lưu đơn hàng'}</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    calculateFormTotalCnyActual();
    if(window.pushModalHistoryState) window.pushModalHistoryState("order-form-modal");
};

function createPlatformItemRowTemplate(platform, name, cny, track, status, expressCompany = "中通") {
    const pOpts = ["淘宝", "1688", "拼多多", "咸鱼", "其他"].map(p => `<option value="${p}" ${platform === p ? 'selected' : ''}>${p}</option>`).join("");
    const isZh = window.ERP_STORE.current_lang === "zh";
    const expressCompanies = ["中通", "圆通", "申通", "韵达", "顺丰", "极兔", "邮政", "京东"];
    const expOpts = expressCompanies.map(e => `<option value="${e}" ${expressCompany === e ? 'selected' : ''}>${e}</option>`).join("");

    const sOpts = [
        { v: "等待国内发货", t: isZh ? "🕒 待发货" : "🕒 Chờ giao" },
        { v: "集运仓已到货", t: isZh ? "📦 已到仓" : "📦 Đến kho" },
        { v: "跨境清关运输中", t: isZh ? "🚛 运输中" : "🚛 Vận chuyển" },
        { v: "买家已完成收货", t: isZh ? "✅ 已签收" : "✅ Đã nhận" }
    ].map(s => `<option value="${s.v}" ${status === s.v ? 'selected' : ''}>${s.t}</option>`).join("");

    return `
        <div class="mo-item-row-actual bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 relative pt-7">
            <button type="button" onclick="removeItemRowFromFormActual(this)" class="absolute top-2 right-3 text-rose-500 font-bold text-xs">✕ ${isZh?'删除':'Xóa'}</button>
            <div class="flex gap-1.5">
                <select class="mo-platform-select bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700 w-1/3">${pOpts}</select>
                <input type="text" class="mo-name-input bg-white border border-slate-200 rounded-xl p-2 font-bold flex-grow" value="${name}" placeholder="${isZh?'商品名称':'Tên sản phẩm'}" required>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
                <div class="relative">
                    <span class="absolute left-3 top-2 text-slate-400 font-mono">¥</span>
                    <input type="number" step="any" class="mo-cny-input w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-2 text-right font-mono font-bold text-slate-700" value="${cny}" placeholder="${isZh?'本金':'Vốn'}" oninput="calculateFormTotalCnyActual()" onblur="calculateFormTotalCnyActual()" onchange="calculateFormTotalCnyActual()" required>
                </div>
                <select class="mo-express-select bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-600">${expOpts}</select>
            </div>
            <div class="flex gap-1.5 items-center">
                <input type="text" class="mo-track-input bg-white border border-slate-200 rounded-xl p-2 font-mono text-[11px] flex-grow" value="${track || ''}" placeholder="${isZh?'国内单号 (选填)':'Mã vận đơn'}">
                <select class="mo-status-select bg-white border border-slate-200 rounded-xl p-2 font-bold text-[11px] text-slate-600">${sOpts}</select>
            </div>
        </div>
    `;
}

window.calculateFormTotalCnyActual = function() {
    let total = 0;
    document.querySelectorAll(".mo-cny-input").forEach(input => { 
        let rawVal = input.value.trim();
        let val = parseFloat(rawVal) || 0; 
        total += val;
    });
    const el = document.getElementById("mo-total-cny-display-actual");
    if(el) el.innerText = "¥" + total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

window.addItemRowToFormActualDynamic = function() {
    const container = document.getElementById("mo-items-container-actual");
    if(container) {
        container.insertAdjacentHTML('beforeend', createPlatformItemRowTemplate("淘宝", "", "", "", "等待国内发货", "中通"));
    }
};

window.removeItemRowFromFormActual = function(btn) {
    const container = document.getElementById("mo-items-container-actual");
    if(container && container.querySelectorAll(".mo-item-row-actual").length > 1) {
        btn.closest(".mo-item-row-actual").remove();
        calculateFormTotalCnyActual();
    } else {
        alert(window.ERP_STORE.current_lang === "zh" ? "⚠️ 至少保留一项商品明细" : "Phải giữ lại nhất 1 mặt hàng");
    }
};

window.closeOrderFormModalActual = function() {
    const m = document.getElementById("order-form-modal");
    if(m) m.remove();
};

window.submitOrderFormActualAction = async function(editIndex) {
    const isEdit = editIndex !== null;
    const isZh = window.ERP_STORE.current_lang === "zh";

    const customer = document.getElementById("mo-customer-select").value;
    const buyerVnd = parseFloat(document.getElementById("mo-buyer-vnd-actual").value) || 0;

    const itemsList = [];
    let isFormValid = true;

    document.querySelectorAll(".mo-item-row-actual").forEach(row => {
        const name = row.querySelector(".mo-name-input").value.trim();
        let rawCnyStr = row.querySelector(".mo-cny-input").value.toString().trim();
        const cny = parseFloat(rawCnyStr) || 0;
        
        if(!name || (cny <= 0 && rawCnyStr === "")) {
            isFormValid = false;
        }

        itemsList.push({
            platform: row.querySelector(".mo-platform-select").value,
            name: name,
            cny: cny,
            express_company: row.querySelector(".mo-express-select").value,
            track: row.querySelector(".mo-track-input").value.trim(),
            status: row.querySelector(".mo-status-select").value
        });
    });

    let finalCheckTotal = 0;
    itemsList.forEach(it => finalCheckTotal += it.cny);
    
    if (finalCheckTotal > 0 && isFormValid === false) {
        isFormValid = true; 
    }

    if(!isFormValid || itemsList.length === 0 || finalCheckTotal <= 0) {
        showErpToast(isZh ? "❌ 请完整填写商品名称与本金金额！" : "Vui lòng điền đủ thông tin!");
        return;
    }

    let targetId = isEdit ? window.ERP_STORE.orders[editIndex].id : "#ORD-" + Math.floor(10000 + Math.random() * 90000);
    let currentShippingFee = isEdit ? (window.ERP_STORE.orders[editIndex].shipping_fee_cny || 0) : 0;

    // 自动判定大盘汇总状态
    let nextGlobalStatus = "等待国内发货";
    let hasUnshipped = itemsList.some(i => i.status === "等待国内发货");
    let hasWarehouse = itemsList.some(i => i.status === "集运仓已到货");
    let hasTransit = itemsList.some(i => i.status === "跨境清关运输中");
    let hasReceived = itemsList.some(i => i.status === "买家已完成收货");

    if (!hasUnshipped && hasWarehouse) nextGlobalStatus = "集运仓已到货";
    else if (!hasUnshipped && !hasWarehouse && hasTransit) nextGlobalStatus = "跨境清关运输中";
    else if (!hasUnshipped && !hasWarehouse && !hasTransit && hasReceived) nextGlobalStatus = "买家已完成收货";

    const payload = {
        id: targetId,
        customer: customer,
        buyer_vnd: buyerVnd,
        shipping_fee_cny: currentShippingFee,
        items: itemsList,
        status: isEdit ? window.ERP_STORE.orders[editIndex].status : nextGlobalStatus
    };

    const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        if (isEdit) {
            window.ERP_STORE.orders[editIndex].customer = customer;
            window.ERP_STORE.orders[editIndex].buyer_vnd = buyerVnd;
            window.ERP_STORE.orders[editIndex].items = itemsList;
            window.ERP_STORE.orders[editIndex].status = nextGlobalStatus;
        } else {
            window.ERP_STORE.orders.unshift(payload);
        }

        const activeFormModal = document.getElementById("order-form-modal");
        if(activeFormModal) activeFormModal.remove();
        
        const mv = document.getElementById("main-view");
        if(mv) mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
        window.init_orders();
        
        showErpToast(isZh ? "🎉 订单已成功存储入库！" : "🎉 Đã lưu đơn hàng thành công!");
    } else {
        showErpToast("D1 Save Connection Error");
    }
};

// =========================================================
// 🔄 📱 核心管理控制台面板
// =========================================================
window.openOrderDetailModalForManage = function(index) {
    const existManage = document.getElementById("order-manage-modal");
    if(existManage) existManage.remove();

    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    const orderIdTail = ord.id.split('-')[1] || ord.id;
    let customerName = ord.customer || "未知买家";
    if (customerName.startsWith("CUST-CUST-")) customerName = customerName.replace("CUST-CUST-", "");

    let actualItems = ord.items;
    if (typeof actualItems === "string") {
        try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
    }
    actualItems = actualItems || [];

    let subItemsStatusRowsHTML = "";
    actualItems.forEach((item, itemIdx) => {
        let statusBadgeClass = "bg-slate-100 text-slate-600";
        if (item.status === "集运仓已到货") statusBadgeClass = "bg-amber-50 text-amber-600 border border-amber-200/60";
        if (item.status === "跨境清关运输中") statusBadgeClass = "bg-indigo-50 text-indigo-600 border border-indigo-200/60";
        if (item.status === "买家已完成收货") statusBadgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-200/60";
        if (item.status === "已取消") statusBadgeClass = "bg-rose-50 text-rose-500 line-through";

        subItemsStatusRowsHTML += `
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-3 relative animate-fadeIn">
                <div class="flex justify-between items-start gap-2">
                    <div class="text-[11px] font-black text-slate-800 leading-tight break-all flex-grow pl-0.5">
                        <span class="text-slate-400 font-bold mr-1">[${item.platform || '淘宝'}]</span>${item.name}
                    </div>
                    <button type="button" onclick="toggleSingleItemStatusInModal(${index}, ${itemIdx})" class="text-[10px] font-black px-2 py-1 rounded-xl ${statusBadgeClass} shrink-0 active:scale-95 transition-all">
                        ${item.status}
                    </button>
                </div>
                
                <div class="flex gap-1.5 items-center">
                    <div class="relative flex-grow">
                        <span class="absolute left-3 top-2.5 text-slate-400 text-[10px]"><i class="fa-solid fa-barcode"></i></span>
                        <input type="text" id="fast-track-input-${index}-${itemIdx}" value="${item.track || ''}" 
                            placeholder="${isZh ? '直接粘贴单号...' : 'Dán mã vận đơn...'}" 
                            onblur="fastSaveSingleTrackAndCompany(${index}, ${itemIdx})"
                            class="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-[11px] font-mono font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all">
                    </div>
                    
                    <select id="fast-express-select-${index}-${itemIdx}" onchange="fastSaveSingleTrackAndCompany(${index}, ${itemIdx})"
                        class="bg-white border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-600 focus:outline-none">
                        <option value="中通" ${item.express_company === '中通' ? 'selected' : ''}>中通</option>
                        <option value="圆通" ${item.express_company === '圆通' ? 'selected' : ''}>圆通</option>
                        <option value="申通" ${item.express_company === '申通' ? 'selected' : ''}>申通</option>
                        <option value="韵达" ${item.express_company === '韵达' ? 'selected' : ''}>韵达</option>
                        <option value="顺丰" ${item.express_company === '顺丰' ? 'selected' : ''}>顺丰</option>
                        <option value="极兔" ${item.express_company === '极兔' ? 'selected' : ''}>极兔</option>
                        <option value="其他" ${item.express_company === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
            </div>
        `;
    });

    let fastButtonsConsoleHTML = "";
    if (ord.status !== "已取消") {
        fastButtonsConsoleHTML = `
            <div class="space-y-2 pt-1">
                <label class="block text-[10px] text-slate-400 font-black tracking-wider uppercase">${isZh ? '⚡ 快捷全单批量更新状态' : '⚡ CẬP NHẬT NHANH TOÀN BỘ ĐƠN'}</label>
                <div class="grid grid-cols-3 gap-2">
                    <button type="button" onclick="batchUpdateFullOrderStatusDirectly(${index}, '集运仓已到货')" class="bg-amber-500 text-white py-2.5 rounded-xl font-black text-xs shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5">
                        <i class="fa-solid fa-warehouse text-sm"></i>
                        <span>${isZh ? '已到仓' : 'Đến kho'}</span>
                    </button>
                    <button type="button" onclick="batchUpdateFullOrderStatusDirectly(${index}, '跨境清关运输中')" class="bg-indigo-600 text-white py-2.5 rounded-xl font-black text-xs shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5">
                        <i class="fa-solid fa-truck-fast text-sm"></i>
                        <span>${isZh ? '运输中' : 'Vận chuyển'}</span>
                    </button>
                    <button type="button" onclick="batchUpdateFullOrderStatusDirectly(${index}, '买家已完成收货')" class="bg-emerald-600 text-white py-2.5 rounded-xl font-black text-xs shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5">
                        <i class="fa-solid fa-circle-check text-sm"></i>
                        <span>${isZh ? '已签收' : 'Đã nhận'}</span>
                    </button>
                </div>
            </div>
        `;
    }

    let dangerZoneHTML = "";
    if (ord.status === "已取消") {
        dangerZoneHTML = `
            <div class="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center space-y-2 w-full">
                <span class="text-[11px] font-black text-amber-700 block">⚠️ ${isZh ? '订单处于整单取消状态' : 'Đơn hàng này đã bị hủy'}</span>
                <button type="button" onclick="toggleOrderCancelStatus(${index}, false)" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs shadow-sm">
                    <i class="fa-solid fa-rotate-left"></i> ${isZh ? '恢复此整单至正常代发货' : 'Khôi phục đơn hàng'}
                </button>
            </div>
        `;
    } else {
        dangerZoneHTML = `
            <div class="space-y-3 w-full border-t border-slate-100 pt-3">
                <button type="button" onclick="const activeM=document.getElementById('order-manage-modal'); if(activeM)activeM.remove(); openOrderFormModal(${index});" class="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:bg-slate-800">
                    <i class="fa-solid fa-square-pen"></i> ${isZh ? '进入具体订单修改金额明细' : 'Sửa chi tiết / Số tiền'}
                </button>
                <div class="flex gap-2">
                    <button type="button" onclick="toggleOrderCancelStatus(${index}, true)" class="w-1/2 bg-slate-100 text-slate-500 py-2.5 rounded-xl font-bold text-xs active:bg-slate-200">
                        <i class="fa-solid fa-ban text-rose-500"></i> ${isZh ? '客户整单取消' : 'Hủy toàn bộ đơn'}
                    </button>
                    <button type="button" onclick="triggerUltimateDeleteOrder('${ord.id}', '${orderIdTail}', ${index})" class="w-1/2 bg-rose-50 text-rose-600 py-2.5 rounded-xl font-black text-xs border border-rose-100 active:bg-rose-100">
                        <i class="fa-regular fa-trash-can"></i> ${isZh ? '彻底粉碎该单' : 'Xóa vĩnh viễn'}
                    </button>
                </div>
            </div>
        `;
    }

    // 微调大控制台弹窗的状态字样
    let currentGlobalStatusText = ord.status || "等待国内发货";
    let unShippedCount = actualItems.filter(i => i.status === "等待国内发货").length;
    if (unShippedCount > 0 && unShippedCount < actualItems.length) {
        currentGlobalStatusText = isZh ? "⚠️ 部分已到仓" : "⚠️ Đến kho 1 phần";
    }

    const modalHTML = `
        <div id="order-manage-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 my-auto animate-fadeIn p-5 space-y-4 max-h-[94vh] flex flex-col">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2 shrink-0">
                    <h3 class="text-xs font-black text-slate-800"><i class="fa-solid fa-sliders text-indigo-500"></i> ${isZh?'代购订单智能管理控制台':'Bảng điều khiển vận đơn'}</h3>
                    <button type="button" onclick="closeOrderModal()" class="text-slate-400 text-lg">✕</button>
                </div>
                
                <div class="text-xs grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl font-bold text-slate-600 shrink-0">
                    <div><span class="text-slate-400 text-[10px] block">${isZh?'买家':'Khách hàng'}</span> <span class="font-black text-slate-800 text-sm">${customerName}</span></div>
                    <div class="text-right"><span class="text-slate-400 text-[10px] block">${isZh?'汇总宏观状态':'Tổng trạng thái'}</span> <span class="font-black text-indigo-600 text-xs">${currentGlobalStatusText}</span></div>
                    <div class="col-span-2 text-[10px] text-slate-400 font-mono border-t border-slate-200/50 pt-1 mt-0.5">ID: ${ord.id}</div>
                </div>

                ${fastButtonsConsoleHTML}

                <div class="grow overflow-y-auto space-y-3 py-1 pr-0.5 no-scrollbar">
                    <label class="block text-[10px] text-slate-400 font-black tracking-wider uppercase">${isZh?'📦 包含商品明细 (可直接输入修改单号、点击右侧切状态)':'📦 CHI TIẾT SẢN PHẨM (NHẬP MÃ ĐƠN TẠI ĐÂY)'}</label>
                    ${subItemsStatusRowsHTML}
                </div>

                <div class="shrink-0">${dangerZoneHTML}</div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if(window.pushModalHistoryState) window.pushModalHistoryState("order-manage-modal");
};

window.fastSaveSingleTrackAndCompany = async function(orderIndex, itemIndex) {
    const ord = window.ERP_STORE.orders[orderIndex];
    const isZh = window.ERP_STORE.current_lang === "zh";

    let actualItems = ord.items;
    if (typeof actualItems === "string") {
        try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
    }
    actualItems = actualItems || [];

    const newTrack = document.getElementById(`fast-track-input-${orderIndex}-${itemIndex}`).value.trim();
    const newCompany = document.getElementById(`fast-express-select-${orderIndex}-${itemIndex}`).value;

    if (actualItems[itemIndex].track === newTrack && actualItems[itemIndex].express_company === newCompany) {
        return; 
    }

    actualItems[itemIndex].track = newTrack;
    actualItems[itemIndex].express_company = newCompany;

    const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: ord.id,
            customer: ord.customer,
            buyer_vnd: ord.buyer_vnd || 0,
            shipping_fee_cny: ord.shipping_fee_cny || 0,
            items: actualItems,
            status: ord.status
        })
    });

    if (res.ok) {
        ord.items = actualItems;
        showErpToast(isZh ? "⚡ 快递单号已实时自动存盘！" : "⚡ Đã lưu mã vận đơn thành công!");
    } else {
        showErpToast("D1 Save Track Error");
    }
};

// ⚡ 核心联动测试重构：单品散件改写状态，智能推算全局状态，绝不抢跑分类！
window.toggleSingleItemStatusInModal = async function(orderIndex, itemIndex) {
    const ord = window.ERP_STORE.orders[orderIndex];
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    let actualItems = ord.items;
    if (typeof actualItems === "string") {
        try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
    }
    actualItems = actualItems || [];

    actualItems.forEach((item, idx) => {
        const tInput = document.getElementById(`fast-track-input-${orderIndex}-${idx}`);
        const cSelect = document.getElementById(`fast-express-select-${orderIndex}-${idx}`);
        if(tInput) item.track = tInput.value.trim();
        if(cSelect) item.express_company = cSelect.value;
    });

    const statusLoop = ["等待国内发货", "集运仓已到货", "跨境清关运输中", "买家已完成收货"];
    let currentIdx = statusLoop.indexOf(actualItems[itemIndex].status);
    let nextIdx = (currentIdx + 1) % statusLoop.length;
    
    actualItems[itemIndex].status = statusLoop[nextIdx];

    // 智能推算订单的全局汇总标记
    let nextOrderGlobalStatus = "等待国内发货";
    let hasUnshipped = actualItems.some(i => i.status === "等待国内发货");
    let hasWarehouse = actualItems.some(i => i.status === "集运仓已到货");
    let hasTransit = actualItems.some(i => i.status === "跨境清关运输中");
    let hasReceived = actualItems.some(i => i.status === "买家已完成收货");

    if (!hasUnshipped && hasWarehouse) nextOrderGlobalStatus = "集运仓已到货";
    else if (!hasUnshipped && !hasWarehouse && hasTransit) nextOrderGlobalStatus = "跨境清关运输中";
    else if (!hasUnshipped && !hasWarehouse && !hasTransit && hasReceived) nextOrderGlobalStatus = "买家已完成收货";

    const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: ord.id,
            customer: ord.customer,
            buyer_vnd: ord.buyer_vnd || 0,
            shipping_fee_cny: ord.shipping_fee_cny || 0,
            items: actualItems,
            status: nextOrderGlobalStatus
        })
    });

    if (res.ok) {
        ord.items = actualItems;
        ord.status = nextOrderGlobalStatus;
        
        await fetch(`${window.API_BASE_URL}/api/orders/update_status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: ord.id, status: nextOrderGlobalStatus })
        });
        
        const mv = document.getElementById("main-view");
        if(mv) mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
        window.init_orders();
        
        openOrderDetailModalForManage(orderIndex);
        showErpToast(isZh ? "⚡ 单品状态已完成局部流转！" : "⚡ Đã cập nhật trạng thái gói lẻ!");
    } else {
        showErpToast("D1 Connection Error");
    }
};

window.batchUpdateFullOrderStatusDirectly = async function(orderIndex, targetStatus) {
    const ord = window.ERP_STORE.orders[orderIndex];
    const isZh = window.ERP_STORE.current_lang === "zh";

    let actualItems = ord.items;
    if (typeof actualItems === "string") {
        try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
    }
    actualItems = actualItems || [];

    actualItems.forEach((item, idx) => {
        const tInput = document.getElementById(`fast-track-input-${orderIndex}-${idx}`);
        const cSelect = document.getElementById(`fast-express-select-${orderIndex}-${idx}`);
        if(tInput) item.track = tInput.value.trim();
        if(cSelect) item.express_company = cSelect.value;
    });

    actualItems.forEach(item => item.status = targetStatus);

    const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
        method: "POST",
        headers: { "Content-
