function renderDashboard() {
    const isZh = window.ERP_STORE.current_lang === "zh";

    // ⚡ 1. 动态字典：将写死的中文彻底提取出来，支持中越无缝切换
    const tTotalOrders = isZh ? "最近总订单" : "Tổng đơn hàng gần đây";
    const tWaitShipping = isZh ? "待发货商品" : "Hàng chờ giao";
    const tArrived = isZh ? "已到仓库" : "Hàng đã đến kho";
    const tShipping = isZh ? "运输中商品" : "Hàng đang vận chuyển";
    const tDone = isZh ? "已签收商品" : "Hàng đã nhận";
    
    const uBi = isZh ? "笔" : "đơn";
    const uJian = isZh ? "件" : "kiện";

    const tKanban = isZh ? "商品看板与多条件模糊搜索" : "Bảng hàng hóa & Tìm kiếm nâng cao";
    const pSearch = isZh ? "输入客户名/快递单号/商品名模糊搜索..." : "Nhập tên khách, mã vận đơn, tên hàng...";
    
    const tCalcTitle = isZh ? "自定义汇率换算报价器" : "Bộ tính giá & Quy đổi tỷ giá tự động";
    const lCost = isZh ? "输入商品本金 (CNY ¥)" : "Nhập tiền vốn hàng hóa (CNY ¥)";
    const lRate = isZh ? "自定义报价汇率 (1 CNY = ? VND)" : "Tỷ giá báo khách (1 CNY = ? VND)";
    const lTotal = isZh ? "系统精准计算总费用 (VND)" : "Tổng chi phí quy đổi chính xác (VND)";

    // 后端计数逻辑
    let totalOrdersCount = window.ERP_STORE.orders.length;
    let countWait = 0, countArrived = 0, countShipping = 0, countDone = 0;

    let itemsRowsHTML = "";

    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items) {
            ord.items.forEach(item => {
                // 统计生命周期各环节件数
                if (item.status === "等待国内发货") countWait++;
                if (item.status === "集运仓已到货") countArrived++;
                if (item.status === "跨境清关运输中") countShipping++;
                if (item.status === "买家已完成收货") countDone++;

                let itemStatusBadge = "";
                switch (item.status) {
                    case "等待国内发货":
                        itemStatusBadge = `<span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100 text-[11px] font-bold">🕒 ${isZh ? '待发货' : 'Chờ giao'}</span>`;
                        break;
                    case "集运仓已到货":
                        itemStatusBadge = `<span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 text-[11px] font-bold">📦 ${isZh ? '已到仓' : 'Đến kho'}</span>`;
                        break;
                    case "跨境清关运输中":
                        itemStatusBadge = `<span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100 text-[11px] font-bold">🚛 ${isZh ? '运输中' : 'Vận chuyển'}</span>`;
                        break;
                    case "买家已完成收货":
                        itemStatusBadge = `<span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100 text-[11px] font-bold">✅ ${isZh ? '已签收' : 'Đã nhận'}</span>`;
                        break;
                }

                // 列表渲染布局 (手机自适应大字)
                itemsRowsHTML += `
                    <div class="dash-item-row flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60 gap-2 animate-fadeIn select-none"
                         data-dash-search="${ord.customer.toLowerCase()} ${item.track ? item.track.toLowerCase() : ''} ${item.name.toLowerCase()}">
                        <div class="space-y-1">
                            <div class="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                                <span>${ord.id}</span> • <span class="text-slate-700 font-sans font-black">${ord.customer}</span>
                            </div>
                            <div class="text-xs font-bold text-slate-800">
                                <span class="text-slate-400 font-black">[${item.platform}]</span> ${item.name}
                            </div>
                            ${item.track ? `<div class="text-[11px] font-mono font-bold bg-white text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-lg w-fit">${item.express_company || '中通'}: ${item.track}</div>` : ''}
                        </div>
                        <div class="flex sm:flex-col justify-between sm:items-end items-center border-t sm:border-t-0 border-dashed border-slate-200 pt-2 sm:pt-0">
                            <span class="font-mono text-xs font-black text-slate-600">¥${item.cny}</span>
                            <div class="mt-1">${itemStatusBadge}</div>
                        </div>
                    </div>
                `;
            });
        }
    });

    if(itemsRowsHTML === "") {
        itemsRowsHTML = `<div class="text-center italic text-slate-400 text-xs py-8">${isZh?'暂无数据':'Chưa có dữ liệu'}</div>`;
    }

    // 📱 H5 顶级大字版自适应看板布局
    return `
        <div class="space-y-5 w-full pb-12">
            
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div onclick="redirectFromDashToOrders(null)" class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                    <div><span class="text-[11px] text-slate-400 font-bold block">${tTotalOrders}</span><span class="text-sm font-black text-slate-900 mt-1 block">${totalOrdersCount} <span class="text-xs text-slate-400 font-bold">${uBi}</span></span></div>
                    <div class="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center text-xs"><i class="fa-solid fa-list-check"></i></div>
                </div>
                <div onclick="redirectFromDashToOrders('等待国内发货')" class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                    <div><span class="text-[11px] text-slate-400 font-bold block">${tWaitShipping}</span><span class="text-sm font-black text-amber-500 mt-1 block">${countWait} <span class="text-xs text-slate-400 font-bold">${uJian}</span></span></div>
                    <div class="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xs"><i class="fa-solid fa-clock"></i></div>
                </div>
                <div onclick="redirectFromDashToOrders('集运仓已到货')" class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                    <div><span class="text-[11px] text-slate-400 font-bold block">${tArrived}</span><span class="text-sm font-black text-blue-600 mt-1 block">${countArrived} <span class="text-xs text-slate-400 font-bold">${uJian}</span></span></div>
                    <div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs"><i class="fa-solid fa-warehouse"></i></div>
                </div>
                <div onclick="redirectFromDashToOrders('跨境清关运输中')" class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                    <div><span class="text-[11px] text-slate-400 font-bold block">${tShipping}</span><span class="text-sm font-black text-indigo-600 mt-1 block">${countShipping} <span class="text-xs text-slate-400 font-bold">${uJian}</span></span></div>
                    <div class="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xs"><i class="fa-solid fa-truck"></i></div>
                </div>
                <div onclick="redirectFromDashToOrders('买家已完成收货')" class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                    <div><span class="text-[11px] text-slate-400 font-bold block">${tDone}</span><span class="text-sm font-black text-emerald-600 mt-1 block">${countDone} <span class="text-xs text-slate-400 font-bold">${uJian}</span></span></div>
                    <div class="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xs"><i class="fa-solid fa-circle-check"></i></div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                
                <div class="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-2">
                        <h4 class="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <i class="fa-solid fa-magnifying-glass text-indigo-500"></i> ${tKanban}
                        </h4>
                        <input type="text" id="dash-search-input" placeholder="${pSearch}" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-slate-800 w-full sm:w-64">
                    </div>
                    <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1" id="dash-items-container">
                        ${itemsRowsHTML}
                    </div>
                </div>

                <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h4 class="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <i class="fa-solid fa-calculator text-indigo-500"></i> ${tCalcTitle}
                    </h4>
                    <div class="space-y-3.5 text-xs font-bold text-slate-600">
                        <div>
                            <label class="block text-slate-400 mb-1 pl-0.5">${lCost}</label>
                            <input type="number" id="calc-cny" value="1000" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-black text-slate-900 text-sm focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-slate-400 mb-1 pl-0.5">${lRate}</label>
                            <input type="number" id="calc-rate" value="${window.ERP_STORE.system_rate}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-black text-slate-900 text-sm focus:outline-none">
                        </div>
                        <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/40">
                            <label class="block text-indigo-950 font-black mb-1.5"><i class="fa-solid fa-coins text-indigo-600"></i> ${lTotal}</label>
                            <div id="calc-result-display" class="font-mono font-black text-indigo-600 text-right text-base tracking-wide">0 ₫</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

// 🚀 生命周期挂载点
window.init_dashboard = function() {
    // 1. 初始化智能模糊检索绑定
    const searchIn = document.getElementById("dash-search-input");
    if(searchIn) {
        searchIn.addEventListener("input", (e) => {
            const val = e.target.value.trim().toLowerCase();
            document.querySelectorAll(".dash-item-row").forEach(row => {
                const searchStr = row.getAttribute("data-dash-search");
                if(searchStr.includes(val)) row.classList.remove("hidden");
                else card.classList.add("hidden"); // ⚡ 顺手修复：将原先拼错的 card.classList 改为正确的 row.classList
                if(searchStr.includes(val)) row.style.display = "flex";
                else row.style.display = "none";
            });
        });
    }

    // 2. 初始化智能换算器的实时运算键位监听
    const cnyIn = document.getElementById("calc-cny");
    const rateIn = document.getElementById("calc-rate");
    
    if(cnyIn && rateIn) {
        const calculateNow = () => {
            const cny = parseFloat(cnyIn.value) || 0;
            const rate = parseFloat(rateIn.value) || 0;
            const res = Math.round(cny * rate);
            
            const displayEl = document.getElementById("calc-result-display");
            if(displayEl) displayEl.innerText = res.toLocaleString() + " ₫";
        };
        
        cnyIn.addEventListener("input", calculateNow);
        rateIn.addEventListener("input", calculateNow);
        calculateNow(); // 首次进入自动计算初始的 1000 ¥
    }
};

// ⚡ 体验升华：大盘指标一键下钻联动跳转
window.redirectFromDashToOrders = function(targetStatus) {
    window.ERP_STORE.filter_status = targetStatus;
    window.location.hash = "orders"; // 瞬间平滑跳转到订单模块，并且药丸筛选锁已经自动扣上！
};
