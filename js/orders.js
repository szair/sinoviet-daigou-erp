/* ===========================================================
   代购 ERP 核心逻辑脚本 - 多端同步原子化修复版
   ===========================================================
*/

// 1. 全局初始化数据拉取
window.fetchLatestOrdersAndRender = async function() {
    try {
        console.log("正在从 D1 数据库拉取最新数据...");
        const res = await fetch(`${window.API_BASE_URL}/api/orders`);
        if (!res.ok) throw new Error("获取数据失败");
        
        const data = await res.json();
        // 核心修复：确保本地缓存始终同步云端，避免手机端空列表覆盖
        window.ERP_STORE.orders = data || []; 
        
        // 渲染主视图
        const mainView = document.getElementById("main-view");
        if (mainView) {
            mainView.innerHTML = `<div class="view-section">${window.renderOrders()}</div>`;
        }
    } catch (e) {
        console.error("同步失败:", e);
        showErpToast("同步失败，请检查网络连接");
    }
};

// 2. 订单列表渲染逻辑 (包含状态过滤)
window.renderOrders = function() {
    const orders = window.ERP_STORE.orders || [];
    const filter = window.ERP_STORE.filter_status || null;
    
    // 过滤逻辑
    let filtered = orders.filter(ord => {
        if (filter === "已取消") return ord.status === "已取消";
        if (ord.status === "已取消") return false;
        return filter ? ord.status === filter : true;
    });

    let html = `
        <div class="p-4 space-y-4">
            <button onclick="window.fetchLatestOrdersAndRender()" class="w-full py-2 text-xs text-indigo-500 underline italic">刷新同步云端数据</button>
            <button onclick="window.openOrderFormModal(null)" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg">＋ 新建合并代购订单</button>
    `;

    if (filtered.length === 0) {
        html += `<div class="bg-white p-10 rounded-2xl text-center text-slate-300 italic">该分组下暂无代购订单</div>`;
    } else {
        filtered.forEach((ord, idx) => {
            // 这里放你之前美化过的订单卡片 HTML 模板
            html += `
                <div class="bg-white rounded-2xl p-5 shadow-sm border">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-black text-slate-800">${ord.customer}</div>
                            <div class="text-[10px] text-slate-400 font-mono">${ord.id}</div>
                        </div>
                        <button onclick="window.openOrderDetailModalForManage(${idx})" class="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold">管理此单</button>
                    </div>
                    <div class="mt-3 space-y-2">
                        ${ord.items.map(i => `<div class="text-xs text-slate-500">· ${i.name} <span class="float-right text-slate-400">¥${i.cny}</span></div>`).join('')}
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    return html;
};

// 3. 原子化保存逻辑：关键！只提交当前这一张单子
window.submitOrderFormActualAction = async function(editIndex) {
    const isEdit = editIndex !== null;
    
    // 收集表单数据... (这里省略具体的 DOM 获取代码，参考之前的逻辑)
    const orderPayload = {
        id: isEdit ? window.ERP_STORE.orders[editIndex].id : "#ORD-" + Date.now().toString().slice(-5),
        customer: document.getElementById("mo-customer-select").value,
        items: [], // 从 DOM 获取商品列表
        status: "等待国内发货"
    };

    try {
        // 使用单条保存接口，防止覆盖
        const res = await fetch(`${window.API_BASE_URL}/api/orders/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });

        if (res.ok) {
            await window.fetchLatestOrdersAndRender(); // 保存完立即拉取最新全量
            if(document.getElementById("order-form-modal")) document.getElementById("order-form-modal").remove();
            showErpToast("✅ 订单已成功同步入库！");
        }
    } catch (e) {
        showErpToast("❌ 保存失败");
    }
};

// 4. 其他管理逻辑（删除、取消等）
window.deleteOrderActual = async function(id) {
    if(!confirm("确定要彻底粉碎此单吗？此操作不可逆！")) return;
    // ... 发送删除请求到后端
};
