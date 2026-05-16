function renderOrders() {
    // 动态拼接全局变量中预设的数据行数
    let rowsHTML = "";
    window.ERP_STORE.orders.forEach(ord => {
        // 如果数据中没有这些新字段，给定默认展示值
        const productName = ord.desc || "代购商品";
        const buyerVnd = ord.buyer_vnd ? ord.buyer_vnd.toLocaleString() + " ₫" : "未计算";
        const trackNums = ord.tracks && ord.tracks.length > 0 ? ord.tracks.join("<br>") : "<span class='text-slate-300'>暂无单号</span>";

        rowsHTML += `
            <tr class="hover:bg-slate-50/80 transition text-xs font-semibold text-slate-600 border-b border-slate-100">
                <td class="p-4"><input type="checkbox" class="rounded border-slate-300"></td>
                <td class="p-4 font-mono font-bold text-slate-900">${ord.id}</td>
                <td class="p-4 text-slate-700">${ord.customer}</td>
                <td class="p-4 text-slate-500 max-w-xs">${productName}</td>
                <td class="p-4 text-center"><span class="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">${ord.status}</span></td>
                <td class="p-4 text-right font-mono text-slate-400">¥${ord.cny ? ord.cny.toLocaleString() : '0'}</td>
                <td class="p-4 text-center font-mono text-[11px] leading-relaxed text-slate-500">${trackNums}</td>
                <td class="p-4 text-right font-mono text-indigo-600">${buyerVnd}</td>
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
                    💡 今日换算基准汇率：1 CNY = ${window.ERP_STORE.system_rate} VND (支持多平台合并采购与多物流单号追踪)
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
                            <th class="p-4 text-center">状态</th>
                            <th class="p-4 text-right">内部本金 (CNY)</th>
                            <th class="p-4 text-center">国内发货物流单号</th>
                            <th class="p-4 text-right rounded-r-xl">收取买家费用 (VND)</th>
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
    if(btn) btn.addEventListener("click", openAddOrderModal);
}

// 唤起全新业务逻辑的新建订单弹窗
function openAddOrderModal() {
    const modalHTML = `
        <div id="order-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto py-8">
            <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-auto">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800">新建中越代购订单 (多平台/多单号模式)</h3>
                    <button onclick="closeOrderModal()" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                </div>
                
                <form id="add-order-form" class="p-6 space-y-4 text-xs">
                    <!-- 1. 买家选择 -->
                    <div>
                        <label class="block text-slate-500 font-bold mb-1">选择越南买家</label>
                        <select id="mo-customer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                            <option value="Tran Thi Mai">Tran Thi Mai (梅姐姐) - 胡志明市</option>
                            <option value="Linh Long">Linh Long (阿龙) - 河内</option>
                        </select>
                    </div>

                    <!-- 2. 多平台采购商品明细区域 -->
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-slate-500 font-bold">采购商品与本金明细</label>
                            <button type="button" id="btn-add-platform" class="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] flex items-center gap-1">
                                <i class="fa-solid fa-plus-circle"></i> 增加一个平台
                            </button>
                        </div>
                        <!-- 动态平台容器 -->
                        <div id="platform-items-container" class="space-y-2">
                            <!-- 默认第一条明细 -->
                            <div class="platform-item flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <select class="mo-item-platform bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-700 w-24">
                                    <option value="淘宝">淘宝</option>
                                    <option value="1688">1688</option>
                                    <option value="拼多多">拼多多</option>
                                    <option value="咸鱼">咸鱼</option>
                                    <option value="其他">其他</option>
                                </select>
                                <input type="text" placeholder="输入商品名字 (如: 防晒衣)" required class="mo-item-name flex-grow bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium">
                                <div class="w-24 relative">
                                    <span class="absolute left-2 top-1.5 text-slate-400 font-mono">¥</span>
                                    <input type="number" placeholder="本金" required class="mo-item-cny w-full bg-white border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-right font-mono font-bold text-slate-700">
                                </div>
                                <button type="button" onclick="removePlatformItem(this)" class="text-rose-400 hover:text-rose-600 px-1 text-sm"><i class="fa-regular fa-trash-can"></i></button>
                            </div>
                        </div>
                    </div>

                    <!-- 3. 收取买家费用 (直接输入越南盾/支持人民币按汇率转换) -->
                    <div class="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-slate-600 font-bold mb-1">内部总本金估算</label>
                                <div id="mo-total-cny-display" class="font-mono font-black text-slate-700 text-sm py-1.5 px-1">¥ 1,250</div>
                            </div>
                            <div>
                                <label class="block text-indigo-900 font-bold mb-1">收取买家的商品费用 (VND)</label>
                                <input type="number" id="mo-buyer-vnd" placeholder="直接输入收取的越南盾金额" required class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono font-black text-right text-indigo-600 focus:outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- 4. 多物流单号追踪区域 -->
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-slate-500 font-bold">国内发货物流单号 (支持卖家多次发货)</label>
                            <button type="button" id="btn-add-track" class="text-slate-600 hover:text-slate-800 font-bold text-[11px] flex items-center gap-1">
                                <i class="fa-solid fa-circle-plus"></i> 增加物流单号
                            </button>
                        </div>
                        <div id="track-items-container" class="space-y-1.5">
                            <!-- 默认第一个单号输入框 -->
                            <div class="track-item flex gap-2 items-center">
                                <input type="text" placeholder="输入国内快递单号 (选填，若卖家已发货)" class="mo-track-input flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono">
                                <button type="button" onclick="removeTrackItem(this)" class="text-slate-400 hover:text-slate-600 px-1"><i class="fa-solid fa-minus"></i></button>
                            </div>
                        </div>
                    </div>

                    <!-- 5. 提交区 -->
                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeOrderModal()" class="w-1/3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">取消</button>
                        <button type="submit" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-sm transition">确认创建订单</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalCalculation();
}

// 动态增删平台商品明细
window.removePlatformItem = function(btn) {
    const container = document.getElementById("platform-items-container");
    if(container.children.length > 1) {
        btn.closest('.platform-item').remove();
        window.updateTotalCnySum();
    } else {
        alert("至少需要保留一个商品平台明细");
    }
};

// 动态增删物流单号
window.removeTrackItem = function(btn) {
    const container = document.getElementById("track-items-container");
    if(container.children.length > 1) {
        btn.closest('.track-item').remove();
    }
};

// 计算内部总本金求和并提供一个默认参考越南盾价格
window.updateTotalCnySum = function() {
    const cnyInputs = document.querySelectorAll(".mo-item-cny");
    let totalCny = 0;
    cnyInputs.forEach(input => {
        totalCny += parseFloat(input.value) || 0;
    });
    
    const displayBox = document.getElementById("mo-total-cny-display");
    if(displayBox) displayBox.innerText = "¥ " + totalCny.toLocaleString();

    // 顺便给用户在越南盾输入框提供一个基于今日汇率+无手续费的保本底价线建议（不强加限制，可自由修改）
    const buyerVndInput = document.getElementById("mo-buyer-vnd");
    if(buyerVndInput && buyerVndInput.value === "") {
        const baseVnd = totalCny * window.ERP_STORE.system_rate;
        buyerVndInput.placeholder = "保本参考: " + Math.round(baseVnd).toLocaleString() + " ₫";
    }
};

function setupModalCalculation() {
    const containerPlatform = document.getElementById("platform-items-container");
    const containerTrack = document.getElementById("track-items-container");
    
    // 1. 增加平台按钮监听
    document.getElementById("btn-add-platform").addEventListener("click", () => {
        const newItemHTML = `
            <div class="platform-item flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 animate-fadeIn">
                <select class="mo-item-platform bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-700 w-24">
                    <option value="淘宝">淘宝</option>
                    <option value="1688">1688</option>
                    <option value="拼多多">拼多多</option>
                    <option value="咸鱼">咸鱼</option>
                    <option value="其他">其他</option>
                </select>
                <input type="text" placeholder="输入商品名字" required class="mo-item-name flex-grow bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium">
                <div class="w-24 relative">
                    <span class="absolute left-2 top-1.5 text-slate-400 font-mono">¥</span>
                    <input type="number" placeholder="本金" required class="mo-item-cny w-full bg-white border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-right font-mono font-bold text-slate-700">
                </div>
                <button type="button" onclick="removePlatformItem(this)" class="text-rose-400 hover:text-rose-600 px-1 text-sm"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        `;
        containerPlatform.insertAdjacentHTML('beforeend', newItemHTML);
        bindCnyInputListener();
    });

    // 2. 增加物流单号单输入框
    document.getElementById("btn-add-track").addEventListener("click", () => {
        const newTrackHTML = `
            <div class="track-item flex gap-2 items-center animate-fadeIn">
                <input type="text" placeholder="输入追加的物流单号" class="mo-track-input flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono">
                <button type="button" onclick="removeTrackItem(this)" class="text-slate-400 hover:text-slate-600 px-1"><i class="fa-solid fa-minus"></i></button>
            </div>
        `;
        containerTrack.insertAdjacentHTML('beforeend', newTrackHTML);
    });

    // 3. 为本金输入绑定实时累加计算
    function bindCnyInputListener() {
        const cnyInputs = document.querySelectorAll(".mo-item-cny");
        cnyInputs.forEach(input => {
            input.removeEventListener("input", window.updateTotalCnySum);
            input.addEventListener("input", window.updateTotalCnySum);
        });
    }
    bindCnyInputListener();
    window.updateTotalCnySum();

    // 4. 表单提交保存
    document.getElementById("add-order-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        // 抓取并合并多平台商品名字
        let descParts = [];
        let totalCnySum = 0;
        const pItems = document.querySelectorAll(".platform-item");
        pItems.forEach(item => {
            const platform = item.querySelector(".mo-item-platform").value;
            const name = item.querySelector(".mo-item-name").value;
            const cny = parseFloat(item.querySelector(".mo-item-cny").value) || 0;
            
            descParts.push(`[${platform}] ${name}`);
            totalCnySum += cny;
        });

        // 抓取多个物流单号
        let tracksList = [];
        const tInputs = document.querySelectorAll(".mo-track-input");
        tInputs.forEach(input => {
            if(input.value.trim() !== "") {
                tracksList.push(input.value.trim());
            }
        });

        // 组装新代购订单数据
        const newId = "#ORD-" + Math.floor(10000 + Math.random() * 90000);
        window.ERP_STORE.orders.unshift({
            id: newId,
            customer: document.getElementById("mo-customer").value,
            desc: descParts.join(" + "), // 完美展示多平台联购样式
            status: tracksList.length > 0 ? "卖家已发货" : "等待国内发货",
            cny: totalCnySum,
            buyer_vnd: parseFloat(document.getElementById("mo-buyer-vnd").value) || 0,
            tracks: tracksList,
            vtrack: "凭祥跨境仓"
        });

        // 刷新视图
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
