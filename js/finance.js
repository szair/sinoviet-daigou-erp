function renderFinance() {
    let rowsHTML = "";
    let totalProfitCny = 0; // 全网累计净利润
    let totalPendingVnd = 0; // 在途未结应收越南盾

    // 动态遍历全局订单，实时抓取财务账目
    window.ERP_STORE.orders.forEach((ord, index) => {
        // 计算当前订单的内部人民币本金总和
        let orderCnyCost = 0;
        if (ord.items) {
            ord.items.forEach(item => { orderCnyCost += item.cny; });
        }

        // 模拟跨境头程运费（实际业务中，未结单时为0，结单时由老板手动快捷填入）
        // 为了演示高保真效果，如果数据里没录入运费，我们根据重量或本金模拟一个基础货代费
        if (ord.shipping_fee_cny === undefined) {
            ord.shipping_fee_cny = ord.status === "买家已完成收货" ? 35 : 0; 
        }

        const buyerVnd = ord.buyer_vnd || 0;
        const rate = window.ERP_STORE.system_rate;

        // 核心精细化对账公式：收取买家的越南盾 ➔ 按今日汇率折算人民币 ➔ 扣除采购本金 ➔ 扣除发给货代的运费
        const revenueCny = buyerVnd / rate;
        const netProfitCny = revenueCny - orderCnyCost - ord.shipping_fee_cny;

        // 状态分流统计
        let financeStatusBadge = "";
        if (ord.items && ord.items.every(item => item.status === "买家已完成收货")) {
            totalProfitCny += netProfitCny;
            financeStatusBadge = `<span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">💰 账目已结清</span>`;
        } else {
            totalPendingVnd += buyerVnd;
            financeStatusBadge = `<span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100">🕒 在途未对账</span>`;
        }

        rowsHTML += `
            <tr class="hover:bg-slate-50/40 transition text-xs font-semibold text-slate-600 border-b border-slate-100">
                <td class="p-4 font-mono font-bold text-slate-900">${ord.id}</td>
                <td class="p-4 text-slate-700">${ord.customer}</td>
                <td class="p-4 text-right font-mono text-slate-500">¥${orderCnyCost.toLocaleString()}</td>
                <td class="p-4 text-right font-mono text-indigo-600 font-bold">${buyerVnd.toLocaleString()} ₫</td>
                <td class="p-4 text-center">
                    <button onclick="quickUpdateShippingFee(${index})" class="font-mono text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-lg border border-slate-200 transition" title="点击快捷填入或修改此单第三方运费">
                        ¥${ord.shipping_fee_cny || 0} <i class="fa-solid fa-pen text-[9px] text-slate-400 pl-0.5"></i>
                    </button>
                </td>
                <td class="p-4 text-right font-mono ${netProfitCny >= 0 ? 'text-emerald-600 font-black' : 'text-rose-500 font-black'}">
                    ¥${Math.round(netProfitCny).toLocaleString()}
                </td>
                <td class="p-4 text-center">${financeStatusBadge}</td>
            </tr>
        `;
    });

    if (rowsHTML === "") {
        rowsHTML = `<tr><td colspan="7" class="text-slate-400 italic text-center py-8">暂无应收账目，请先去订单管理创建订单。</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm">
                    <span class="text-[10px] text-slate-400 font-bold tracking-wider block uppercase">垫付本金流动资金池 (CNY)</span>
                    <h2 class="text-3xl font-mono font-black mt-2">¥48,650.00</h2>
                    <p class="text-[10px] text-slate-500 mt-4 leading-relaxed">国内微信/支付宝账上余额，用于向各大网店源头代垫付。</p>
                </div>
                <div class="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-sm">
                    <span class="text-[10px] text-indigo-300 font-bold tracking-wider block uppercase">越南银行到账本币总额 (VND)</span>
                    <h2 class="text-3xl font-mono font-black mt-2">165,400,000 ₫</h2>
                    <p class="text-[10px] text-indigo-400 mt-4 leading-relaxed">对应买家在 MB Bank / Vietcombank 已到账货款现金。</p>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <span class="text-[10px] text-slate-400 font-bold tracking-wider block uppercase">已结单累计纯利润 / 在途应收</span>
                        <div class="flex items-baseline gap-2 mt-2">
                            <h2 class="text-3xl font-mono font-black text-emerald-600">¥${Math.round(totalProfitCny).toLocaleString()}</h2>
                            <span class="text-[10px] text-slate-400 font-semibold">/ 在途: ${totalPendingVnd.toLocaleString()} ₫</span>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-4 leading-relaxed">根据首页自定义换算报价器的最新参考汇率（1:${window.ERP_STORE.system_rate}）实时对账折算。</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-4 bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <i class="fa-solid fa-scale-balanced text-indigo-500"></i> 单单利润即时对账盘（支持一键追增货代运费，自动解算跨国纯利润）
                </div>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/20 border-b border-slate-100">
                                <th class="p-4">订单号</th>
                                <th class="p-4">客户名</th>
                                <th class="p-4 text-right">内部采购本金 (CNY)</th>
                                <th class="p-4 text-right">收取买家货款 (VND)</th>
                                <th class="p-4 text-center">第三方运费 (CNY)</th>
                                <th class="p-4 text-right">单单净利润 (CNY)</th>
                                <th class="p-4 text-center rounded-r-xl">账目对账状态</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${rowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ⚡ 核心提效快捷功能：在财务列表上直接点选，输入或修改发给货代的人民币国际运费
window.quickUpdateShippingFee = function(orderIndex) {
    const ord = window.ERP_STORE.orders[orderIndex];
    const currentFee = ord.shipping_fee_cny || 0;
    const newFee = prompt(`请输入或修改订单 ${ord.id} 支付给第三方货代的人民币运费(¥)：`, currentFee);
    
    if (newFee !== null) {
        const parsedFee = parseFloat(newFee) || 0;
        ord.shipping_fee_cny = parsedFee;
        
        // 瞬间重绘财务账目视图，利润会自动根据运费扣减并刷新
        const mv = document.getElementById("main-view");
        mv.innerHTML = `<div class="view-section">${renderFinance()}</div>`;
    }
};
