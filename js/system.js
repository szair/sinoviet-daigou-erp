function renderSystem() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    // 🌍 H5 国际化文案自适应联动
    const titleText = isZh ? "核心系统业务配置" : "Cấu hình cốt lõi hệ thống";
    const labelRate = isZh ? "全局参考对账汇率 (1 人民币兑越南盾)" : "Tỷ giá đối soát chuẩn (1 CNY sang VND)";
    const labelFee = isZh ? "预设代购手续费率 (%)" : "Phần trăm phí mua hộ mặc định (%)";
    const labelLang = isZh ? "切换全系统运行语言 (Language)" : "Thay đổi ngôn ngữ hệ thống";
    const btnText = isZh ? "保存配置并应用" : "Lưu cấu hình và áp dụng";

    // 📱 H5 纯正卡片式布局，字大且操作完全垂直化，防止手指误触
    return `
        <div class="space-y-4 w-full max-w-md mx-auto animate-fadeIn pb-12">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                <h4 class="text-sm font-black text-slate-950 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <i class="fa-solid fa-sliders text-indigo-500 text-xs"></i> ${titleText}
                </h4>
                
                <div class="space-y-4 text-xs font-bold text-slate-600">
                    <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                        <label class="block text-indigo-950 font-black mb-2.5">
                            <i class="fa-solid fa-globe text-indigo-600"></i> ${labelLang}
                        </label>
                        <div class="flex flex-col gap-2.5 font-black text-slate-800 text-sm">
                            <label class="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 cursor-pointer active:scale-[0.99] transition-all">
                                <input type="radio" name="sys-lang" value="zh" ${isZh ? 'checked' : ''} class="w-4 h-4 text-indigo-600 focus:ring-0"> 
                                <span>🇨🇳 简体中文 (Chinese)</span>
                            </label>
                            <label class="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 cursor-pointer active:scale-[0.99] transition-all">
                                <input type="radio" name="sys-lang" value="vi" ${!isZh ? 'checked' : ''} class="w-4 h-4 text-indigo-600 focus:ring-0"> 
                                <span>🇻🇳 Tiếng Việt (Vietnamese)</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-slate-400 font-bold mb-1 pl-1">${labelRate}</label>
                        <input type="number" id="sys-rate-input" value="${window.ERP_STORE.system_rate}" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-mono font-black text-slate-900 text-sm focus:outline-none">
                    </div>

                    <div>
                        <label class="block text-slate-400 font-bold mb-1 pl-1">${labelFee}</label>
                        <input type="number" id="sys-fee-input" value="${window.ERP_STORE.currency_fee}" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-mono font-black text-slate-900 text-sm focus:outline-none">
                    </div>
                    
                    <div class="pt-2">
                        <button id="btn-save-sys" class="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-circle-check"></i> ${btnText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.init_system = function() {
    const btn = document.getElementById("btn-save-sys");
    if(!btn) return;
    
    btn.addEventListener("click", () => {
        const nr = parseFloat(document.getElementById("sys-rate-input").value) || 3450;
        const nf = parseFloat(document.getElementById("sys-fee-input").value) || 5;
        
        // 抓取当前单选框里被选中的语言值 (zh 或 vi)
        const selectedLang = document.querySelector('input[name="sys-lang"]:checked').value;
        
        // 覆盖锁死全局控制台状态
        window.ERP_STORE.system_rate = nr;
        window.ERP_STORE.currency_fee = nf;
        window.ERP_STORE.current_lang = selectedLang;
        
        // ⚡ H5 核心黑科技：全网一键无刷新热重绘骨架结构
        window.renderGlobalSkeleton();
        
        // 弹出优雅提示
        const alertMsg = selectedLang === "zh" 
            ? "🎉 系统配置已成功生效！语言及对账费率已实时热同步。" 
            : "🎉 Cấu hình hệ thống đã được áp dụng thành công! Ngôn ngữ và tỷ giá đã đồng bộ hóa theo thời gian thực.";
        alert(alertMsg);
    });
};
