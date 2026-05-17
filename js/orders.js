// =========================================================
// 📦 中越通跨境代购 ERP - 订单业务 H5 核心模块 (全接口对齐完全体)
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
        
        // 🧼 强力清洗历史遗留的重复买家前缀
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
            <button onclick="openCreateOrderModalDirectly()" class="w-full bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
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

window.init_orders = function() {};

// =========================================================
// 🔄 深度编辑表单 与 安全控制台弹窗
// =========================================================
window.openOrderDetailModalForManage = function(index) {
    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    const orderIdTail = ord.id.split('-')[1] || ord.id;
    let customerName = ord.customer || "未知买家";

    let customerOptions = "";
    window.ERP_STORE.customers.forEach(c => {
        const selected = customerName === c.name ? "selected" : "";
        customerOptions += `<option value="${c.name}" ${selected}>${c.id.replace("CUST-", "")} - ${c.name}</option>`;
    });

    let itemsFormHTML = "";
    let actualItems = ord.items;
    if (typeof actualItems === "string") {
        try { actualItems = JSON.parse(actualItems); } catch(e) { actualItems = []; }
    }
    actualItems = actualItems || [];

    actualItems.forEach((item, itemIdx) => {
        itemsFormHTML += `
            <div class="item-form-row bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 relative pt-7">
                <button type="button" onclick="removeItemRowFromForm(this)" class="absolute top-2 right-3 text-rose-500 font-bold text-xs">✕ ${isZh?'删除该件':'Xóa'}</button>
                <div class="grid grid-cols-3 gap-1.5">
                    <select class="item-platform bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800">
                        <option value="淘宝" ${item.platform==='淘宝'?'selected':''}>淘宝</option>
                        <option value="拼多多" ${item.platform==='拼多多'?'selected':''}>拼多多</option>
                        <option value="1688" ${item.platform==='1688'?'selected':''}>1688</option>
                        <option value="其他" ${item.platform==='其他'?'selected':''}>其他</option>
                    </select>
                    <input type="text" class="item-name col-span-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold" value="${item.name || ''}" placeholder="${isZh?'商品名称':'Tên sản phẩm'}">
                </div>
                <div class="grid grid-cols-2 gap-1.5">
                    <div class="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono font-bold">
                        <span class="text-slate-400 mr-1">¥</span>
                        <input type="number" class="item-cny w-full focus:outline-none" value="${item.cny || 0}" placeholder="本金" oninput="calculateFormTotalCny()">
                    </div>
                    <input type="text" class="item-track bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono font-bold" value="${item.track || ''}" placeholder="${isZh?'国内单号':'Mã vận đơn'}">
                </div>
                <div>
                    <select class="item-status w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700">
                        <option value="等待国内发货" ${item.status==='等待国内发货'?'selected':''}>🕒 ${isZh?'等待国内发货':'Chờ giao hàng'}</option>
                        <option value="集运仓已到货" ${item.status==='集运仓已到货'?'selected':''}>📦 ${isZh?'集运仓已到货':'Đã đến kho'}</option>
                        <option value="跨境清关运输中" ${item.status==='跨境清关运输中'?'selected':''}>🚛 ${isZh?'跨境清关运输中':'Đang vận chuyển'}</option>
                        <option value="买家已完成收货" ${item.status==='买家已完成收货'?'selected':''}>✅ ${isZh?'买家已完成收货':'Đã nhận hàng'}</option>
                    </select>
                </div>
            </div>
        `;
    });

    let dangerZoneHTML = "";
    if (ord.status === "已取消") {
        dangerZoneHTML = `
            <div class="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center space-y-2">
                <span class="text-[11px] font-black text-amber-700 block">⚠️ ${isZh ? '订单处于整单取消状态' : 'Đơn hàng này đã bị hủy'}</span>
                <button type="button" onclick="toggleOrderCancelStatus(${index}, false)" class="w-full bg-emerald-600 text-white py-2 rounded-xl font-black text-xs shadow-sm">
                    <i class="fa-solid fa-rotate-left"></i> ${isZh ? '恢复此整单至正常状态' : 'Khôi phục đơn hàng'}
                </button>
            </div>
        `;
    } else {
        dangerZoneHTML = `
            <div class="flex gap-2 border-t border-dashed border-slate-200 pt-3">
                <button type="button" onclick="toggleOrderCancelStatus(${index}, true)" class="w-1/2 bg-slate-100 text-slate-500 py-2.5 rounded-xl font-bold text-xs">
                    <i class="fa-solid fa-ban text-rose-500"></i> ${isZh ? '客户整单取消' : 'Hủy toàn bộ đơn'}
                </button>
                <button type="button" onclick="triggerUltimateDeleteOrder('${ord.id}', '${orderIdTail}', ${index})" class="w-1/2 bg-rose-50 text-rose-600 py-2.5 rounded-xl font-black text-xs border border-rose-100">
                    <i class="fa-regular fa-trash-can"></i> ${isZh ? '彻底粉碎该单' : 'Xóa vĩnh viễn'}
                </button>
            </div>
        `;
    }

    const modalHTML = `
        <div id="order-manage-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col animate-fadeIn">
                <div class="flex justify-between items-center border-b border-slate-100 p-4 shrink-0">
                    <h3 class="text-xs font-black text-slate-800"><i class="fa-solid fa-pen-to-square text-indigo-500"></i> ${isZh?'修改合并代购订单':'Chỉnh sửa đơn hàng'}</h3>
                    <button type="button" onclick="closeOrderModal()" class="text-slate-400 text-lg">✕</button>
                </div>
                
                <form id="order-edit-form" class="p-4 space-y-4 overflow-y-auto grow text-xs font-bold text-slate-600">
                    <div>
                        <label class="block text-slate-400 mb-1">${isZh?'选择越南买家档案':'Chọn khách hàng'}</label>
                        <select id="edit-order-customer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-black text-slate-800">
                            ${customerOptions}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <label class="text-slate-400">${isZh?'采购商品明细控制台':'Danh sách sản phẩm'}</label>
                            <button type="button" onclick="addItemRowToFormDynamic()" class="text-indigo-600 font-black flex items-center gap-1 text-
