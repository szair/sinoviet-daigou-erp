function renderWarehouse() {
    return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 入库扫描登记区 -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 class="text-xs font-bold text-slate-800 mb-4 flex items-center gap-1.5"><i class="fa-solid fa-barcode text-indigo-500"></i> 中国国内快递仓入库扫描</h4>
                <form id="wh-scan-form" class="space-y-4 text-xs">
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">中国国内物流单号 (顺丰/中通/韵达)</label>
                        <input type="text" id="wh-track-in" required placeholder="请扫描条形码或输入单号" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">包裹重量 (KG)</label>
                        <input type="number" id="wh-weight" value="2.5" step="0.1" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition shadow-sm">签收入库并匹配客户</button>
                </form>
            </div>

            <!-- 出口装车批次大盘 -->
            <div class="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 class="text-xs font-bold text-slate-800 mb-4 flex justify-between items-center">
                    <span>中越口岸待发干线批次一览</span>
                    <span class="text-[10px] font-normal text-slate-400">中国凭祥中转仓总控</span>
                </h4>
                <div class="space-y-3" id="wh-batch-container">
                    <div class="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                            <div class="font-black text-slate-800 tracking-wide">批次号: PX-20260516-HANOI</div>
                            <div class="text-slate-400 font-semibold mt-1">发往分拨：越南河内总仓 | 累计体积: 12.5 CBM | 总重: 450 KG</div>
                        </div>
                        <button onclick="alert('装车发货成功！状态已变更为【口岸清关中】')" class="bg-slate-900 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm hover:bg-slate-800 transition">封箱发货出境</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function init_warehouse() {
    const form = document.getElementById("wh-scan-form");
    if(!form) return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const track = document.getElementById("wh-track-in").value;
        alert(`单号 ${track} 签收入库成功！系统已通过 Webhook 自动向该买家的 Zalo 推送【国内仓已入库】通知。`);
        document.getElementById("wh-track-in").value = "";
    });
}
