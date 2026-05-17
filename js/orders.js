function renderOrders() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    const tAddBtn = isZh ? "新增订单" : "Thêm đơn mới"; 
    const tTip = isZh ? "点击蓝色单号可直接追踪中国国内实时物流轨迹。" : "Nhấp vào mã vận đơn để theo dõi trực tiếp lộ trình.";

    // ⚡ H5 核心：计算各个状态的实时积压件数，展示在顶部药丸上，让老板心里有数
    let countAll = 0, countWait = 0, countArrived = 0, countShipping = 0, countDone = 0;
    
    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items) {
            ord.items.forEach(item => {
                countAll++;
                if (item.status === "等待国内发货") countWait++;
                if (item.status === "集运仓已到货") countArrived++;
                if (item.status === "跨境清关运输中") countShipping++;
                if (item.status === "买家已完成收货") countDone++;
            });
        }
    });

    const curFilter = window.ERP_STORE.filter_status;

    // 💊 核心增加：H5 专属的顶部吸顶“药丸胶囊”横向滑动筛选条
    const filterTabsHTML = `
        <div class="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar select-none">
            <button onclick="setOrderFilterLock(null)" class="flex-shrink-0 px-4 py-2 rounded-full font-black text-xs transition-all ${!curFilter ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}">
                ${isZh?'全部':'Tất cả'} (${countAll})
            </button>
            <button onclick="setOrderFilterLock('等待国内发货')" class="flex-shrink-0 px-4 py-2 rounded-full font-black text-xs transition-all ${curFilter === '等待国内发货' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}">
                🕒 ${isZh?'待发货':'Chờ giao'} (${countWait})
            </button>
            <button onclick="setOrderFilterLock('集运仓已到货')" class="flex-shrink-0 px-4 py-2 rounded-full font-black text-xs transition-all ${curFilter === '集运仓已到货' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}">
                📦 ${isZh?'已到仓':'Đến kho'} (${countArrived})
            </button>
            <button onclick="setOrderFilterLock('跨境清关运输中')" class="flex-shrink-0 px-4 py-2 rounded-full font-black text-xs transition-all ${curFilter === '跨境清关运输中' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}">
                🚛 ${isZh?'运输中':'Vận chuyển'} (${countShipping})
            </button>
            <button onclick="setOrderFilterLock('买家已完成收货')" class="flex-shrink-0 px-4 py-2 rounded-full font-black text-xs transition-all ${curFilter === '买家已完成收货' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}">
                ✅ ${isZh?'已签收':'Đã nhận'} (${countDone})
            </button>
        </div>
    `;

    // 构建 H5 卡片流
    let cardsHTML = "";

    window.ERP_STORE.orders.forEach((ord, orderIndex) => {
        let itemsDetailHTML = "";
        let totalCny = 0;
        let visibleItemsInOrder = 0; 

        if (ord.items) {
            ord.items.forEach((item, itemIndex) => {
                totalCny += item.cny;

                // 智能分类拦截过滤
                if (curFilter && item.status !== curFilter) return; 
                visibleItemsInOrder++;

                let itemStatusBadge = "";
                switch (item.status) {
                    case "等待国内发货":
                        itemStatusBadge = `<span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">🕒 ${isZh ? '待发货' : 'Chờ giao'}</span>`;
                        break;
                    case "集运仓已到货":
                        itemStatusBadge = `<span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100">📦 ${isZh ? '已到仓' : 'Đến kho'}</span>`;
                        break;
                    case "跨境清关运输中":
                        itemStatusBadge = `<span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">🚛 ${isZh ? '运输中' : 'Vận chuyển'}</span>`;
                        break;
                    case "买家已完成收货":
                        itemStatusBadge = `<span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100">✅ ${isZh ? '已签收' : 'Đã nhận'}</span>`;
                        break;
                }

                const companyPrefix = item.express_company ? `(${item.express_company}) ` : "";
                const trackStr = item.track 
                    ? `<a href="https://m.kuaidi100.com/result.jsp?nu=${item.track}" target="_blank" class="font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded-xl border border-indigo-100 font-bold block mt-1 text-center text-xs">${companyPrefix}${item.track} <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a>` 
                    : `<span class="text-slate-300 italic block mt-1 text-xs text-center">${isZh ? '暂无单号' : 'Chưa có mã'}</span>`;

                itemsDetailHTML += `
                    <div class="py-3 border-b border-dashed border-slate-100 last:border-0 space-y-2">
                        <div class="flex justify-between items-start gap-2">
                            <div class="font-bold text-slate-800 leading-snug text-xs md:text-sm">
                                <span class="text-slate-400 font-black">[${item.platform}]</span> ${item.name}
                            </div>
                            <div class="flex-shrink-0">${itemStatusBadge}</div>
                        </div>
                        <div class="flex justify-between items-center text-xs text-slate-500 font-semibold">
                            <div>${isZh?'本金':'Vốn'}: <span class="font-mono text-slate-700 font-bold">¥${item.cny}</span></div>
                            <div class="flex gap-1.5">
                                ${!item.track ? `<button onclick="quickAddTrack(${orderIndex}, ${itemIndex})" class="text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100 font-black text-[11px]"><i class="fa-solid fa-truck-ramp-box"></i> ${isZh?'填单':'Mã'}</button>` : ''}
                                ${item.status === '等待国内发货' ? `<button onclick="quickMarkArrived(${orderIndex}, ${itemIndex})" class="text-white bg-indigo-600 px-2.5 py-1.5 rounded-xl font-black shadow-sm text-[11px]"><i class="fa-solid fa-box"></i> ${isZh?'到仓':'Kho'}</button>` : ''}
                            </div>
                        </div>
                        <div>${trackStr}</div>
                    </div>
                `;
            });
        }

        // 如果当前订单里没有符合当前筛选状态的商品，整张卡片完全隐形
        if (curFilter && visibleItemsInOrder === 0) return;

        const buyerVnd = ord.buyer_vnd ? ord.buyer_vnd.toLocaleString() + " ₫" : "0 ₫";

        cardsHTML += `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 animate-fadeIn">
                <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                        <h4 class="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <i class="fa-solid fa-user text-indigo-500 text-xs"></i> ${ord.customer}
                        </h4>
                        <span class="text-[11px] text-slate-400 font-mono mt-0.5 block">${ord.id}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs text-indigo-600 font-black block">${buyerVnd}</span>
                        <span class="text-[10px] text-slate-400 font-mono block mt-0.5">${isZh?'总本金':'Tổng vốn'}: ¥${totalCny}</span>
                    </div>
                </div>

                <div class="bg-slate-50/50 px-4 py-2 rounded-2xl border border-slate-100/50">
                    ${itemsDetailHTML}
                </div>

                <div class="pt-2">
                    <button onclick="openEditOrderModal(${orderIndex})" class="w-full bg-slate-900 text-white py-3 rounded-2xl font-black text-xs transition active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm">
                        <i class="fa-solid fa-sliders"></i> ${isZh ? '管理此单状态' : 'Quản lý đơn'}
                    </button>
                </div>
            </div>
        `;
    });

    if (cardsHTML === "") {
        cardsHTML = `<div class="bg-white p-12 rounded-2xl border border-slate-100 text-center italic text-slate-400 text-xs">${isZh?'暂无符合条件的订单':'Không có đơn hàng nào'}</div>`;
    }

    return `
        <div class="space-y-4 w-full max-w-md mx-auto">
            ${filterTabsHTML}
            
            <div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-3">
                <button id="btn-trigger-add-order" class="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md flex-grow active:scale-[0.98] transition-all">
                    <i class="fa-solid fa-plus"></i> ${tAddBtn}
                </button>
                <div class="text-[11px] text-slate-400 font-bold bg-amber-50 border border-amber-100/60 p-2.5 rounded-xl max-w-[180px] leading-tight">
                    💡 ${tTip}
                </div>
            </div>

            <div class="space-y-4 pb-12">
                ${cardsHTML}
            </div>
        </div>
    `;
}

window.init_orders = function() {
    const btn = document.getElementById("btn-trigger-add-order");
    if(btn) {
        btn.removeEventListener("click", openAddOrderModalDirectly);
        btn.addEventListener("click", openAddOrderModalDirectly);
    }
};

function openAddOrderModalDirectly() { openOrderFormModal(null); }

// ⚡ 核心追加：药丸点击事件处理器
window.setOrderFilterLock = function(status) {
    window.ERP_STORE.filter_status = status;
    refreshOrdersView();
};

window.clearOrderFilterLock = function() { window.ERP_STORE.filter_status = null; refreshOrdersView(); };

window.quickMarkArrived = function(orderIndex, itemIndex) {
    const item = window.ERP_STORE.orders[orderIndex].items[itemIndex];
    item.status = "集运仓已到货";
    if (!item.track) item.track = "WH-ARRIVED-" + Math.floor(1000 + Math.random() * 9000);
    syncOrderToD1Cloud(window.ERP_STORE.orders[orderIndex]);
};

window.quickAddTrack = function(orderIndex, itemIndex) {
    const currentTrack = window.ERP_STORE.orders[orderIndex].items[itemIndex].track || "";
    const newTrack = prompt(window.ERP_STORE.current_lang === "zh" ? "请输入中国国内电商的发货物流单号：" : "Vui lòng nhập mã vận đơn Trung Quốc:", currentTrack);
    
    if (newTrack !== null && newTrack.trim() !== "") {
        const currentCompany = window.ERP_STORE.orders[orderIndex].items[itemIndex].express_company || "中通";
        const newCompany = prompt("请输入快递公司名字（例如中通、圆通、顺丰）：", currentCompany);
        
        window.ERP_STORE.orders[orderIndex].items[itemIndex].track = newTrack.trim();
        window.ERP_STORE.orders[orderIndex].items[itemIndex].express_company = (newCompany || "中通").trim();
        syncOrderToD1Cloud(window.ERP_STORE.orders[orderIndex]);
    }
};

function syncOrderToD1Cloud(orderData) {
    fetch(`${window.API_BASE_URL}/api/orders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    }).then(res => {
        if(res.ok) refreshOrdersView();
        else alert("同步数据库失败");
    });
}

function refreshOrdersView() {
    const mv = document.getElementById("main-view");
    mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
    window.init_orders();
}

function openOrderFormModal(editIndex = null) {
    const isEdit = editIndex !== null;
    const targetOrder = isEdit ? window.ERP_STORE.orders[editIndex] : null;
    const isZh = window.ERP_STORE.current_lang === "zh";

    let platformsHTML = "";
    if (isEdit && targetOrder.items) {
        targetOrder.items.forEach(item => {
            platformsHTML += createPlatformItemRow(item.platform, item.name, item.cny, item.track, item.status, item.express_company);
        });
    } else {
        platformsHTML = createPlatformItemRow("淘宝", "", 0, "", "等待国内发货", "中通");
    }

    const customerOptionsHTML = window.ERP_STORE.customers.map(c => {
        const isSelected = isEdit && targetOrder.customer === c.name;
        return `<option value="${c.name}" ${isSelected ? 'selected' : ''}>${c.id} - ${c.name}</option>`;
    }).join("");

    const modalHTML = `
        <div id="order-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-y-auto p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 my-auto animate-fadeIn">
                <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-black text-slate-800">${isEdit ? (isZh?'调整订单状态':'Chỉnh sửa đơn hàng') : (isZh?'创建新订单':'Thêm đơn hàng mới')}</h3>
                    <button type="button" onclick="closeOrderModal()" class="text-slate-400 text-lg">✕</button>
                </div>
                
                <form id="add-order-form" class="p-5 space-y-4 text-xs">
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">${isZh?'选择越南买家':'Chọn khách hàng'}</label>
                        <select id="mo-customer" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none">
                            ${customerOptionsHTML}
                        </select>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-slate-400 font-bold">${isZh?'采购商品明细':'Danh sách chi tiết'}</label>
                            <button type="button" id="btn-add-platform" class="text-indigo-600 font-bold text-[11px]">
                                <i class="fa-solid fa-plus-circle"></i> ${isZh?'增加商品':'Thêm món'}
                            </button>
                        </div>
                        <div id="platform-items-container" class="space-y-3">
                            ${platformsHTML}
                        </div>
                    </div>

                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <div>
                            <label class="block text-slate-400 font-bold mb-0.5">${isZh?'内部总本金估算':'Tổng vốn CNY'}</label>
                            <div id="mo-total-cny-display" class="font-mono font-black text-slate-700 text-sm">¥ 0</div>
                        </div>
                        <div>
                            <label class="block text-indigo-950 font-bold mb-1">${isZh?'收取买家货款 (VND)':'Số tiền thu khách (VND)'}</label>
                            <input type="number" id="mo-buyer-vnd" value="${isEdit ? targetOrder.buyer_vnd : ''}" required class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-black text-right text-indigo-600 focus:outline-none">
                        </div>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeOrderModal()" class="w-1/4 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold">${isZh?'取消':'Hủy'}</button>
                        <button type="submit" class="flex-grow bg-indigo-600 text-white py-3 rounded-2xl font-black shadow-md">${isZh?'确认保存':'Lưu lại'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("order-modal"); 
    setupModalCalculation(editIndex);
}

function createPlatformItemRow(platform, name, cny, track, status, expressCompany = "中通") {
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
        <div class="platform-item bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 relative">
            <button type="button" onclick="removePlatformItem(this)" class="absolute right-3 top-3 text-rose-400 p-1 text-sm"><i class="fa-regular fa-trash-can"></i></button>
            
            <div class="flex gap-2">
                <select class="mo-item-platform bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700 w-1/3">${pOpts}</select>
                <input type="text" placeholder="${isZh?'商品名称':'Tên sản phẩm'}" value="${name}" required class="mo-item-name bg-white border border-slate-200 rounded-xl p-2 font-bold flex-grow">
            </div>
            
            <div class="grid grid-cols-2 gap-2">
                <div class="relative">
                    <span class="absolute left-3 top-2.5 text-slate-400 font-mono">¥</span>
                    <input type="number" placeholder="${isZh?'本金':'Vốn'}" value="${cny || ''}" required class="mo-item-cny w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-2 text-right font-mono font-bold text-slate-700">
                </div>
                <select class="mo-item-express-company bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-600">${expOpts}</select>
            </div>
            
            <div class="flex gap-2 items-center">
                <input type="text" placeholder="${isZh?'国内单号 (选填)':'Mã vận đơn (nếu có)'}" value="${track || ''}" class="mo-item-track bg-white border border-slate-200 rounded-xl p-2 font-mono text-[11px] flex-grow">
                <select class="mo-item-status bg-white border border-slate-200 rounded-xl p-2 font-bold text-[11px] text-slate-600">${sOpts}</select>
            </div>
        </div>
    `;
}

window.removePlatformItem = function(btn) {
    const container = document.getElementById("platform-items-container");
    if(container.children.length > 1) {
        btn.closest('.platform-item').remove();
        window.updateTotalCnySum();
    } else { alert("至少保留一项"); }
};

window.updateTotalCnySum = function() {
    let totalCny = 0;
    document.querySelectorAll(".mo-item-cny").forEach(input => { totalCny += parseFloat(input.value) || 0; });
    const db = document.getElementById("mo-total-cny-display");
    if(db) db.innerText = "¥ " + totalCny.toLocaleString();
};

function setupModalCalculation(editIndex) {
    const container = document.getElementById("platform-items-container");
    document.getElementById("btn-add-platform").addEventListener("click", () => {
        container.insertAdjacentHTML('beforeend', createPlatformItemRow("淘宝", "", 0, "", "等待国内发货", "中通"));
        bindCnyInputListener();
    });

    function bindCnyInputListener() {
        document.querySelectorAll(".mo-item-cny").forEach(input => {
            input.removeEventListener("input", window.updateTotalCnySum);
            input.addEventListener("input", window.updateTotalCnySum);
        });
    }
    bindCnyInputListener();
    window.updateTotalCnySum();

    document.getElementById("add-order-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        let itemsList = [];
        document.querySelectorAll(".platform-item").forEach(el => {
            itemsList.push({
                platform: el.querySelector(".mo-item-platform").value,
                name: el.querySelector(".mo-item-name").value,
                cny: parseFloat(el.querySelector(".mo-item-cny").value) || 0,
                express_company: el.querySelector(".mo-item-express-company").value, 
                track: el.querySelector(".mo-item-track").value.trim(),
                status: el.querySelector(".mo-item-status").value || "等待国内发货"
            });
        });

        const cust = document.getElementById("mo-customer").value;
        const vnd = parseFloat(document.getElementById("mo-buyer-vnd").value) || 0;

        let targetId = "";
        let shippingFee = 0;

        if (editIndex !== null) {
            targetId = window.ERP_STORE.orders[editIndex].id;
            shippingFee = window.ERP_STORE.orders[editIndex].shipping_fee_cny || 0;
            window.ERP_STORE.orders[editIndex].customer = cust;
            window.ERP_STORE.orders[editIndex].buyer_vnd = vnd;
            window.ERP_STORE.orders[editIndex].items = itemsList;
        } else {
            targetId = "#ORD-" + Math.floor(10000 + Math.random() * 90000);
            window.ERP_STORE.orders.unshift({ id: targetId, customer: cust, buyer_vnd: vnd, items: itemsList, shipping_fee_cny: 0 });
        }

        const targetPayload = { id: targetId, customer: cust, buyer_vnd: vnd, shipping_fee_cny: shippingFee, items: itemsList };
        const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(targetPayload)
        });

        if (res.ok) { closeOrderModal(); refreshOrdersView(); }
        else alert("同步 D1 失败");
    });
}

window.closeOrderModal = function() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.remove();
};

function openEditOrderModal(index) {
    openOrderFormModal(index);
}
