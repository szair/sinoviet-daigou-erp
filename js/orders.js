function renderOrders() {
    let rowsHTML = "";
    
    if (window.ERP_STORE.orders.length === 0) {
        window.ERP_STORE.orders = [
            {
                id: "#ORD-99812",
                customer: "Tran Thi Mai (梅姐姐)",
                buyer_vnd: 4500000,
                items: [
                    { platform: "淘宝", name: "防晒衣", cny: 150, track: "SF142345566", status: "集运仓已到货" },
                    { platform: "1688", name: "马丁靴", cny: 300, track: "", status: "等待国内发货" }
                ]
            }
        ];
    }

    window.ERP_STORE.orders.forEach((ord, orderIndex) => {
        let itemsDetailHTML = "";
        let totalCny = 0;
        let visibleItemsInOrder = 0; // 用来计算在过滤状态下，当前订单是否有符合条件的商品

        ord.items.forEach((item, itemIndex) => {
            totalCny += item.cny;

            // ⚡ 核心提效：如果首页传递了过滤锁，且当前商品状态不符合，就直接在这个大表的渲染中隐藏该商品条目！
            const curFilter = window.ERP_STORE.filter_status;
            if (curFilter && item.status !== curFilter) {
                return; // 跳过，不渲染这一行商品
            }
            visibleItemsInOrder++;

            let itemStatusBadge = "";
            switch (item.status) {
                case "等待国内发货":
                    itemStatusBadge = `<span class="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-100">🕒 待发货</span>`;
                    break;
                case "集运仓已到货":
                    itemStatusBadge = `<span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100">📦 已到仓</span>`;
                    break;
                case "跨境清关运输中":
                    itemStatusBadge = `<span class="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-indigo-100">🚛 运输中</span>`;
                    break;
                case "买家已完成收货":
                    itemStatusBadge = `<span class="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-100">✅ 已签收</span>`;
                    break;
            }

            // ⚡ 单号动态追溯超链接：点击直接跳到快递100进行一键物流追踪
            const trackStr = item.track ? `<a href="https://m.kuaidi100.com/result.jsp?nu=${item.track}" target="_blank" class="font-mono text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-100 transition font-bold" title="点击一键查中国国内真实快递轨迹">${item.track} <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a>` : `<span class="text-slate-300 italic">未发货</span>`;

            itemsDetailHTML += `
                <div class="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 last:border-0 text-[11px]">
                    <div class="flex items-center gap-2 flex-grow min-w-0 pr-2">
                        <span class="text-slate-400 font-bold flex-shrink-0">[${item.platform}]</span>
                        <span class="text-slate-800 font-semibold truncate">${item.name} (¥${item.cny})</span>
                        ${itemStatusBadge}
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                        <div class="text-right">${trackStr}</div>
                        <div class="flex gap-1">
                            ${!item.track ? `
                                <button onclick="quickAddTrack(${orderIndex}, ${itemIndex})" class="text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 p-1 rounded border border-slate-200 transition" title="快捷填单号">
                                    <i class="fa-solid fa-truck"></i>
                                </button>
                            ` : ''}
                            ${item.status === '等待国内发货' ? `
                                <button onclick="quickMarkArrived(${orderIndex}, ${itemIndex})" class="text-amber-600 hover:text-white bg-amber-50 hover:bg-blue-600 p-1 rounded border border-amber-200 hover:border-blue-600 transition" title="一键确认到仓">
                                    <i class="fa-solid fa-box"></i> 到仓
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        // 如果在状态下钻过滤中，整个大订单里没有任何一件商品符合条件，那么这一整行大订单也隐藏掉！
        if (window.ERP_STORE.filter_status && visibleItemsInOrder === 0) {
            return;
        }

        const buyerVnd = ord.buyer_vnd ? ord.buyer_vnd.toLocaleString() + " ₫" : "未计算";

        rowsHTML += `
            <tr class="hover:bg-slate-50/40 transition text-xs font-semibold text-slate-600 border-b border-slate-100">
                <td class="p-4"><input type="checkbox" class="rounded border-slate-300"></td>
                <td class="p-4 font-mono font-bold text-slate-900">${ord.id}</td>
                <td class="p-4 text-slate-700">${ord.customer}</td>
                <td class="p-4 max-w-md bg-slate-50/30 px-3 py-2 rounded-xl">${itemsDetailHTML}</td>
                <td class="p-4 text-right font-mono text-slate-400">¥${totalCny.toLocaleString()}</td>
                <td class="p-4 text-right font-mono text-indigo-600 font-black">${buyerVnd}</td>
                <td class="p-4 text-center">
                    <button onclick="openEditOrderModal(${orderIndex})" class="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition font-bold text-[11px] flex items-center gap-1 mx-auto">
                        <i class="fa-solid fa-layer-group"></i> 完整管理
                    </button>
                </td>
            </tr>
        `;
    });

    // 面包屑提示条：如果是从首页点进来的，给一个醒目的高亮解除提示
    let filterNotificationHTML = "";
    if (window.ERP_STORE.filter_status) {
        filterNotificationHTML = `
            <div class="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center text-xs text-indigo-700 font-semibold animate-fadeIn">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-filter animate-pulse"></i>
                    <span>当前正从仪表盘下钻锁定状态：【${window.ERP_STORE.filter_status}】。已自动为你过滤出对应的紧急商品列表。</span>
                </div>
                <button onclick="clearOrderFilterLock()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg font-bold transition shadow-sm">显示全部订单 ➔</button>
            </div>
        `;
    }

    return `
        ${filterNotificationHTML}
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div class="flex gap-2">
                    <button id="btn-trigger-add-order" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
                        <i class="fa-solid fa-plus"></i> 新增多平台代购订单
                    </button>
                    <button class="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition">批量导出对账单</button>
                </div>
                <div class="text-[11px] font-bold text-slate-400 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100">
                    💡 智能对账台：点击列表中带箭头的 <span class="text-indigo-600 font-bold">蓝色快递单号</span> 可直接追踪国内一手实时轨迹。
                </div>
            </div>

            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                            <th class="p-4 w-12"><input type="checkbox" class="rounded border-slate-300"></th>
                            <th class="p-4">订单号</th>
                            <th class="p-4">客户名</th>
                            <th class="p-4">采购细项明细与商品独立状态 (平台 / 名字 / 快递 / 快捷操作)</th>
                            <th class="p-4 text-right">内部本金 (CNY)</th>
                            <th class="p-4 text-right">收取买家费用 (VND)</th>
                            <th class="p-4 text-center rounded-r-xl">操作</th>
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

function init_orders() {
    const btn = document.getElementById("btn-trigger-add-order");
    if(btn) btn.addEventListener("click", () => openOrderFormModal(null));
}

// 解除首页状态锁，返回完全大表格的处理器
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
    refreshOrdersView();
};

window.quickAddTrack = function(orderIndex, itemIndex) {
    const currentTrack = window.ERP_STORE.orders[orderIndex].items[itemIndex].track || "";
    const newTrack = prompt("请输入或扫描国内电商卖家的发货物流单号：", currentTrack);
    
    if (newTrack !== null) {
        window.ERP_STORE.orders[orderIndex].items[itemIndex].track = newTrack.trim();
        refreshOrdersView();
    }
};

function refreshOrdersView() {
    const mv = document.getElementById("main-view");
    mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
    init_orders();
}

function openOrderFormModal(editIndex = null) {
    const isEdit = editIndex !== null;
    const targetOrder = isEdit ? window.ERP_STORE.orders[editIndex] : null;

    let platformsHTML = "";
    if (isEdit && targetOrder.items) {
        targetOrder.items.forEach((item, idx) => {
            platformsHTML += createPlatformItemRow(item.platform, item.name, item.cny, item.track, item.status);
        });
    } else {
        platformsHTML = createPlatformItemRow("淘宝", "", 0, "", "等待国内发货");
    }

    const modalHTML = `
        <div id="order-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto py-8">
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-auto">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800">${isEdit ? '深度调整订单信息与全商品状态' : '新建中越合并代购订单'}</h3>
                    <button onclick="closeOrderModal()" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                </div>
                
                <form id="add-order-form" class="p-6 space-y-4 text-xs">
                    <div class="w-1/2">
                        <label class="block text-slate-500 font-bold mb-1">选择越南买家</label>
                        <select id="mo-customer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none">
                            <option value="Tran Thi Mai" ${isEdit && targetOrder.customer === 'Tran Thi Mai' ? 'selected' : ''}>Tran Thi Mai (梅姐姐)</option>
                            <option value="Linh Long" ${isEdit && targetOrder.customer === 'Linh Long' ? 'selected' : ''}>Linh Long (阿龙)</option>
                        </select>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-slate-500 font-bold">采购商品明细控制台</label>
                            <button type="button" id="btn-add-platform" class="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] flex items-center gap-1">
                                <i class="fa-solid fa-plus-circle"></i> 增加一件商品
                            </button>
                        </div>
                        <div id="platform-items-container" class="space-y-2">
                            ${platformsHTML}
                        </div>
                    </div>

                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-slate-500 font-bold mb-1">内部总本金估算</label>
                                <div id="mo-total-cny-display" class="font-mono font-black text-slate-700 text-sm py-1">¥ 0</div>
                            </div>
                            <div>
                                <label class="block text-indigo-900 font-bold mb-1">收取买家的固定货款 (VND)</label>
                                <input type="number" id="mo-buyer-vnd" value="${isEdit ? targetOrder.buyer_vnd : ''}" placeholder="输入最终收取的越南盾" required class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono font-black text-right text-indigo-600 focus:outline-none">
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeOrderModal()" class="w-1/4 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">取消</button>
                        <button type="submit" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-sm transition">保存全部变动</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalCalculation(editIndex);
}

function createPlatformItemRow(platform, name, cny, track, status) {
    const pOpts = ["淘宝", "1688", "拼多多", "咸鱼", "其他"].map(p => `<option value="${p}" ${platform === p ? 'selected' : ''}>${p}</option>`).join("");
    const sOpts = [
        { v: "等待国内发货", t: "🕒 待发货" },
        { v: "集运仓已到货", t: "📦 已到仓" },
        { v: "跨境清关运输中", t: "🚛 运输中" },
        { v: "买家已完成收货", t: "✅ 已签收" }
    ].map(s => `<option value="${s.v}" ${status === s.v ? 'selected' : ''}>${s.t}</option>`).join("");

    return `
        <div class="platform-item grid grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 items-center">
            <div class="col-span-2"><select class="mo-item-platform w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 font-bold text-slate-700">${pOpts}</select></div>
            <div class="col-span-3"><input type="text" placeholder="商品名称" value="${name}" required class="mo-item-name w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium"></div>
            <div class="col-span-2 relative">
                <span class="absolute left-2 top-1.5 text-slate-400 font-mono">¥</span>
                <input type="number" placeholder="本金" value="${cny || ''}" required class="mo-item-cny w-full bg-white border border-slate-200 rounded-lg pl-4 pr-1.5 py-1.5 text-right font-mono font-bold text-slate-700">
            </div>
            <div class="col-span-3"><input type="text" placeholder="国内快递单号(选填)" value="${track || ''}" class="mo-item-track w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-[11px]"></div>
            <div class="col-span-1.5 col-start-11 flex gap-1 items-center justify-end">
                <select class="mo-item-status bg-white border border-slate-200 rounded-lg px-1 py-1.5 font-bold text-[11px] text-slate-600">${sOpts}</select>
                <button type="button" onclick="removePlatformItem(this)" class="text-rose-400 hover:text-rose-600 p-1 text-sm"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        </div>
    `;
}

function openAddOrderModal() { openOrderFormModal(null); }
function openEditOrderModal(index) { openOrderFormModal(index); }

window.removePlatformItem = function(btn) {
    const container = document.getElementById("platform-items-container");
    if(container.children.length > 1) {
        btn.closest('.platform-item').remove();
        window.updateTotalCnySum();
    } else { alert("至少需要保留一个商品项目。"); }
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

    document.getElementById("add-order-form").addEventListener("submit", (e) => {
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

        if (editIndex !== null) {
            window.ERP_STORE.orders[editIndex].customer = cust;
            window.ERP_STORE.orders[editIndex].buyer_vnd = vnd;
            window.ERP_STORE.orders[editIndex].items = itemsList;
        } else {
            const newId = "#ORD-" + Math.floor(10000 + Math.random() * 90000);
            window.ERP_STORE.orders.unshift({ id: newId, customer: cust, buyer_vnd: vnd, items: itemsList });
        }

        refreshOrdersView();
        closeOrderModal();
    });
}

function closeOrderModal() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.remove();
}
