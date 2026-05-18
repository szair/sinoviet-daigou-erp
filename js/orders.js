// =========================================================
// 📦 中越通跨境代购 ERP - 订单业务 H5 核心模块 (浮点数高精对账版)
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

    let filteredOrders = window.ERP_STORE.orders;
    if (currentFilter !== null) {
        filteredOrders = window.ERP_STORE.orders.filter(o => o.status === currentFilter);
    } else {
        filteredOrders = window.ERP_STORE.orders.filter(o => o.status !== "已取消");
    }

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
            itemsSummary += `
                <div class="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60 text-xs">
                    <div>
                        <span class="text-slate-400 font-black">[${item.platform || '淘宝'}]</span>
                        <span class="text-slate-700 font-bold ml-1">${item.name || '未命名商品'}</span>
                    </div>
                    <span class="font-mono font-black text-slate-500">¥${item.cny || 0}</span>
                </div>
            `;
        });

        const isCanceled = ord.status === "已取消";
        const cardOpacity = isCanceled ? "opacity-65 bg-slate-50/70 border-slate-200" : "bg-white border-slate-100";
        
        let customerName = ord.customer || "未知买家";
        if (customerName.startsWith("CUST-CUST-")) {
            customerName = customerName.replace("CUST-CUST-", "");
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
                    <button onclick="openOrderDetailModalForManage(${index})" class="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-black active:bg-indigo-600 active:text-white transition-all shadow-sm">
                        ${isZh ? '管理此单' : 'Quản lý'}
                    </button>
                </div>

                <div class="space-y-2">
                    ${itemsSummary}
                </div>

                <div class="flex justify-between items-center pt-2 text-xs">
                    <span class="text-slate-400 font-bold">${isZh?'整单内部本金':'Tổng tiền vốn'}:</span>
                    <span class="font-mono font-black text-slate-900 text-sm">¥${totalCny.toLocaleString()}</span>
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
    window.pushModalHistoryState("order-form-modal");
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
                    <input type="text" class="mo-cny-input w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-2 text-right font-mono font-bold text-slate-700" value="${cny}" placeholder="${isZh?'本金':'Vốn'}" oninput="calculateFormTotalCnyActual()" required>
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

// ⚡ 核心修复 1：全面升格为 parseFloat 浮点数计算，完美支持 114.68 运算
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
        alert(window.ERP_STORE.current_lang === "zh" ? "⚠️ 至少保留一项商品明细" : "Phải giữ lại ít nhất 1 mặt hàng");
    }
};

window.closeOrderFormModalActual = function() {
    const m = document.getElementById("order-form-modal");
    if(m) m.remove();
};

// =========================================================
// 💾 数据保存吞吐中心 (安全清洗、强防 NaN)
// =========================================================
window.submitOrderFormActualAction = async function(editIndex) {
    const isEdit = editIndex !== null;
    const isZh = window.ERP_STORE.current_lang === "zh";

    const customer = document.getElementById("mo-customer-select").value;
    const buyerVnd = parseFloat(document.getElementById("mo-buyer-vnd-actual").value) || 0;

    const itemsList = [];
    let isFormValid = true;

    document.querySelectorAll(".mo-item-row-actual").forEach(row => {
        const name = row.querySelector(".mo-name-input").value.trim();
        // ⚡ 核心修复 2：获取时也无缝同步为 parseFloat 高精度浮点洗涤
        const cny = parseFloat(row.querySelector(".mo-cny-input").value.trim()) || 0;
        
        if(!name || cny <= 0) isFormValid = false;

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
        alert(isZh ? "❌ 请完整填写商品名称与代垫本金金额！" : "Vui lòng điền đủ thông tin!");
        return;
    }

    let targetId = isEdit ? window.ERP_STORE.orders[editIndex].id : "#ORD-" + Math.floor(10000 + Math.random() * 90000);
    let currentShippingFee = isEdit ? (window.ERP_STORE.orders[editIndex].shipping_fee_cny || 0) : 0;

    const payload = {
        id: targetId,
        customer: customer,
        buyer_vnd: buyerVnd,
        shipping_fee_cny: currentShippingFee,
        items: itemsList
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
        } else {
            payload.status = "等待国内发货";
            window.ERP_STORE.orders.unshift(payload);
        }
        closeOrderFormModalActual();
        
        const mv = document.getElementById("main-view");
        if(mv) mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
        window.init_orders();
        
        alert(isZh ? "🎉 订单已成功同步存储至 D1 数据库！" : "🎉 Đã lưu đơn hàng thành công!");
    } else {
        alert("D1 Save Connection Error");
    }
};

// =========================================================
// 🔄 深度管理独立控制台
// =========================================================
window.openOrderDetailModalForManage = function(index) {
    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    const orderIdTail = ord.id.split('-')[1] || ord.id;
    let customerName = ord.customer || "未知买家";
    if (customerName.startsWith("CUST-CUST-")) customerName = customerName.replace("CUST-CUST-", "");

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
            <div class="space-y-3 w-full">
                <button type="button" onclick="closeOrderModal(); openOrderFormModal(${index});" class="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm">
                    <i class="fa-solid fa-square-pen"></i> ${isZh ? '深度修改此单商品明细' : 'Sửa chi tiết sản phẩm'}
                </button>
                <div class="flex gap-2 pt-1">
                    <button type="button" onclick="toggleOrderCancelStatus(${index}, true)" class="w-1/2 bg-slate-100 text-slate-500 py-2.5 rounded-xl font-bold text-xs">
                        <i class="fa-solid fa-ban text-rose-500"></i> ${isZh ? '客户整单取消' : 'Hủy toàn bộ đơn'}
                    </button>
                    <button type="button" onclick="triggerUltimateDeleteOrder('${ord.id}', '${orderIdTail}', ${index})" class="w-1/2 bg-rose-50 text-rose-600 py-2.5 rounded-xl font-black text-xs border border-rose-100">
                        <i class="fa-regular fa-trash-can"></i> ${isZh ? '彻底粉碎该单' : 'Xóa vĩnh viễn'}
                    </button>
                </div>
            </div>
        `;
    }

    const modalHTML = `
        <div id="order-manage-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 my-auto animate-fadeIn p-5 space-y-4">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 class="text-xs font-black text-slate-800"><i class="fa-solid fa-sliders text-indigo-500"></i> ${isZh?'代购订单深度管理控制台':'Quản lý vận đơn'}</h3>
                    <button type="button" onclick="closeOrderModal()" class="text-slate-400 text-lg">✕</button>
                </div>
                
                <div class="text-xs space-y-1 bg-slate-50 p-3 rounded-xl font-bold text-slate-600">
                    <div><span class="text-slate-400">${isZh?'买家业主':'Khách hàng'}:</span> <span class="font-black text-slate-800">${customerName}</span></div>
                    <div><span class="text-slate-400">${isZh?'单号ID':'Mã đơn'}:</span> <span class="font-mono text-slate-700">${ord.id}</span></div>
                    <div><span class="text-slate-400">${isZh?'当前状态':'Trạng thái'}:</span> <span class="font-mono font-black text-indigo-600">${ord.status || '等待国内发货'}</span></div>
                </div>

                <div class="flex w-full">${dangerZoneHTML}</div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("order-manage-modal");
};

window.toggleOrderCancelStatus = async function(index, shouldCancel) {
    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    const nextStatus = shouldCancel ? "已取消" : "等待国内发货";
    
    let actualItems = ord.items;
    if (typeof actualItems === "string") {
        try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
    }
    actualItems = actualItems || [];
    
    actualItems.forEach(item => item.status = nextStatus);

    const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: ord.id,
            customer: ord.customer,
            buyer_vnd: ord.buyer_vnd || 0,
            shipping_fee_cny: ord.shipping_fee_cny || 0,
            items: actualItems
        })
    });

    if (res.ok) {
        ord.status = nextStatus;
        ord.items = actualItems;
        
        await fetch(`${window.API_BASE_URL}/api/orders/update_status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: ord.id, status: nextStatus })
        });

        closeOrderModal();
        
        const mv = document.getElementById("main-view");
        if(mv) mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
        window.init_orders();
        
        alert(isZh ? "🎉 订单状态已变动！" : "🎉 Cập nhật thành công!");
    } else {
        alert("D1 Link Error");
    }
};

window.triggerUltimateDeleteOrder = function(orderId, tail, index) {
    const isZh = window.ERP_STORE.current_lang === "zh";
    const promptMsg = isZh 
        ? `🚨 【终极警告】：请输入该单的数字尾号【 ${tail} 】进行验证物理粉碎：`
        : `🚨 【CẢNH BÁO TỐI CAO】: Nhập mã đuôi 【 ${tail} 】 để xác nhận:`;
        
    const userInput = prompt(promptMsg);
    
    if (userInput === tail) {
        fetch(`${window.API_BASE_URL}/api/orders/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: orderId })
        }).then(res => {
            if (res.ok) {
                window.ERP_STORE.orders.splice(index, 1);
                closeOrderModal();
                
                const mv = document.getElementById("main-view");
                if(mv) mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
                window.init_orders();
                
                alert(isZh ? "🗑️ 订单已被永久物理销毁。" : "🗑️ Đã xóa đơn hàng vĩnh viễn.");
            }
        });
    } else if (userInput !== null) {
        alert(isZh ? "❌ 尾号校验失败！" : "❌ Sai mã xác nhận!");
    }
};

window.closeOrderModal = function() {
    const m = document.getElementById("order-manage-modal");
    if(m) m.remove();
};
