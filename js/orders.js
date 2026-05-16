function renderOrders() {
    let rowsHTML = "";
    const isZh = window.ERP_STORE.current_lang === "zh";

    // 国际化文案
    const tOrderId = isZh ? "订单号" : "Mã đơn";
    const tCust = isZh ? "客户名" : "Tên khách";
    const tDetail = isZh ? "采购细项明细与商品独立状态 (平台 / 名字 / 快递 / 快捷操作)" : "Chi tiết từng món & Trạng thái độc lập (Nguồn / Tên / Vận đơn / Phím tắt)";
    const tCost = isZh ? "内部本金 (CNY)" : "Vốn (CNY)";
    const tPrice = isZh ? "收取买家费用 (VND)" : "Thu khách (VND)";
    const tAction = isZh ? "操作" : "Thao tác";
    const tAddBtn = isZh ? "新增多平台代购订单" : "Thêm đơn mua hộ mới";
    const tExport = isZh ? "批量导出对账单" : "Xuất hóa đơn đối soát";
    const tTip = isZh ? "智能代购看板：点击列表中带箭头的蓝色快递单号可直接追踪国内一手实时物流轨迹。" : "Bảng thông minh: Nhấp vào mã vận đơn màu xanh để theo dõi trực tiếp lộ trình vận chuyển Trung Quốc.";

    window.ERP_STORE.orders.forEach((ord, orderIndex) => {
        let itemsDetailHTML = "";
        let totalCny = 0;
        let visibleItemsInOrder = 0; 

        if (ord.items) {
            ord.items.forEach((item, itemIndex) => {
                totalCny += item.cny;

                // 核心提效：大盘下钻过滤锁检查
                const curFilter = window.ERP_STORE.filter_status;
                if (curFilter && item.status !== curFilter) {
                    return; 
                }
                visibleItemsInOrder++;

                let itemStatusBadge = "";
                switch (item.status) {
                    case "等待国内发货":
                        itemStatusBadge = `<span class="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-100">${isZh ? '🕒 待发货' : '🕒 Chờ giao'}</span>`;
                        break;
                    case "集运仓已到货":
                        itemStatusBadge = `<span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100">${isZh ? '📦 已到仓' : '📦 Đến kho'}</span>`;
                        break;
                    case "跨境清关运输中":
                        itemStatusBadge = `<span class="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-indigo-100">${isZh ? '🚛 运输中' : '🚛 Vận chuyển'}</span>`;
                        break;
                    case "买家已完成收货":
                        itemStatusBadge = `<span class="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-100">${isZh ? '✅ 已签收' : '✅ Đã nhận'}</span>`;
                        break;
                }

                // 单号动态追溯超链接：一键拉起物理快递查询
                const trackStr = item.track ? `<a href="https://m.kuaidi100.com/result.jsp?nu=${item.track}" target="_blank" class="font-mono text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-100 transition font-bold" title="点击一键查中国国内真实快递轨迹">${item.track} <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a>` : `<span class="text-slate-300 italic">${isZh ? '未发货' : 'Chưa giao'}</span>`;

                itemsDetailHTML += `
                    <div class="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0 text-[11px] md:text-xs">
                        <div class="flex items-center gap-2 flex-grow min-w-0 pr-2">
                            <span class="text-slate-400 font-bold flex-shrink-0">[${item.platform}]</span>
                            <span class="text-slate-800 font-semibold truncate">${item.name} (¥${item.cny})</span>
                            ${itemStatusBadge}
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                            <div class="text-right">${trackStr}</div>
                            <div class="flex gap-1">
                                ${!item.track ? `
                                    <button onclick="quickAddTrack(${orderIndex}, ${itemIndex})" class="text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 p-2 rounded-xl border border-slate-200 transition" title="快捷填单号">
                                        <i class="fa-solid fa-truck"></i>
                                    </button>
                                ` : ''}
                                ${item.status === '等待国内发货' ? `
                                    <button onclick="quickMarkArrived(${orderIndex}, ${itemIndex})" class="text-amber-600 hover:text-white bg-amber-50 hover:bg-blue-600 p-2 rounded-xl border border-amber-200 hover:border-blue-600 transition font-bold" title="一键确认到仓">
                                        <i class="fa-solid fa-box"></i> ${isZh ? '到仓' : 'Kho'}
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        if (window.ERP_STORE.filter_status && visibleItemsInOrder === 0) {
            return;
        }

        const buyerVnd = ord.buyer_vnd ? ord.buyer_vnd.toLocaleString() + " ₫" : "0 ₫";

        rowsHTML += `
            <tr class="hover:bg-slate-50/40 transition text-xs font-semibold text-slate-600 border-b border-slate-100">
                <td class="p-4"><input type="checkbox" class="rounded border-slate-300 w-4 h-4"></td>
                <td class="p-4 font-mono font-bold text-slate-900">${ord.id}</td>
                <td class="p-4 text-slate-700">${ord.customer}</td>
                <td class="p-4 max-w-md bg-slate-50/30 px-3 py-2 rounded-xl">${itemsDetailHTML}</td>
                <td class="p-4 text-right font-mono text-slate-400">¥${totalCny.toLocaleString()}</td>
                <td class="p-4 text-right font-mono text-indigo-600 font-black">${buyerVnd}</td>
                <td class="p-4 text-center">
                    <button onclick="openEditOrderModal(${orderIndex})" class="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition font-bold text-[11px] flex items-center gap-1 mx-auto">
                        <i class="fa-solid fa-layer-group"></i> ${isZh ? '深度管理' : 'Sửa'}
                    </button>
                </td>
            </tr>
        `;
    });

    let filterNotificationHTML = "";
    if (window.ERP_STORE.filter_status) {
        filterNotificationHTML = `
            <div class="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center text-xs text-indigo-700 font-semibold animate-fadeIn">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-filter animate-pulse"></i>
                    <span>${isZh ? `当前处于大盘过滤锁定状态：【${window.ERP_STORE.filter_status}】` : `Đang lọc theo trạng thái: 【${window.ERP_STORE.filter_status}】`}</span>
                </div>
                <button onclick="clearOrderFilterLock()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold transition shadow-sm">${isZh ? '显示全部订单 ➔' : 'Hiện tất cả ➔'}</button>
            </div>
        `;
    }

    return `
        ${filterNotificationHTML}
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white">
                <div class="flex gap-2">
                    <button id="btn-trigger-add-order" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
                        <i class="fa-solid fa-plus"></i> ${tAddBtn}
                    </button>
                    <button class="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition hidden md:inline-block">${tExport}</button>
                </div>
                <div class="text-[11px] font-bold text-slate-400 bg-amber-50 text-amber-700 px-3 py-2 rounded-xl border border-amber-100">
                    💡 ${tTip}
                </div>
            </div>

            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr class="text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                            <th class="p-4 w-12"><input type="checkbox" class="rounded border-slate-300 w-4 h-4"></th>
                            <th class="p-4 w-24">${tOrderId}</th>
                            <th class="p-4 w-32">${tCust}</th>
                            <th class="p-4">${tDetail}</th>
                            <th class="p-4 text-right w-28">${tCost}</th>
                            <th class="p-4 text-right w-36">${tPrice}</th>
                            <th class="p-4 text-center w-24 rounded-r-xl">${tAction}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="order-table-body">
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.init_orders = function() {
    const btn = document.getElementById("btn-trigger-add-order");
    if(btn) {
        btn.removeEventListener("click", openAddOrderModal);
        btn.addEventListener("click", openAddOrderModal);
    }
};

window.clearOrderFilterLock = function() {
    window.ERP_STORE.filter_status = null;
    refreshOrdersView();
};

window.quickMarkArrived = function(orderIndex, itemIndex) {
    const item = window.ERP_STORE.orders[orderIndex].items[itemIndex];
    item.status = "集运仓已到货";
    if (!item.track) {
        item.track = "WH-ARRIVED-" + Math.floor(1000 + Math.random() * 9000);
    }
    syncOrderToD1Cloud(window.ERP_STORE.orders[orderIndex]);
};

window.quickAddTrack = function(orderIndex, itemIndex) {
    const currentTrack = window.ERP_STORE.orders[orderIndex].items[itemIndex].track || "";
    const newTrack = prompt(window.ERP_STORE.current_lang === "zh" ? "请输入或扫描国内电商卖家的发货物流单号：" : "Vui lòng nhập hoặc quét mã vận đơn Trung Quốc:", currentTrack);
    
    if (newTrack !== null) {
        window.ERP_STORE.orders[orderIndex].items[itemIndex].track = newTrack.trim();
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
            platformsHTML += createPlatformItemRow(item.platform, item.name, item.cny, item.track, item.status);
        });
    } else {
        platformsHTML = createPlatformItemRow("淘宝", "", 0, "", "等待国内发货");
    }

    const customerOptionsHTML = window.ERP_STORE.customers.map(c => {
        const isSelected = isEdit && targetOrder.customer === c.name;
        return `<option value="${c.name}" ${isSelected ? 'selected' : ''}>${c.id} - ${c.name}</option>`;
    }).join("");

    const modalHTML = `
        <div id="order-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-y-auto py-4">
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-auto mx-4 animate-fadeIn">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800">${isEdit ? (isZh?'深度调整订单与商品状态':'Chỉnh sửa thông tin đơn hàng') : (isZh?'新建中越合并代购订单':'Thêm đơn hàng mua hộ mới')}</h3>
                    <button type="button" onclick="closeOrderModal()" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>
                
                <form id="add-order-form" class="p-4 sm:p-6 space-y-4 text-xs">
                    <div class="w-full sm:w-1/2">
                        <label class="block text-slate-500 font-bold mb-1">${isZh?'选择越南买家档案':'Chọn khách hàng Việt Nam'}</label>
                        <select id="mo-customer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:outline-none">
                            ${customerOptionsHTML}
                        </select>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-slate-500 font-bold">${isZh?'采购商品明细控制台':'Danh sách chi tiết hàng hóa'}</label>
                            <button type="button" id="btn-add-platform" class="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] flex items-center gap-1">
                                <i class="fa-solid fa-plus-circle"></i> ${isZh?'增加一件商品':'Thêm món mới'}
                            </button>
                        </div>
                        <div id="platform-items-container" class="space-y-2">
                            ${platformsHTML}
                        </div>
                    </div>

                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-slate-500 font-bold mb-1">${isZh?'内部总本金估算':'Ước tính tổng vốn CNY'}</label>
                                <div id="mo-total-cny-display" class="font-mono font-black text-slate-700 text-sm py-1">¥ 0</div>
                            </div>
                            <div>
                                <label class="block text-indigo-900 font-bold mb-1">${isZh?'收取买家的固定货款 (VND)':'Số tiền thu khách (VND)'}</label>
                                <input type="number" id="mo-buyer-vnd" value="${isEdit ? targetOrder.buyer_vnd : ''}" required class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono font-black text-right text-indigo-600 focus:outline-none">
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeOrderModal()" class="w-1/4 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">${isZh?'取消':'Hủy'}</button>
                        <button type="submit" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-sm transition">${isZh?'保存全部变动':'Lưu toàn bộ thay đổi'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("order-modal"); 
    setupModalCalculation(editIndex);
}

function createPlatformItemRow(platform, name, cny, track, status) {
    const pOpts = ["淘宝", "1688", "拼多多", "咸鱼", "其他"].map(p => `<option value="${p}" ${platform === p ? 'selected' : ''}>${p}</option>`).join("");
    const isZh = window.ERP_STORE.current_lang === "zh";
    const sOpts = [
        { v: "等待国内发货", t: isZh ? "🕒 待发货" : "🕒 Chờ giao" },
        { v: "集运仓已到货", t: isZh ? "📦 已到仓" : "📦 Đến kho" },
        { v: "跨境清关运输中", t: isZh ? "🚛 运输中" : "🚛 Vận chuyển" },
        { v: "买家已完成收货", t: isZh ? "✅ 已签收" : "✅ Đã nhận" }
    ].map(s => `<option value="${s.v}" ${status === s.v ? 'selected' : ''}>${s.t}</option>`).join("");

    return `
        <div class="platform-item grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center">
            <div class="col-span-4 sm:col-span-2"><select class="mo-item-platform w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-700">${pOpts}</select></div>
            <div class="col-span-8 sm:col-span-3"><input type="text" placeholder="${isZh?'商品名称':'Tên sản phẩm'}" value="${name}" required class="mo-item-name w-full bg-white border border-slate-200 rounded-lg p-1.5 font-semibold"></div>
            <div class="col-span-4 sm:col-span-2 relative">
                <span class="absolute left-2 top-2 text-slate-400 font-mono">¥</span>
                <input type="number" placeholder="${isZh?'本金':'Vốn'}" value="${cny || ''}" required class="w-full bg-white border border-slate-200 rounded-lg pl-5 pr-1.5 py-1.5 text-right font-mono font-bold text-slate-700">
            </div>
            <div class="col-span-5 sm:col-span-3"><input type="text" placeholder="${isZh?'国内单号':'Mã vận đơn'}" value="${track || ''}" class="mo-item-track w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-[11px]"></div>
            <div class="col-span-3 sm:col-span-2 flex gap-1 items-center justify-end">
                <select class="mo-item-status bg-white border border-slate-200 rounded-lg p-1 font-bold text-[11px] text-slate-600">${sOpts}</select>
                <button type="button" onclick="removePlatformItem(this)" class="text-rose-400 hover:text-rose-600 p-1 text-sm"><i class="fa-regular fa-trash-can"></i></button>
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
        const row = createPlatformItemRow("淘宝", "", 0, "", "等待国内发货");
        container.insertAdjacentHTML('beforeend', row);
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
                track: el.querySelector(".mo-item-track").value.trim(),
                status: el.querySelector(".mo-item-status").value
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

        if (res.ok) {
            closeOrderModal();
            refreshOrdersView();
        } else {
            alert("同步 D1 数据库失败，请重试");
        }
    });
}

window.closeOrderModal = function() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.remove();
};
