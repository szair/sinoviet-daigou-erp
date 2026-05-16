function renderDashboard() {
    let countWait = 0;   
    let countArrived = 0; 
    let countTransit = 0; 
    let countDone = 0;    
    let totalOrdersCount = window.ERP_STORE.orders.length;

    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items && ord.items.length > 0) {
            ord.items.forEach(item => {
                if (item.status === "等待国内发货") countWait++;
                if (item.status === "集运仓已到货") countArrived++;
                if (item.status === "跨境清关运输中") countTransit++;
                if (item.status === "买家已完成收货") countDone++;
            });
        }
    });

    let recentItemsHTML = "";
    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items) {
            ord.items.forEach(item => {
                let badge = "";
                if (item.status === "等待国内发货") badge = `<span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100">🕒 待发货</span>`;
                if (item.status === "集运仓已到货") badge = `<span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">📦 已到仓</span>`;
                if (item.status === "跨境清关运输中") badge = `<span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100">🚛 运输中</span>`;
                if (item.status === "买家已完成收货") badge = `<span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">✅ 已签收</span>`;

                // ⚡ 物流单号动态超链接化：点击直接通过快递100查询（空单号不加链接）
                const trackLink = item.track ? `<a href="https://m.kuaidi100.com/result.jsp?nu=${item.track}" target="_blank" class="font-mono text-[10px] bg-slate-200/60 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 px-1 rounded transition max-w-[100px] truncate" title="点击追踪国内真实物流">${item.track}</a>` : '';

                recentItemsHTML += `
                    <div class="dash-searchable-item flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                         data-search-customer="${ord.customer.toLowerCase()}"
                         data-search-itemname="${item.name.toLowerCase()}"
                         data-search-track="${(item.track || '暂无单号').toLowerCase()}"
                         data-search-id="${ord.id.toLowerCase()}">
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="font-mono font-bold text-slate-400">${ord.id}</span>
                            <span class="text-slate-700 font-bold flex-shrink-0">${ord.customer}</span>
                            <span class="text-slate-500 truncate font-medium">[${item.platform}] ${item.name}</span>
                            ${trackLink}
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                            <span class="font-mono font-semibold text-slate-400">¥${item.cny}</span>
                            ${badge}
                        </div>
                    </div>
                `;
            });
        }
    });

    if (recentItemsHTML === "") {
        recentItemsHTML = `<div class="text-slate-400 italic text-center py-4">暂无动态</div>`;
    }

    return `
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div onclick="drillDownOrders('ALL')" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-slate-600 transition">最近总订单</span>
                    <h3 class="text-xl font-black text-slate-800 mt-1">${totalOrdersCount} 笔</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-sm shadow-inner"><i class="fa-solid fa-list-check"></i></div>
            </div>
            <div onclick="drillDownOrders('等待国内发货')" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-amber-600 transition">🕒 待发货商品</span>
                    <h3 class="text-xl font-black text-amber-500 mt-1">${countWait} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-sm shadow-inner"><i class="fa-solid fa-clock"></i></div>
            </div>
            <div onclick="drillDownOrders('集运仓已到货')" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-blue-600 transition">📦 已到仓库</span>
                    <h3 class="text-xl font-black text-blue-500 mt-1">${countArrived} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-sm shadow-inner"><i class="fa-solid fa-warehouse"></i></div>
            </div>
            <div onclick="drillDownOrders('跨境清关运输中')" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-indigo-600 transition">🚛 运输中商品</span>
                    <h3 class="text-xl font-black text-indigo-500 mt-1">${countTransit} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-sm shadow-inner"><i class="fa-solid fa-truck-fast"></i></div>
            </div>
            <div onclick="drillDownOrders('买家已完成收货')" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-emerald-600 transition">✅ 已签收商品</span>
                    <h3 class="text-xl font-black text-emerald-500 mt-1">${countDone} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm shadow-inner"><i class="fa-solid fa-circle-check"></i></div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                        <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5"><i class="fa-solid fa-magnifying-glass text-indigo-500"></i> 商品看板与多条件模糊搜索</h4>
                        <div class="relative w-full sm:w-72">
                            <span class="absolute left-3 top-2.5 text-slate-400 text-[11px]"><i class="fa-solid fa-search"></i></span>
                            <input type="text" id="dash-fuzzy-search-input" placeholder="输入客户名/快递单号/商品名模糊搜索..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold">
                        </div>
                    </div>
                    <div class="space-y-2 max-h-[360px] overflow-y-auto pr-1" id="dash-recent-items-container">
                        ${recentItemsHTML}
                        <div id="dash-search-empty-tip" class="hidden text-slate-400 italic text-center py-6 text-xs">❌ 没有找到匹配该关键词的商品记录</div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 class="text-xs font-bold text-slate-800 mb-4 flex items-center gap-1.5"><i class="fa-solid fa-calculator text-indigo-500"></i> 自定义汇率换算报价器</h4>
                <div class="space-y-3 text-xs font-semibold text-slate-600">
                    <div>
                        <label class="text-[10px] text-slate-400 font-bold block mb-1">输入商品本金 (CNY ¥)</label>
                        <input type="number" id="dash-calc-cny" value="1000" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-right font-mono font-black text-slate-800 focus:outline-none">
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-400 font-bold block mb-1">自定义报价汇率 (1 CNY = ? VND)</label>
                        <div class="relative">
                            <input type="number" id="dash-calc-rate" value="${window.ERP_STORE.system_rate}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-right font-mono font-black text-indigo-600 focus:outline-none">
                            <span class="absolute left-3 top-2.5 text-[10px] text-slate-400">₫ 越南盾</span>
                        </div>
                    </div>
                    <div class="border-t border-slate-100 my-1"></div>
                    <div>
                        <label class="text-[10px] text-indigo-900 font-bold block mb-1">系统精准计算总费用 (VND)</label>
                        <input type="text" id="dash-calc-vnd" readonly class="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2.5 text-right font-mono font-black text-indigo-600 text-sm">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function init_dashboard() {
    const cnyIn = document.getElementById("dash-calc-cny");
    const rateIn = document.getElementById("dash-calc-rate");
    const vndOut = document.getElementById("dash-calc-vnd");
    
    if(cnyIn && rateIn && vndOut) {
        const runCalculation = () => {
            const cny = parseFloat(cnyIn.value) || 0;
            const customRate = parseFloat(rateIn.value) || 0;
            const totalVnd = cny * customRate;
            vndOut.value = Math.round(totalVnd).toLocaleString() + " ₫";
        };
        cnyIn.addEventListener("input", runCalculation);
        rateIn.addEventListener("input", runCalculation);
        runCalculation();
    }

    const searchInput = document.getElementById("dash-fuzzy-search-input");
    if(searchInput) {
        searchInput.addEventListener("input", (e) => {
            const keyword = e.target.value.trim().toLowerCase();
            const items = document.querySelectorAll(".dash-searchable-item");
            const emptyTip = document.getElementById("dash-search-empty-tip");
            let visibleCount = 0;

            items.forEach(el => {
                const cust = el.getAttribute("data-search-customer");
                const name = el.getAttribute("data-search-itemname");
                const track = el.getAttribute("data-search-track");
                const id = el.getAttribute("data-search-id");

                if (cust.includes(keyword) || name.includes(keyword) || track.includes(keyword) || id.includes(keyword)) {
                    el.classList.remove("hidden");
                    visibleCount++;
                } else {
                    el.classList.add("hidden");
                }
            });

            if(visibleCount === 0) { if(emptyTip) emptyTip.classList.remove("hidden"); } 
            else { if(emptyTip) emptyTip.classList.add("hidden"); }
        });
    }
}

// ⚡ 核心逻辑：点击大盘卡片，打上过滤标记，瞬间跳转订单页
window.drillDownOrders = function(statusType) {
    if(statusType === 'ALL') {
        window.ERP_STORE.filter_status = null; // 全选不加锁
    } else {
        window.ERP_STORE.filter_status = statusType; // 存储需要锁定的中转状态
    }
    window.location.hash = "orders"; // 改变 Hash 触发路由平滑切换
};
