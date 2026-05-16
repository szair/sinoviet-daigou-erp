function renderDashboard() {
    return `
        <!-- 顶层核心统计流漏斗看板 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">Total Orders</span>
                    <h3 class="text-2xl font-black text-slate-800 mt-1">543 单</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base"><i class="fa-solid fa-cart-shopping"></i></div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">CN Warehoused</span>
                    <h3 class="text-2xl font-black text-amber-500 mt-1">188 个</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-base"><i class="fa-solid fa-box-archive"></i></div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">Cross-border in Transit</span>
                    <h3 class="text-2xl font-black text-blue-500 mt-1">92 批</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base"><i class="fa-solid fa-truck-ramp-box"></i></div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">Delivered VN</span>
                    <h3 class="text-2xl font-black text-emerald-500 mt-1">263 单</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-base"><i class="fa-solid fa-circle-check"></i></div>
            </div>
        </div>

        <!-- 资金走势与核心跨境智能工具 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <h4 class="text-xs font-bold text-slate-800">中越双币资金流量对账图 (近一周)</h4>
                    <span class="text-[10px] text-slate-400"><i class="fa-solid fa-yen-sign text-indigo-500"></i> 人民币垫付 / <i class="fa-solid fa-dong-sign text-emerald-500"></i> 越南盾回款</span>
                </div>
                <!-- 用原生可缩放 SVG 代替厚重的外部图表库，实现高保真和极速秒开 -->
                <div class="w-full h-48 bg-slate-50/50 rounded-xl p-2 relative">
                    <svg viewBox="0 0 500 150" class="w-full h-full overflow-visible">
                        <!-- 人民币垫资虚线走势 -->
                        <path d="M0,120 Q80,90 160,110 T320,60 T500,30" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="4"/>
                        <!-- 越南盾回款实线走势 -->
                        <path d="M0,140 Q80,110 160,130 T320,75 T500,45" fill="none" stroke="#10b981" stroke-width="3"/>
                    </svg>
                    <div class="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>
                    </div>
                </div>
            </div>
            
            <!-- 跨境小工具卡片 -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                    <h4 class="text-xs font-bold text-slate-800 mb-4 flex items-center gap-1.5"><i class="fa-solid fa-calculator text-indigo-500"></i> 快捷跨境换算报价器</h4>
                    <div class="space-y-3 text-xs">
                        <div>
                            <label class="text-[10px] text-slate-400 font-bold block mb-1">采购本金投入 (CNY ¥)</label>
                            <input type="number" id="dash-cny" value="1000" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-right font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 font-bold block mb-1">对应应收越南盾 (含${window.ERP_STORE.currency_fee}%代购费)</label>
                            <input type="text" id="dash-vnd" readonly class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-right font-mono font-bold text-slate-600">
                        </div>
                    </div>
                </div>
                <div class="pt-4 border-t border-slate-100 mt-4 text-[10px] text-slate-400 leading-relaxed">
                    公式规则：(人民币本金 × (1 + 手续费率)) × 实时系统汇率。数据实时与各子业务台互联共享。
                </div>
            </div>
        </div>
    `;
}

function init_dashboard() {
    const cnyIn = document.getElementById("dash-cny");
    const vndOut = document.getElementById("dash-vnd");
    if(!cnyIn || !vndOut) return;

    const calc = () => {
        const cny = parseFloat(cnyIn.value) || 0;
        const totalVnd = cny * (1 + window.ERP_STORE.currency_fee / 100) * window.ERP_STORE.system_rate;
        vndOut.value = Math.round(totalVnd).toLocaleString() + " ₫";
    };
    cnyIn.addEventListener("input", calc);
    calc(); // 首次进入强制刷新算一次
}
