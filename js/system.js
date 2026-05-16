function renderSystem() {
    return `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md">
            <h4 class="text-xs font-bold text-slate-800 mb-4 flex items-center gap-1.5"><i class="fa-solid fa-sliders text-indigo-500"></i> 系统核心代购及跨国业务配置</h4>
            <div class="space-y-4 text-xs font-semibold text-slate-600">
                <div>
                    <label class="block text-slate-400 font-bold mb-1">全局统一基准对账汇率 (1 人民币对越南盾)</label>
                    <input type="number" id="sys-rate-input" value="${window.ERP_STORE.system_rate}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-black text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-slate-400 font-bold mb-1">系统阶梯代购手续费率 (%)</label>
                    <input type="number" id="sys-fee-input" value="${window.ERP_STORE.currency_fee}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-black text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                </div>
                <button id="btn-save-sys" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition">保存全局配置</button>
            </div>
        </div>
    `;
}

function init_system() {
    const btn = document.getElementById("btn-save-sys");
    if(!btn) return;
    btn.addEventListener("click", () => {
        const nr = parseFloat(document.getElementById("sys-rate-input").value) || 3450;
        const nf = parseFloat(document.getElementById("sys-fee-input").value) || 5;
        
        // 动态改写全局的状态存储引擎
        window.ERP_STORE.currency_fee = nf;
        window.updateSidebarRate(nr);
        
        alert("🎉 系统配置已成功生效！全局换算汇率与代购费率已实时热同步。");
    });
}
