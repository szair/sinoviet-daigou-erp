// ==========================================
// 📦 中越通跨境代购 ERP - 订单业务核心模块 (完全体)
// ==========================================

function renderOrders() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    // 1. 初始化当前选中的药丸状态（如果没选，默认是不含已取消的全部正常订单）
    if (window.ERP_STORE.filter_status === undefined) {
        window.ERP_STORE.filter_status = null; 
    }
    const currentFilter = window.ERP_STORE.filter_status;

    // 2. 📱 H5 顶级多维动态药丸导航控制台
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
        // 如果是已取消状态，按钮用灰色基调，跟正常业务区分开
        let activeClass = isActive ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-500 border-slate-200";
        if (st === "已取消" && isActive) {
            activeClass = "bg-slate-500 text-white border-slate-500 shadow-sm";
        }

        pillsHTML += `
            <button onclick="filterOrdersByStatus('${st}')" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${activeClass}" style="touch-action: manipulation;">
                ${statusLabels[st]}
            </button>
        `;
    });

    // 3. 过滤并洗涤订单流水
    let filteredOrders = window.ERP_STORE.orders;
    if (currentFilter !== null) {
        // 精准看某一个状态（包括已取消）
        filteredOrders = window.ERP_STORE.orders.filter(o => o.status === currentFilter);
    } else {
        // ⚡ 核心提效：默认不看「已取消」的单，还你一个纯净的作业区
        filteredOrders = window.ERP_STORE.orders.filter(o => o.status !== "已取消");
    }

    // 4. 构建代购订单列表
    let listHTML = "";
    filteredOrders.forEach((ord, index) => {
        let itemsSummary = "";
        let totalCny = 0;
        
        if (ord.items) {
            ord.items.forEach(item => {
                totalCny += parseFloat(item.cny || 0);
                itemsSummary += `
                    <div class="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60 text-xs select-none">
                        <div>
                            <span class="text-slate-400 font-black">[${item.platform}]</span>
                            <span class="text-slate-700 font-bold ml-1">${item.name}</span>
                        </div>
                        <span class="font-mono font-black text-slate-500">¥${item.cny}</span>
                    </div>
                `;
            });
        }

        // 取消状态的卡片进行半透明置灰，防误触
        const isCanceled = ord.status === "已取消";
        const cardOpacity = isCanceled ? "opacity-65 bg-slate-50/70 border-slate-200" : "bg-white border-slate-100";

        listHTML += `
            <div class="bg-white rounded-2xl p-5 shadow-sm border space-y-4 transition-all ${cardOpacity}">
                <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-black text-slate-900">${ord.customer}</span>
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
            <button onclick="openCreateOrderModalDirectly()" class="w-full bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all" style="touch-action: manipulation;">
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

// 药丸一键切换联动
window.filterOrdersByStatus = function(status) {
    window.ERP_STORE.filter_status = status;
    const mv = document.getElementById("main-view");
    if(mv) {
        mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
        window.init_orders();
    }
};

window.init_orders = function() {
    // 预留的滑动或者高级触控手势拦截
};

// ==========================================
// ⚡ 核心管理控制台：软取消、一键恢复、终极彻底粉碎
// ==========================================
window.openOrderDetailModalForManage = function(index) {
    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    const orderIdTail = ord.id.split('-')[1] || ord.id; // 抽取尾号供硬粉碎校验

    let bottomConsoleHTML = "";

    if (ord.status === "已取消") {
        // 废单状态：提供安全召回机制
        bottomConsoleHTML = `
            <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-3">
                <p class="text-[11px] font-bold text-amber-700 text-center">
                    ⚠️ ${isZh ? '当前订单已被整单取消，大盘已停止计入此流水' : 'Đơn hàng này đã bị hủy, hệ thống đã ngừng tính doanh thu'}
                </p>
                <button type="button" onclick="toggleOrderCancelStatus(${index}, false)" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs shadow-sm active:scale-[0.98] transition-all">
                    <i class="fa-solid fa-rotate-left"></i> ${isZh ? '一键恢复此整单至正常代发货' : 'Khôi phục đơn hàng'}
                </button>
            </div>
        `;
    } else {
        // 正常业务单：提供无痛取消和带有输入校验的高阻断物理粉碎
        bottomConsoleHTML = `
            <div class="border-t border-dashed border-slate-200 pt-4 space-y-3">
                <div class="flex gap-3">
                    <button type="button" onclick="toggleOrderCancelStatus(${index}, true)" class="w-1/2 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-xs active:bg-slate-200 transition-all">
                        <i class="fa-solid fa-ban text-rose-500"></i> ${isZh ? '客户整单取消' : 'Hủy toàn bộ đơn'}
                    </button>
                    
                    <button type="button" onclick="triggerUltimateDeleteOrder('${ord.id}', '${orderIdTail}', ${index})" class="w-1/2 bg-rose-50 text-rose-600 py-3 rounded-xl font-black text-xs border border-rose-100 active:bg-rose-600 active:text-white transition-all">
                        <i class="fa-regular fa-trash-can"></i> ${isZh ? '彻底粉碎该单' : 'Xóa vĩnh viễn đơn'}
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
                
                <div class="text-xs space-y-1 bg-slate-50 p-3 rounded-xl">
                    <div><span class="text-slate-400 font-bold">${isZh?'买家业主':'Khách hàng'}:</span> <span class="font-black text-slate-800">${ord.customer}</span></div>
                    <div><span class="text-slate-400 font-bold">${isZh?'当前状态':'Trạng thái'}:</span> <span class="font-mono font-black text-indigo-600">${ord.status}</span></div>
                </div>

                ${bottomConsoleHTML}
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("order-manage-modal");
};

// ⚡ 逻辑 1：一键标记取消/恢复（无痛丝滑）
window.toggleOrderCancelStatus = async function(index, shouldCancel) {
    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    const nextStatus = shouldCancel ? "已取消" : "等待国内发货";
    
    const res = await fetch(`${window.API_BASE_URL}/api/orders/update_status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ord.id, status: nextStatus })
    });

    if (res.ok) {
        ord.status = nextStatus;
        if(ord.items) {
            ord.items.forEach(item => item.status = shouldCancel ? "已取消" : "等待国内发货");
        }
        closeOrderModal();
        window.renderGlobalSkeleton(); // 热重绘全网大盘与财务模块
        alert(isZh ? "🎉 订单状态已完成云同步变动！" : "🎉 Cập nhật trạng thái thành công!");
    } else {
        alert("D1 Link Error");
    }
};

// ⚡ 逻辑 2：绝对防误触物理粉碎锁（需要手动敲击校验尾号）
window.triggerUltimateDeleteOrder = function(orderId, tail, index) {
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    const promptMsg = isZh 
        ? `🚨 【终极警告】：此操作将从 Cloudflare D1 数据库中永久物理粉碎抹除该订单及其所有代购商品，绝对不可找回！\n\n如确定要强行销毁，请输入该单的数字尾号【 ${tail} 】进行安全解锁：`
        : `🚨 【CẢNH BÁO TỐI CAO】: Hành động này sẽ xóa vĩnh viễn đơn hàng khỏi D1 database và không thể khôi phục!\n\nNhập mã đuôi 【 ${tail} 】 để xác nhận:`;
        
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
                window.renderGlobalSkeleton();
                alert(isZh ? "🗑️ 该订单已被永久粉碎气化。" : "🗑️ Đã xóa đơn hàng thành công.");
            }
        });
    } else if (userInput !== null) {
        alert(isZh ? "❌ 尾号校验失败！出于数据资产安全考量，安全锁已强行拦截本次粉碎请求。" : "❌ Sai mã xác nhận! Hệ thống đã ngăn chặn hành vi xóa đơn.");
    }
};

window.closeOrderModal = function() {
    const m = document.getElementById("order-manage-modal");
    if(m) m.remove();
};

window.openCreateOrderModalDirectly = function() {
    // 这里保持你原有的新增订单弹窗逻辑代码不变...
    alert(window.ERP_STORE.current_lang === 'zh' ? "请在原有逻辑中调用打开新建表单" : "Vui lòng mở modal tạo đơn");
};
