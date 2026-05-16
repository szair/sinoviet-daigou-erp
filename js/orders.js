function renderOrders() {
    let rowsHTML = "";
    window.ERP_STORE.orders.forEach((ord, index) => {
        const productName = ord.desc || "代购商品";
        const buyerVnd = ord.buyer_vnd ? ord.buyer_vnd.toLocaleString() + " ₫" : "未计算";
        const trackNums = ord.tracks && ord.tracks.length > 0 ? ord.tracks.join("<br>") : "<span class='text-slate-300'>暂无单号</span>";

        // 根据不同状态渲染精细化的 Tailwind 彩色标签
        let statusBadge = "";
        switch (ord.status) {
            case "等待国内发货":
                statusBadge = `<span class="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-100">等待国内发货</span>`;
                break;
            case "集运仓已到货":
                statusBadge = `<span class="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">集运仓已到货</span>`;
                break;
            case "跨境清关运输中":
                statusBadge = `<span class="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100">跨境运输中</span>`;
                break;
            case "买家已完成收货":
                statusBadge = `<span class="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">已完成收货</span>`;
                break;
            default:
                statusBadge = `<span class="bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">${ord.status}</span>`;
        }

        rowsHTML += `
            <tr class="hover:bg-slate-50/80 transition text-xs font-semibold text-slate-600 border-b border-slate-100">
                <td class="p-4"><input type="checkbox" class="rounded border-slate-300"></td>
                <td class="p-4 font-mono font-bold text-slate-900">${ord.id}</td>
                <td class="p-4 text-slate-700">${ord.customer}</td>
                <td class="p-4 text-slate-500 max-w-xs leading-relaxed">${productName}</td>
                <td class="p-4 text-center">${statusBadge}</td>
                <td class="p-4 text-right font-mono text-slate-400">¥${ord.cny ? ord.cny.toLocaleString() : '0'}</td>
                <td class="p-4 text-center font-mono text-[11px] leading-relaxed text-slate-500">${trackNums}</td>
                <td class="p-4 text-right font-mono text-indigo-600">${buyerVnd}</td>
                <td class="p-4 text-center">
                    <button onclick="openEditOrderModal(${index})" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition font-bold text-[11px]">
                        <i class="fa-solid fa-pen-to-square"></i> 修改
                    </button>
                </td>
            </tr>
        `;
    });

    return `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <!-- 头部管理条 -->
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div class="flex gap-2">
                    <button id="btn-trigger-add-order" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
                        <i class="fa-solid fa-plus"></i> 新增多平台代购订单
                    </button>
                    <button class="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition">批量导出对账单</button>
                </div>
                <div class="text-[11px] font-bold text-slate-400 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100">
                    💡 今日换算基准汇率：1 CNY = ${window.ERP_STORE.system_rate} VND (支持多状态跟踪及随时订单数据修改)
                </div>
            </div>

            <!-- 数据展示大表格 -->
            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                            <th class="p-4 w-12"><input type="checkbox" class="rounded border-slate-300"></th>
                            <th class="p-4">订单号</th>
                            <th class="p-4">客户名</th>
                            <th class="p-4">采购商品明细 (平台/名称)</th>
                            <th class="p-4 text-center">当前状态</th>
                            <th class="p-4 text-right">内部本金 (CNY)</th>
                            <th class="p-4 text-center">国内发货物流单号</th>
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
    if(btn) btn.addEventListener("click", () => openOrderFormModal(null)); // 传入 null 代表是全新创建
}

// 封装成统一的弹窗控制中心（支持新建与修改复用）
function openOrderFormModal(editIndex = null) {
    const isEdit = editIndex !== null;
    const targetOrder = isEdit ? window.ERP_STORE.orders[editIndex] : null;

    // 解析出可能已经存在的平台组合数据
    let platformsHTML = "";
    if (isEdit && targetOrder.desc) {
        // 通过正则和切分将字符串 "[淘宝] 商品" 还原回输入框
        const parts = targetOrder.desc.split(" + ");
        parts.forEach(part => {
            const match = part.match(/^\[(.*?)\]\s*(.*)$/);
            const pName = match ? match[1] : "淘宝";
            const iName = match ? match[2] : part;
            // 估计估算每项本金，或者平摊（修改时可以二次校正）
            const approxCny = Math.round(targetOrder.cny / parts.length); 

            platformsHTML += createPlatformItemRow(pName, iName, approxCny);
        });
    } else {
        // 新建订单时的默认第一行
        platformsHTML = createPlatformItemRow("淘宝", "", 0);
    }

    // 解析可能已经存在的物流单号
    let tracksHTML = "";
    if (isEdit && targetOrder.tracks && targetOrder.tracks.length > 0) {
        targetOrder.tracks.forEach(tr => {
            tracksHTML += createTrackItemRow(tr);
        });
    } else {
        tracksHTML = createTrackItemRow("");
    }

    // 默认选中的状态
    const sWait = (!isEdit || targetOrder.status === "等待国内发货") ? "selected" : "";
    const sArrive = (isEdit && targetOrder.status === "集运仓已到货") ? "selected" : "";
    const sTransit = (isEdit && targetOrder.status === "跨境清关运输中") ? "selected" : "";
    const sDone = (isEdit && targetOrder.status === "买家已完成收货") ? "selected" : "";

    const modalHTML = `
        <div id="order-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto py-8">
            <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-auto">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800">${isEdit ? '修改/调整现有代购订单' : '新建中越代购订单 (多平台/多单号模式)'}</h3>
                    <button onclick="closeOrderModal()" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                </div>
                
                <form id="add-order-form" class="p-6 space-y-4 text-xs">
                    <!-- 1. 买家选择与状态流转 -->
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-500 font-bold mb-1">选择越南买家</label>
                            <select id="mo-customer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                                <option value="Tran Thi Mai" ${isEdit && targetOrder.customer === 'Tran Thi Mai' ? 'selected' : ''}>Tran Thi Mai (梅姐姐)</option>
                                <option value="Linh Long" ${isEdit && targetOrder.customer === 'Linh Long' ? 'selected' : ''}>Linh Long (阿龙)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-500 font-bold mb-1">订单业务状态</label>
                            <select id="mo-status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-indigo-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                                <option value="等待国内发货" ${sWait}>🕒 等待国内发货</option>
                                <option value="集运仓已到货" ${sArrive}>📦 集运仓已到货</option>
                                <option value="跨境清关运输中" ${sTransit}>🚛 跨境清关运输中</option>
                                <option value="买家已完成收货" ${sDone}>✅ 买家已完成收货</option>
                            </select>
                        </div>
                    </div>

                    <!-- 2. 多平台采购商品明细区域 -->
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-slate-500 font-bold">采购商品与本金明细 (买家弃单可点右侧垃圾桶删除该项)</label>
                            <button type="button" id="btn-add-platform" class="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] flex items-center gap-1">
                                <i class="fa-solid fa-plus-circle"></i> 增加一个平台
                            </button>
                        </div>
                        <div id="platform-items-container" class="space-y-2">
                            ${platformsHTML}
                        </div>
                    </div>

                    <!-- 3. 收取买家费用（直接输入一口价越南盾） -->
                    <div class="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-slate-600 font-bold mb-1">内部总本金估算</label>
                                <div id="mo-total-cny-display" class="font-mono font-black text-slate-700 text-sm py-1.5 px-1">¥ 0</div>
                            </div>
                            <div>
                                <label class="block text-indigo-900 font-bold mb-1">收取买家的商品费用 (VND)</label>
                                <input type="number" id="mo-buyer-vnd" value="${isEdit ? targetOrder.buyer_vnd : ''}" placeholder="直接输入收取的越南盾金额" required class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono font-black text-right text-indigo-600 focus:outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- 4. 多物流单号追踪区域 -->
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-slate-500 font-bold">国内发货物流单号 (卖家多次发货可在此处追增)</label>
                            <button type="button" id="btn-add-track" class="text-slate-600 hover:text-slate-800 font-bold text-[11px] flex items-center gap-1">
                                <i class="fa-solid fa-circle-plus"></i> 增加物流单号
                            </button>
                        </div>
                        <div id="track-items-container" class="space-y-1.5">
                            ${tracksHTML}
                        </div>
                    </div>

                    <!-- 5. 提交区 -->
                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeOrderModal()" class="w-1/3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">取消</button>
                        <button type="submit" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-sm transition">
                            ${isEdit ? '保存修改内容' : '确认创建订单'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalCalculation(editIndex);
}

// 助手函数：构建商品行 HTML
function createPlatformItemRow(platform, name, cny) {
    const options = ["淘宝", "1688", "拼多多", "咸鱼", "其他"].map(p => 
        `<option value="${p}" ${platform === p ? 'selected' : ''}>${p}</option>`
    ).join("");

    return `
        <div class="platform-item flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <select class="mo-item-platform bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-700 w-24">
                ${options}
            </select>
            <input type="text" placeholder="输入商品名字" value="${name}" required class="mo-item-name flex-grow bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium">
            <div class="w-24 relative">
                <span class="absolute left-2 top-1.5 text-slate-400 font-mono">¥</span>
                <input type="number" placeholder="本金" value="${cny || ''}" required class="mo-item-cny w-full bg-white border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-right font-mono font-bold text-slate-700">
            </div>
            <button type="button" onclick="removePlatformItem(this)" class="text-rose-400 hover:text-rose-600 px-1 text-sm"><i class="fa-regular fa-trash-can"></i></button>
        </div>
    `;
}

// 助手函数：构建物流单号行 HTML
function createTrackItemRow(trackVal) {
    return `
        <div class="track-item flex gap-2 items-center">
            <input type="text" placeholder="输入国内快递单号 (选填)" value="${trackVal}" class="mo-track-input flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono">
            <button type="button" onclick="removeTrackItem(this)" class="text-slate-400 hover:text-slate-600 px-1"><i class="fa-solid fa-minus"></i></button>
        </div>
    `;
}

// 供主干触发调用的包装方法
function openAddOrderModal() { openOrderFormModal(null); }
function openEditOrderModal(index) { openOrderFormModal(index); }

// 动态增删商品明细
window.removePlatformItem = function(btn) {
    const container = document.getElementById("platform-items-container");
    if(container.children.length > 1) {
        btn.closest('.platform-item').remove();
        window.updateTotalCnySum();
    } else {
        alert("至少需要保留一个商品项目。如果是买家整单全部不想要了，建议将整单状态修改为【已完成/取消】。");
    }
};

window.removeTrackItem = function(btn) {
    const container = document.getElementById("track-items-container");
    if(container.children.length > 1) {
        btn.closest('.track-item').remove();
    } else {
        // 允许清空单号输入框
        btn.closest('.track-item').querySelector('.mo-track-input').value = "";
    }
};

window.updateTotalCnySum = function() {
    const cnyInputs = document.querySelectorAll(".mo-item-cny");
    let totalCny = 0;
    cnyInputs.forEach(input => {
        totalCny += parseFloat(input.value) || 0;
    });
    
    const displayBox = document.getElementById("mo-total-cny-display");
    if(displayBox) displayBox.innerText = "¥ " + totalCny.toLocaleString();

    const buyerVndInput = document.getElementById("mo-buyer-vnd");
    if(buyerVndInput && buyerVndInput.value === "") {
        const baseVnd = totalCny * window.ERP_STORE.system_rate;
        buyerVndInput.placeholder = "保本参考: " + Math.round(baseVnd).toLocaleString() + " ₫";
    }
};

function setupModalCalculation(editIndex) {
    const containerPlatform = document.getElementById("platform-items-container");
    const containerTrack = document.getElementById("track-items-container");
    
    // 增加平台按钮
    document.getElementById("btn-add-platform").addEventListener("click", () => {
        const rowHTML = createPlatformItemRow("淘宝", "", 0);
        containerPlatform.insertAdjacentHTML('beforeend', rowHTML);
        bindCnyInputListener();
    });

    // 增加单号
    document.getElementById("btn-add-track").addEventListener("click", () => {
        const rowHTML = createTrackItemRow("");
        containerTrack.insertAdjacentHTML('beforeend', rowHTML);
    });

    function bindCnyInputListener() {
        const cnyInputs = document.querySelectorAll(".mo-item-cny");
        cnyInputs.forEach(input => {
            input.removeEventListener("input", window.updateTotalCnySum);
            input.addEventListener("input", window.updateTotalCnySum);
        });
    }
    bindCnyInputListener();
    window.updateTotalCnySum();

    // 表单提交（兼容保存和新建）
    document.getElementById("add-order-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        let descParts = [];
        let totalCnySum = 0;
        document.querySelectorAll(".platform-item").forEach(item => {
            const platform = item.querySelector(".mo-item-platform").value;
            const name = item.querySelector(".mo-item-name").value;
            const cny = parseFloat(item.querySelector(".mo-item-cny").value) || 0;
            
            descParts.push(`[${platform}] ${name}`);
            totalCnySum += cny;
        });

        let tracksList = [];
        document.querySelectorAll(".mo-track-input").forEach(input => {
            if(input.value.trim() !== "") {
                tracksList.push(input.value.trim());
            }
        });

        const statusValue = document.getElementById("mo-status").value;
        const customerValue = document.getElementById("mo-customer").value;
        const buyerVndValue = parseFloat(document.getElementById("mo-buyer-vnd").value) || 0;

        if (editIndex !== null) {
            // 【修改模式】：直接覆盖旧有索引位置的数据
            window.ERP_STORE.orders[editIndex].customer = customerValue;
            window.ERP_STORE.orders[editIndex].desc = descParts.join(" + ");
            window.ERP_STORE.orders[editIndex].status = statusValue;
            window.ERP_STORE.orders[editIndex].cny = totalCnySum;
            window.ERP_STORE.orders[editIndex].buyer_vnd = buyerVndValue;
            window.ERP_STORE.orders[editIndex].tracks = tracksList;
        } else {
            // 【新建模式】：插入一条全新带有随机单号的数据
            const newId = "#ORD-" + Math.floor(10000 + Math.random() * 90000);
            window.ERP_STORE.orders.unshift({
                id: newId,
                customer: customerValue,
                desc: descParts.join(" + "),
                status: statusValue,
                cny: totalCnySum,
                buyer_vnd: buyerVndValue,
                tracks: tracksList,
                vtrack: "凭祥跨境仓"
            });
        }

        // 刷新视图并关闭弹窗
        const mv = document.getElementById("main-view");
        mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
        init_orders(); 
        closeOrderModal();
    });
}

function closeOrderModal() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.remove();
}
