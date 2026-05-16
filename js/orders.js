function renderOrders() {
    // 动态拼接全局变量中预设的数据行数
    let rowsHTML = "";
    window.ERP_STORE.orders.forEach(ord => {
        // 根据汇率实时结算越南盾
        const totalVnd = ord.cny * (1 + window.ERP_STORE.currency_fee / 100) * window.ERP_STORE.system_rate;
        rowsHTML += `
            <tr class="hover:bg-slate-50/80 transition text-xs font-semibold text-slate-600 border-b border-slate-100">
                <td class="p-4"><input type="checkbox" class="rounded border-slate-300"></td>
                <td class="p-4 font-mono font-bold text-slate-900">${ord.id}</td>
                <td class="p-4 text-slate-700">${ord.customer}</td>
                <td class="p-4 text-slate-400 max-w-xs truncate">${ord.desc}</td>
                <td class="p-4 text-center"><span class="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">${ord.status}</span></td>
                <td class="p-4 text-right font-mono">¥${ord.cny.toLocaleString()}</td>
                <td class="p-4 text-slate-400 font-mono text-center">${ord.vtrack}</td>
                <td class="p-4 text-right font-mono text-indigo-600">${Math.round(totalVnd).toLocaleString()} ₫</td>
            </tr>
        `;
    });

    return `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <!-- 头部管理条 -->
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div class="flex gap-2">
                    <button id="btn-trigger-add-order" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
                        <i class="fa-solid fa-plus"></i> 新增代购订单
                    </button>
                    <button class="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition">批量导出对账单</button>
                </div>
                <div class="text-[11px] font-bold text-slate-400 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100">
                    💡 今日结算标准：1 CNY = ${window.ERP_STORE.system_rate} VND (代购费: ${window.ERP_STORE.currency_fee}%)
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
                            <th class="p-4">商品摘要</th>
                            <th class="p-4 text-center">状态</th>
                            <th class="p-4 text-right">支付金额 (CNY)</th>
                            <th class="p-4 text-center">跨境状态</th>
                            <th class="p-4 text-right rounded-r-xl">结算金额 (VND)</th>
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

// 唤起高保真新建订单弹窗
function openAddOrderModal() {
    const modalHTML = `
        <div id="order-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800">新建中越代购订单</h3>
                    <button onclick="closeOrderModal()" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                </div>
                
                <form id="add-order-form" class="p-6 space-y-4 text-xs">
                    <div>
                        <label class="block text-slate-500 font-bold mb-1">选择越南买家</label>
                        <select id="mo-customer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                            <option value="Tran Thi Mai">Tran Thi Mai (梅姐姐) - 胡志明市</option>
                            <option value="Linh Long">Linh Long (阿龙) - 河内</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-slate-500 font-bold mb-1">源头商品链接 / 采购备注</label>
                        <textarea id="mo-link" rows="2" required placeholder="粘贴淘宝/1688原厂商品链接，备注颜色尺码及采购数量" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50">
                        <div>
                            <label class="block text-slate-600 font-bold mb-1">采购本金 (CNY ¥)</label>
                            <input type="number" id="mo-cny" value="1250" step="0.01" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono font-black text-right focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-slate-600 font-bold mb-1">代购费率 (%)</label>
                            <input type="number" id="mo-fee" value="${window.ERP_STORE.currency_fee}" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-right focus:outline-none">
                        </div>
                        <div class="col-span-2 border-t border-indigo-100/60 my-1"></div>
                        <div class="col-span-2">
                            <label class="block text-indigo-900 font-bold mb-1">越南端预估结算金额</label>
                            <input type="text" id="mo-vnd" readonly class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-right font-mono font-black text-indigo-600 text-sm">
                        </div>
                    </div>

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

function setupModalCalculation() {
    const cnyIn = document.getElementById("mo-cny");
    const feeIn = document.getElementById("mo-fee");
    const vndOut = document.getElementById("mo-vnd");
    if(!cnyIn || !feeIn || !vndOut) return;

    const runCalc = () => {
        const cny = parseFloat(cnyIn.value) || 0;
        const fee = parseFloat(feeIn.value) || 0;
        const outVnd = cny * (1 + fee / 100) * window.ERP_STORE.system_rate;
        vndOut.value = Math.round(outVnd).toLocaleString() + " ₫";
    };

    cnyIn.addEventListener("input", runCalc);
    feeIn.addEventListener("input", runCalc);
    runCalc(); // 初始化执行

    // 监听表单拦截提交
    document.getElementById("add-order-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        // 动态向本地虚拟数据中注入一条新生成的高保真订单
        const newId = "#ORD-" + Math.floor(10000 + Math.random() * 90000);
        window.ERP_STORE.orders.unshift({
            id: newId,
            customer: document.getElementById("mo-customer").value,
            desc: document.getElementById("mo-link").value,
            status: "已国内签收",
            cny: parseFloat(cnyIn.value) || 0,
            vtrack: "广州仓 ➔ 凭祥"
        });

        // 强行刷新当前视图刷新表格
        const mv = document.getElementById("main-view");
        mv.innerHTML = `<div class="view-section">${renderOrders()}</div>`;
        init_orders(); // 重新绑定添加按钮事件
        closeOrderModal();
    });
}

function closeOrderModal() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.remove();
}
