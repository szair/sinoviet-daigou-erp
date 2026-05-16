function renderFinance() {
    return `
        <div class="space-y-6">
            <!-- 跨境多币种资金头寸水位线 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md">
                    <span class="text-[10px] text-slate-400 font-bold tracking-wider block uppercase">中国境内垫付资金池 (CNY)</span>
                    <h2 class="text-3xl font-mono font-black mt-2">¥48,650.00</h2>
                    <p class="text-[10px] text-slate-500 mt-4 leading-relaxed">用于向淘宝、天猫、1688 源头卖家秒速垫付款项。</p>
                </div>
                <div class="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md">
                    <span class="text-[10px] text-indigo-300 font-bold tracking-wider block uppercase">越南银行本土到账现金 (VND)</span>
                    <h2 class="text-3xl font-mono font-black mt-2">165,400,000 ₫</h2>
                    <p class="text-[10px] text-indigo-400 mt-4 leading-relaxed">对应买家在 MB Bank / Vietcombank 本币货款到账总额。</p>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <span class="text-[10px] text-slate-400 font-bold tracking-wider block uppercase">预估本月跨国代购纯利润</span>
                        <h2 class="text-3xl font-mono font-black text-emerald-500 mt-2">¥12,480.00</h2>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-2 leading-relaxed">已自动扣除友谊关报关清关费及越南最后一公里本土派送费。</p>
                </div>
            </div>
        </div>
    `;
}
