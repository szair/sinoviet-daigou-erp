// ==========================================
// 📦 中越通跨境代购 ERP - 订单业务核心模块 (完整无错修复版)
// ==========================================

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
        if (st === "已取消" && isActive) {
            activeClass = "bg-slate-500 text-white border-slate-500 shadow-sm";
        }

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
        
        if (ord.items) {
            ord.items.forEach(item => {
                totalCny += parseFloat(item.cny || 0);
                itemsSummary += `
                    <div class="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60 text-xs">
                        <div>
                            <span class="text-slate-400 font-black">[${item.platform}]</span>
                            <span class="text-slate-700 font-bold ml-1">${item.name}</span>
                        </div>
                        <span class="font-mono font-black text-slate-500">¥${item.cny}</span>
                    </div>
                `;
            });
        }

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
    if(mv) {
        mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
    }
};

window.init_orders = function() {
    // 基础生命周期挂载
};

// =========================================================
// 🔄 完璧归赵！深度编辑表单 与 安全控制台的完全体融合弹窗
// =========================================================
window.openOrderDetailModalForManage = function(index) {
    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    const orderIdTail = ord.id.split('-')[1] || ord.id;

    // 1. 生成买家下拉选择框
    let customerOptions = "";
    window.ERP_STORE.customers.forEach(c => {
        const selected = ord.customer === c.name ? "selected" : "";
        customerOptions += `<option value="${c.name}" ${selected}>CUST-${c.id} - ${c.name}</option>`;
    });

    // 2. 完美找回：生成内部多件商品行表单明细 (支持修改名称、本金、单号、状态)
    let itemsFormHTML = "";
    if (ord.items && ord.items.length > 0) {
        ord.items.forEach((item, itemIdx) => {
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
                        <input type="text" class="item-name col-span-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold" value="${item.name}" placeholder="${isZh?'商品名称':'Tên sản phẩm'}">
                    </div>
                    <div class="grid grid-cols-2 gap-1.5">
                        <div class="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono font-bold">
                            <span class="text-slate-400 mr-1">¥</span>
                            <input type="number" class="item-cny w-full focus:outline-none" value="${item.cny}" placeholder="本金" oninput="calculateFormTotalCny()">
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
    }

    // 3. 构建安全的底部控制面板
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

    // 4. 完美编织的顶级高保真 H5 弹窗模板
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
                            <button type="button" onclick="addItemRowToFormDynamic()" class="text-indigo-600 font-black flex items-center gap-1 text-[11px]"><i class="fa-solid fa-circle-plus"></i> ${isZh?'增加一件商品':'Thêm hàng'}</button>
                        </div>
                        <div id="edit-order-items-container" class="space-y-3">
                            ${itemsFormHTML}
                        </div>
                    </div>

                    <div class="bg-slate-50 p-3 rounded-2xl flex justify-between items-center text-xs">
                        <span class="text-slate-400">${isZh?'内部总本金估算':'Tổng tiền vốn估算'}:</span>
                        <span id="form-total-cny-display" class="font-mono font-black text-slate-900 text-sm">¥0</span>
                    </div>

                    ${dangerZoneHTML}
                </form>

                <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0">
                    <button type="button" onclick="closeOrderModal()" class="w-1/3 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold text-xs">${isZh?'取消':'Hủy'}</button>
                    <button type="button" onclick="submitOrderUpdateSaved(${index})" class="w-2/3 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs shadow-md active:scale-[0.98] transition-all">${isZh?'保存全部变动':'Lưu thay đổi'}</button>
                </div>

            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    calculateFormTotalCny(); // 弹起时瞬间计算初始本金总额
    window.pushModalHistoryState("order-manage-modal");
};

// ⚡ 核心逻辑：表单实时算账
window.calculateFormTotalCny = function() {
    let total = 0;
    document.querySelectorAll(".item-cny").forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    const el = document.getElementById("form-total-cny-display");
    if(el) el.innerText = "¥" + total.toLocaleString();
};

// ⚡ 核心逻辑：增减单件商品行
window.addItemRowToFormDynamic = function() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    const container = document.getElementById("edit-order-items-container");
    const rowHTML = `
        <div class="item-form-row bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 relative pt-7 animate-fadeIn">
            <button type="button" onclick="removeItemRowFromForm(this)" class="absolute top-2 right-3 text-rose-500 font-bold text-xs">✕ ${isZh?'删除该件':'Xóa'}</button>
            <div class="grid grid-cols-3 gap-1.5">
                <select class="item-platform bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800">
                    <option value="淘宝">淘宝</option>
                    <option value="拼多多">拼多多</option>
                    <option value="1688">1688</option>
                    <option value="其他">其他</option>
                </select>
                <input type="text" class="item-name col-span-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold" placeholder="${isZh?'商品名称':'Tên sản phẩm'}">
            </div>
            <div class="grid grid-cols-2 gap-1.5">
                <div class="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono font-bold">
                    <span class="text-slate-400 mr-1">¥</span>
                    <input type="number" class="item-cny w-full focus:outline-none" placeholder="本金" oninput="calculateFormTotalCny()">
                </div>
                <input type="text" class="item-track bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono font-bold" placeholder="${isZh?'国内单号':'Mã vận đơn'}">
            </div>
            <div>
                <select class="item-status w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700">
                    <option value="等待国内发货">🕒 ${isZh?'等待国内发货':'Chờ giao hàng'}</option>
                    <option value="集运仓已到货">📦 ${isZh?'集运仓已到货':'Đã đến kho'}</option>
                    <option value="跨境清关运输中">🚛 ${isZh?'跨境清关运输中':'Đang vận chuyển'}</option>
                    <option value="买家已完成收货">✅ ${isZh?'买家已完成收货':'Đã nhận hàng'}</option>
                </select>
            </div>
        </div>
    `;
    if(container) container.insertAdjacentHTML('beforeend', rowHTML);
};

window.removeItemRowFromForm = function(btn) {
    const row = btn.closest(".item-form-row");
    if(row) {
        row.remove();
        calculateFormTotalCny();
    }
};

// ==========================================
// 💾 数据吞吐：收集完整表单数据并保存到 D1
// ==========================================
window.submitOrderUpdateSaved = async function(index) {
    const ord = window.ERP_STORE.orders[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    const customer = document.getElementById("edit-order-customer").value;
    
    // 组装最新打包出来的 items 数组
    const updatedItems = [];
    document.querySelectorAll(".item-form-row").forEach(row => {
        updatedItems.push({
            platform: row.querySelector(".item-platform").value,
            name: row.querySelector(".item-name").value.trim(),
            cny: parseFloat(row.querySelector(".item-cny").value) || 0,
            track: row.querySelector(".item-track").value.trim(),
            status: row.querySelector(".item-status").value
        });
    });

    if (updatedItems.length === 0) {
        alert(isZh ? "⚠️ 订单内必须至少保留一件商品！若客户整单取消，请点击下方的【客户整单取消】按钮。" : "⚠️ Đơn hàng phải có ít nhất 1 sản phẩm!");
        return;
    }

    // 联动云端同步更新
    const res = await fetch(`${window.API_BASE_URL}/api/orders/update_full`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: ord.id,
            customer: customer,
            items: updatedItems
        })
    });

    if (res.ok) {
        ord.customer = customer;
        ord.items = updatedItems;
        closeOrderModal();
        window.renderGlobalSkeleton(); // 全面热重绘大盘与财务
        alert(isZh ? "🎉 订单修改已成功云同步保存！" : "🎉 Lưu thay đổi thành công!");
    } else {
        alert("D1 database update error");
    }
};

// ⚡ 逻辑：软取消与恢复一键切换
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
        window.renderGlobalSkeleton();
        alert(isZh ? "🎉 订单状态已变动！" : "🎉 Cập nhật thành công!");
    } else {
        alert("D1 Link Error");
    }
};

// ⚡ 逻辑：彻底粉碎防误触校验锁
window.triggerUltimateDeleteOrder = function(orderId, tail, index) {
    const isZh = window.ERP_STORE.current_lang === "zh";
    const promptMsg = isZh 
        ? `🚨 【终极警告】：此操作将永久物理粉碎删除该订单，绝对不可找回！\n若确定要销毁，请输入该单的数字尾号【 ${tail} 】进行验证：`
        : `🚨 【CẢNH BÁO TỐI CAO】: Hành động này sẽ xóa vĩnh viễn đơn hàng khỏi D1!\nNhập mã đuôi 【 ${tail} 】 để xác nhận:`;
        
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
                alert(isZh ? "🗑️ 订单已被永久物理销毁。" : "🗑️ Đã xóa đơn hàng vĩnh viễn.");
            }
        });
    } else if (userInput !== null) {
        alert(isZh ? "❌ 尾号校验失败！操作已强行拦截。" : "❌ Sai mã xác nhận! Đã ngăn chặn hành vi xóa.");
    }
};

window.closeOrderModal = function() {
    const m = document.getElementById("order-manage-modal");
    if(m) m.remove();
};

window.openCreateOrderModalDirectly = function() {
    // 保持你原本新增订单的触发器接口
};
