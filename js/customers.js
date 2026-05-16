function renderCustomers() {
    return `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div class="flex justify-between items-center mb-6">
                <input type="text" placeholder="搜索越南买家 Zalo 账号 / 微信昵称..." class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs w-72 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <button class="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"><i class="fa-solid fa-user-plus"></i> 新增越南买家</button>
            </div>
            
            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse text-xs font-semibold text-slate-600">
                    <thead>
                        <tr class="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold bg-slate-50/50">
                            <th class="p-4 rounded-l-xl">买家姓名 / 备注标识</th>
                            <th class="p-4">Zalo/社交账号</th>
                            <th class="p-4">常用派送地址 (越南境内)</th>
                            <th class="p-4 text-right">历史成交单数</th>
                            <th class="p-4 text-right rounded-r-xl">财务欠款余额 (CNY)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="p-4 font-bold text-slate-900">Tran Thi Mai (梅姐姐)</td>
                            <td class="p-4 font-mono text-indigo-600">zalo: +84 912***345</td>
                            <td class="p-4 text-slate-400">Quận 1, Thành phố Hồ Chí Minh (胡志明市1郡)</td>
                            <td class="p-4 text-right font-mono">142 单</td>
                            <td class="p-4 text-right font-mono text-rose-500">¥1,200.00</td>
                        </tr>
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="p-4 font-bold text-slate-900">Linh Long (阿龙)</td>
                            <td class="p-4 font-mono text-indigo-600">zalo: +84 987***112</td>
                            <td class="p-4 text-slate-400">Quận Cầu Giấy, Hà Nội (河内纸桥郡)</td>
                            <td class="p-4 text-right font-mono">89 单</td>
                            <td class="p-4 text-right font-mono text-emerald-500">¥0.00 (无欠款)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
