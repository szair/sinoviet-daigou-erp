function renderWarehouse() {
    let customerBundles = {};
    const isZh = window.ERP_STORE.current_lang === "zh";

    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items) {
            ord.items.forEach(item => {
                if (item.status === "集运仓已到货") {
                    if (!customerBundles[ord.customer]) {
                        customerBundles[ord.customer] = { customerName: ord.customer, goods: [] };
                    }
                    customerBundles[ord.customer].goods.push({ platform: item.platform, name: item.name, track: item.track || "无单号" });
                }
            });
        }
    });

    let bundlesHTML = "";
    const bundleKeys = Object.keys(customerBundles);

    bundleKeys.forEach(custName => {
        const bundle = customerBundles[custName];
        let goodsRowsHTML = "";
        
        bundle.goods.forEach(g => {
            const fullTrack = g.track;
            const lastFour = fullTrack.length > 4 ? fullTrack.slice(-4) : fullTrack;
            const trackDisplay = fullTrack !== "无单号" ? `<span class="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">${isZh?'尾号':'Đuôi'}: *${lastFour}</span>` : `<span class="text-rose-400 italic">缺单号</span>`;

            goodsRowsHTML += `
                <div class="flex justify-between items-center py-2.5 border-b border-dashed border-slate-100 last:border-0 text-xs">
                    <div class="flex items-center gap-1.5 truncate pr-2">
                        <span class="text-slate-400 font-bold flex-shrink-0">[${g.platform}]</span>
                        <span class="text-slate-700 font-semibold truncate">${g.name}</span>
                    </div>
                    <div class="flex-shrink-0">${trackDisplay}</div>
                </div>
            `;
        });

        bundlesHTML += `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition animate-fadeIn">
                <div>
                    <div class="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                        <div>
                            <h4 class="text-sm font-black text-slate-800 flex items-center gap-1.5"><i class="fa-solid fa-user text-indigo-500"></i> ${bundle.customerName}</h4>
                            <span class="text-[11px] text-slate-400 font-mono mt-0.5 block">${isZh?`已到仓待合并散件：${bundle.goods.length} 件` : `Hàng trong kho: ${bundle.goods.length} kiện`}</span>
                        </div>
                        <span class="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-xl text-[10px] font-bold flex-shrink-0">📦 ${isZh?'待发车':'Chờ đi'}</span>
                    </div>
                    <div class="space-y-1">${goodsRowsHTML}</div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100">
                    <button onclick="generateShippingManifest('${bundle.customerName}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-black shadow-sm transition flex items-center justify-center gap-1 active:scale-[0.98]">
                        <i class="fa-solid fa-file-export"></i> ${isZh?'合并生成货代清单文本':'Xuất vận đơn cho kho'}
                    </button>
                </div>
            </div>
        `;
    });

    if (bundleKeys.length === 0) {
        bundlesHTML = `
            <div class="col-span-full bg-white p-10 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                <div class="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-xl mb-2"><i class="fa-solid fa-boxes-stacked"></i></div>
                <h4 class="text-xs font-bold text-slate-700">${isZh?'当前国内集运仓空空如也':'Hiện tại không có hàng lưu kho'}</h4>
                <p class="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">${isZh?'当有商品被标记为【集运仓已到货】后，此合单面板会自动激活。':'Hệ thống tự động gộp hàng khi trạng thái chuyển sang Đến kho.'}</p>
            </div>
        `;
    }

    return `
        <div class="space-y-4 w-full">
            <div class="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-xs text-indigo-700 font-semibold flex items-center gap-2">
                <i class="fa-solid fa-circle-info text-indigo-500 flex-shrink-0 animate-pulse"></i>
                <span>${isZh?'第三方转运台：自动按同一买家归拢合并包裹。导出的文本进行单号后4位脱敏，可直接发送至货代安排清关发货。' : 'Hệ thống tự động gom đơn theo khách hàng. Vận đơn xuất ra được bảo mật 4 số cuối.'}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">${bundlesHTML}</div>
        </div>
    `;
}

window.init_warehouse = function() {};

window.generateShippingManifest = function(customerName) {
    const isZh = window.ERP_STORE.current_lang === "zh";
    const targetCustProfile = window.ERP_STORE.customers.find(c => c.name === customerName);
    
    const addressText = targetCustProfile 
        ? `Người nhận (收件人): ${targetCustProfile.name}\nSĐT (电话): ${targetCustProfile.phone}\nĐịa chỉ (越南收货地址): ${targetCustProfile.address}`
        : `Người nhận: ${customerName}\n[⚠️ 提示：请先完善客户档案地址]`;

    let goodsTextLines = [];
    let itemCount = 0;

    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items) {
            ord.items.forEach(item => {
                if (item.status === "集运仓已到货" && ord.customer === customerName) {
                    itemCount++;
                    const fullTrack = item.track || "无单号";
                    const lastFour = fullTrack.length > 4 ? fullTrack.slice(-4) : fullTrack;
                    goodsTextLines.push(`   ${itemCount}. [${item.platform}] ${item.name} ➔ Mã vận đơn (尾号): *${lastFour}`);
                }
            });
        }
    });

    // 纯正顺滑的货代越南语核心交货文本
    const finalManifestText = `Các vận đơn sau đây xin vui lòng gửi đi Việt Nam:\n\n📌 Thông tin người nhận (越南收件信息)：\n${addressText}\n\n📦 Danh sách kiện hàng (商品明细 共计: ${itemCount} 件)：\n${goodsTextLines.join("\n")}`;

    const modalHTML = `
        <div id="manifest-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-auto animate-fadeIn">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800"><i class="fa-solid fa-paper-plane text-indigo-500"></i> ${isZh?'已合并生成交货文本':'Đã xuất thông tin ký gửi'}</h3>
                    <button type="button" onclick="closeManifestModal()" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>
                <div class="p-4 sm:p-5 space-y-4 text-xs">
                    <textarea id="mo-manifest-text-area" rows="9" readonly class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-700 focus:outline-none select-all">${finalManifestText}</textarea>
                    <div class="flex gap-3">
                        <button type="button" onclick="closeManifestModal()" class="w-1/4 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">${isZh?'关闭':'Đóng'}</button>
                        <button onclick="copyManifestTextToClipboard()" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-black shadow-sm transition flex items-center justify-center gap-1 active:scale-[0.98]">
                            <i class="fa-regular fa-copy"></i> ${isZh?'一键复制整段清单':'Copy toàn bộ văn bản'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("manifest-modal"); // ⚡ 物理返回拦截启动
};

window.closeManifestModal = function() {
    const modal = document.getElementById("manifest-modal");
    if (modal) modal.remove();
};

window.copyManifestTextToClipboard = function() {
    const txtArea = document.getElementById("mo-manifest-text-area");
    if(txtArea) {
        navigator.clipboard.writeText(txtArea.value).then(() => {
            alert(window.ERP_STORE.current_lang === 'zh' ? "🎉 已全自动复制到剪贴板！可以直接贴去微信/Zalo了。" : "🎉 Đã copy vào bộ nhớ tạm! Bạn có thể dán vào Zalo ngay.");
            closeManifestModal();
        });
    }
};
