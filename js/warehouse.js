function renderWarehouse() {
    // 1. 核心业务逻辑：从全局订单库中，捞出所有状态为“集运仓已到货”的待出境散件商品
    let customerBundles = {};

    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items && ord.items.length > 0) {
            ord.items.forEach(item => {
                // 仅抓取已经存放在国内集运仓、等待合单出境给第三方物流的商品
                if (item.status === "集运仓已到货") {
                    if (!customerBundles[ord.customer]) {
                        customerBundles[ord.customer] = {
                            customerName: ord.customer,
                            orderId: ord.id,
                            goods: []
                        };
                    }
                    customerBundles[ord.customer].goods.push({
                        platform: item.platform,
                        name: item.name,
                        track: item.track || "无单号"
                    });
                }
            });
        }
    });

    // 2. 渲染前端视图卡片
    let bundlesHTML = "";
    const bundleKeys = Object.keys(customerBundles);

    bundleKeys.forEach(custName => {
        const bundle = customerBundles[custName];
        
        // 渲染当前买家积压在仓库里准备合单的所有小包裹明细
        let goodsRowsHTML = "";
        bundle.goods.forEach(g => {
            // 安全脱敏：仅提取国内物流单号的最后4位尾数
            const fullTrack = g.track;
            const lastFourDigits = fullTrack.length > 4 ? fullTrack.slice(-4) : fullTrack;
            const trackDisplay = fullTrack !== "无单号" ? `<span class="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">尾号: *${lastFourDigits}</span>` : `<span class="text-rose-400 italic">缺单号</span>`;

            goodsRowsHTML += `
                <div class="flex justify-between items-center py-2 border-b border-dashed border-slate-100 last:border-0">
                    <div class="flex items-center gap-1.5">
                        <span class="text-slate-400 font-bold">[${g.platform}]</span>
                        <span class="text-slate-700 font-semibold">${g.name}</span>
                    </div>
                    <div>${trackDisplay}</div>
                </div>
            `;
        });

        bundlesHTML += `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                <div>
                    <div class="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                        <div>
                            <h4 class="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                <i class="fa-solid fa-user text-indigo-500"></i> ${bundle.customerName}
                            </h4>
                            <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">待出境合并包裹：${bundle.goods.length} 件</span>
                        </div>
                        <span class="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold">📦 仓储待发</span>
                    </div>
                    
                    <div class="space-y-1 pl-1">
                        ${goodsRowsHTML}
                    </div>
                </div>
                
                <div class="mt-5 pt-3 border-t border-slate-100">
                    <button onclick="generateShippingManifest('${bundle.customerName}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-[11px] font-bold shadow-sm transition flex items-center justify-center gap-1">
                        <i class="fa-solid fa-file-export"></i> 合并生成货代清单文本
                    </button>
                </div>
            </div>
        `;
    });

    // 如果没有任何到仓的商品，给一个精美的空仓引导页
    if (bundleKeys.length === 0) {
        bundlesHTML = `
            <div class="col-span-full bg-white p-12 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                <div class="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-xl mb-3"><i class="fa-solid fa-boxes-stacked"></i></div>
                <h4 class="text-xs font-bold text-slate-700">目前暂无待合并出境的国内到仓包裹</h4>
                <p class="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">当你在【订单管理】页面将某件商品快捷流转或者修改为【集运仓已到货】状态后，该买家的合单集运面板就会自动在这里激活呈现。</p>
            </div>
        `;
    }

    return `
        <div class="space-y-4">
            <div class="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-xs text-indigo-700 font-semibold flex items-center gap-2">
                <i class="fa-solid fa-circle-info text-indigo-500 animate-pulse"></i>
                <span>第三方转运协作台：此页面会自动把已到国内集运仓的包裹按照【同一买家】进行智能合并打包。一键导出的清单文本已进行物流单号尾数四位脱敏安全加密，可直接发送给货代客服安排清关发货。</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="wh-bundles-grid">
                ${bundlesHTML}
            </div>
        </div>
    `;
}

// ⚡ 核心修复点：将入口初始化函数明确挂载到 window 对象上，供 app.js 稳定调用
window.init_warehouse = function() {
    // 预留给后续可能添加的页面交互监听（目前纯展示和弹窗触发，无需复杂监听，保持干净）
};

// ⚡ 核心业务黑科技：一键合并并抽取对应的客户档案地址，格式化生成发给第三方货代的交货文本
window.generateShippingManifest = function(customerName) {
    // 1. 去全局客户库中捞取该买家的完整越南收货信息
    const targetCustProfile = window.ERP_STORE.customers.find(c => c.name === customerName);
    
    const addressText = targetCustProfile 
        ? `Người nhận (收件人): ${targetCustProfile.name}\nSĐT (电话): ${targetCustProfile.phone}\nĐịa chỉ (越南收货地址): ${targetCustProfile.address}`
        : `Người nhận: ${customerName}\n[⚠️ 提示：请先去【客户管理】完善该买家的收货地址和电话，以便货代打单]`;

    // 2. 搜集该客户在集运仓的所有商品及单号后4位尾数
    let goodsTextLines = [];
    let itemCount = 0;

    window.ERP_STORE.orders.forEach(ord => {
        if (ord.items) {
            ord.items.forEach(item => {
                if (item.status === "集运仓已到货" && ord.customer === customerName) {
                    itemCount++;
                    const fullTrack = item.track || "无单号";
                    const lastFour = fullTrack.length > 4 ? fullTrack.slice(-4) : fullTrack;
                    goodsTextLines.push(`   ${itemCount}. [${item.platform}] ${item.name} ➔ 国内快递尾号: *${lastFour}`);
                }
            });
        }
    });

    // 3. 排版拼装高保真货代通知文本格式
    const finalManifestText = `===== 中越通跨境集运·出境托运申报单 =====\n【请货代安排打包转运发往越南】\n\n📌 越南收件人信息：\n${addressText}\n\n📦 本次合单打包商品明细 (共计: ${itemCount} 件)：\n${goodsTextLines.join("\n")}\n\n======================================`;

    // 4. 动态渲染弹窗把文本呈现出来，支持一键复制
    const modalHTML = `
        <div id="manifest-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800"><i class="fa-solid fa-paper-plane text-indigo-500"></i> 已生成发货托运信息</h3>
                    <button onclick="closeManifestModal()" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                </div>
                
                <div class="p-6 space-y-4 text-xs">
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">复制下方文本，直接粘贴给第三方货代微信/Zalo：</label>
                        <textarea id="mo-manifest-text-area" rows="10" readonly class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-700 select-all focus:outline-none">${finalManifestText}</textarea>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" onclick="closeManifestModal()" class="w-1/4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">关闭</button>
                        <button onclick="copyManifestTextToClipboard()" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-1">
                            <i class="fa-regular fa-copy"></i> 一键复制整段清单
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.closeManifestModal = function() {
    const modal = document.getElementById("manifest-modal");
    if (modal) modal.remove();
};

window.copyManifestTextToClipboard = function() {
    const txtArea = document.getElementById("mo-manifest-text-area");
    if(txtArea) {
        navigator.clipboard.writeText(txtArea.value).then(() => {
            alert("🎉 清单文本已成功复制到你的电脑剪贴板！快去发送给第三方物流吧。");
            closeManifestModal();
        }).catch(err => {
            alert("复制失败，请手动划选右键复制。");
        });
    }
};
