function renderDashboard() {
    // 1. 动态统计全局变量 ERP_STORE 中的所有独立商品状态
    let countWait = 0;   // 待发货
    let countArrived = 0; // 已到仓库
    let countTransit = 0; // 运输中
    let countDone = 0;    // 已签收
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

    // 2. 动态提取所有商品，生成带索引的原始 HTML 结构（用于后续模糊搜索过滤）
    let recentItemsHTML = "";
    let itemIndexGlobal = 0;

    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items) {
            ord.items.forEach(item => {
                let badge = "";
                if (item.status === "等待国内发货") badge = `<span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100">🕒 待发货</span>`;
                if (item.status === "集运仓已到货") badge = `<span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">📦 已到仓</span>`;
                if (item.status === "跨境清关运输中") badge = `<span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100">🚛 运输中</span>`;
                if (item.status === "买家已完成收货") badge = `<span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">✅ 已签收</span>`;

                const trackText = item.track || "暂无单号";

                // 为每个商品条目打上 data 标签，把客户名、商品名、快递号塞进去，方便模糊搜索进行匹配
                recentItemsHTML += `
                    <div class="dash-searchable-item flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs transition-all duration-200"
                         data-search-customer="${ord.customer.toLowerCase()}"
                         data-search-itemname="${item.name.toLowerCase()}"
                         data-search-track="${trackText.toLowerCase()}"
                         data-search-id="${ord.id.toLowerCase()}">
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="font-mono font-bold text-slate-400">${ord.id}</span>
                            <span class="text-slate-700 font-bold flex-shrink-0">${ord.customer}</span>
                            <span class="text-slate-500 truncate font-medium">[${item.platform}] ${item.name}</span>
                            ${item.track ? `<span class="font-mono text-[10px] bg-slate-200/60 px-1 rounded text-slate-600 truncate max-w-[100px]">${item.track}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                            <span class="font-mono font-semibold text-slate-400">¥${item.cny}</span>
                            ${badge}
                        </div>
                    </div>
                `;
                itemIndexGlobal++;
            });
        }
    });

    if (recentItemsHTML === "") {
        recentItemsHTML = `<div class="text-slate-400 italic text-center py-4">暂无动态</div>`;
    }

    return `
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">最近总订单</span>
                    <h3 class="text-xl font-black text-slate-800 mt-1">${totalOrdersCount} 笔</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-sm"><i class="fa-solid fa-list-check"></i></div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">🕒 待发货商品</span>
                    <h3 class="text-xl font-black text-amber-500 mt-1">${countWait} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-sm"><i class="fa-solid fa-clock"></i></div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">📦 已到仓库</span>
                    <h3 class="text-xl font-black text-blue-500 mt-1">${countArrived} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-sm"><i class="fa-solid fa-warehouse"></i></div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">🚛 运输中商品</span>
                    <h3 class="text-xl font-black text-indigo-500 mt-1">${countTransit} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-sm"><i class="fa-solid fa-truck-fast"></i></div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">✅ 已签收商品</span>
                    <h3 class="text-xl font-black text-emerald-500 mt-1">${countDone} 件</h3>
                </div>
                <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm"><i class="fa-solid fa-circle-check"></i></div>
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
                        <div id="dash-search-empty-tip" class="hidden text-slate-400 italic text-center py-6 text-xs">
                            ❌ 没有找到匹配该关键词的商品记录
                        </div>
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
    // 1. 初始化右侧报价计算器
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

    // 2. ⚡ 初始化左侧高频多条件模糊搜索功能（核心提效机制）
    const searchInput = document.getElementById("dash-fuzzy-search-input");
    if(searchInput) {
        searchInput.addEventListener("input", (e) => {
            const keyword = e.target.value.trim().toLowerCase();
            const items = document.querySelectorAll(".dash-searchable-item");
            const emptyTip = document.getElementById("dash-search-empty-tip");
            let visibleCount = 0;

            items.forEach(el => {
                // 读取该行商品打上的隐藏搜索特征值
                const cust = el.getAttribute("data-search-customer");
                const name = el.getAttribute("data-search-itemname");
                const track = el.getAttribute("data-search-track");
                const id = el.getAttribute("data-search-id");

                // 模糊逻辑：只要客户名字、快递单号、商品名字、订单号里任意一个包含输入的关键词，就保留
                if (cust.includes(keyword) || name.includes(keyword) || track.includes(keyword) || id.includes(keyword)) {
                    el.classList.remove("hidden");
                    visibleCount++;
                } else {
                    el.classList.add("hidden");
                }
            });

            // 如果全部被过滤了，显示无结果提示
            if(visibleCount === 0) {
                if(emptyTip) emptyTip.classList.remove("hidden");
            } else {
                if(emptyTip) emptyTip.classList.add("hidden");
            }
        });
    }
}
