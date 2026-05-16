function renderCustomers() {
    let rowsHTML = "";

    // 遍历全局绑定的客户数组
    window.ERP_STORE.customers.forEach((cust, index) => {
        rowsHTML += `
            <tr class="cust-row hover:bg-slate-50/40 transition text-xs font-semibold text-slate-600 border-b border-slate-100"
                data-search-name="${cust.name.toLowerCase()}"
                data-search-phone="${cust.phone}"
                data-search-id="${cust.id.toLowerCase()}">
                <td class="p-4 font-mono font-bold text-slate-400">${cust.id}</td>
                <td class="p-4 text-slate-900 font-bold">${cust.name}</td>
                <td class="p-4 font-mono text-slate-500">${cust.social}</td>
                <td class="p-4 font-mono text-slate-700">${cust.phone}</td>
                <td class="p-4 max-w-sm truncate text-slate-500" title="${cust.address}">${cust.address}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="copyCustomerShippingText(${index})" class="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-2.5 py-1.5 rounded-xl border border-indigo-100 transition font-bold text-[11px] flex items-center gap-1" title="一键复制为越南打单格式">
                            <i class="fa-regular fa-copy"></i> 复制打单信息
                        </button>
                        <button onclick="deleteCustomerProfile(${index})" class="text-rose-400 hover:text-rose-600 p-1.5 text-sm transition" title="删除客户档案">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (rowsHTML === "") {
        rowsHTML = `<tr><td colspan="6" class="text-slate-400 italic text-center py-8">暂无客户档案，请点击左上角新建。</td></tr>`;
    }

    return `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
                <div class="flex gap-2 flex-shrink-0">
                    <button id="btn-trigger-add-cust" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
                        <i class="fa-solid fa-user-plus"></i> 创建新客户档案
                    </button>
                </div>
                
                <div class="relative w-full sm:w-72">
                    <span class="absolute left-3 top-2.5 text-slate-400 text-[11px]"><i class="fa-solid fa-search"></i></span>
                    <input type="text" id="cust-search-input" placeholder="输入客户ID/姓名/电话搜索..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold">
                </div>
            </div>

            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                            <th class="p-4 w-28">客户 ID</th>
                            <th class="p-4 w-48">买家姓名 (昵称)</th>
                            <th class="p-4 w-40">联络社交账号</th>
                            <th class="p-4 w-36">越南电话</th>
                            <th class="p-4">越南本土收货地址 (Address in Vietnam)</th>
                            <th class="p-4 text-center w-44 rounded-r-xl">快捷操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="cust-table-body">
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ⚡ 核心修复点：将 init_customers 明确挂载到 window 对象上，供 app.js 跨文件顺利调用
window.init_customers = function() {
    // 1. 绑定创建新客户按钮点击事件
    const btn = document.getElementById("btn-trigger-add-cust");
    if(btn) {
        btn.removeEventListener("click", openAddCustomerModal);
        btn.addEventListener("click", openAddCustomerModal);
    }

    // 2. 绑定即时搜索监听
    const searchIn = document.getElementById("cust-search-input");
    if(searchIn) {
        searchIn.addEventListener("input", (e) => {
            const val = e.target.value.trim().toLowerCase();
            const rows = document.querySelectorAll(".cust-row");
            
            rows.forEach(row => {
                const name = row.getAttribute("data-search-name");
                const phone = row.getAttribute("data-search-phone");
                const id = row.getAttribute("data-search-id");

                if(name.includes(val) || phone.includes(val) || id.includes(val)) {
                    row.classList.remove("hidden");
                } else {
                    row.classList.add("hidden");
                }
            });
        });
    }
};

// 弹出新建客户模态框
function openAddCustomerModal() {
    const modalHTML = `
        <div id="cust-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800"><i class="fa-solid fa-address-card text-indigo-500"></i> 录入全新买家档案</h3>
                    <button onclick="closeCustModal()" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                </div>
                
                <form id="add-cust-form" class="p-6 space-y-4 text-xs">
                    <div>
                        <label class="block text-slate-500 font-bold mb-1">买家姓名/微信昵称 (必填)</label>
                        <input type="text" id="mo-cust-name" placeholder="例如：Tran Thi Mai (梅姐姐)" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-500 font-bold mb-1">社交号备注 (选填)</label>
                            <input type="text" id="mo-cust-social" placeholder="Zalo号或微信号" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-slate-500 font-bold mb-1">越南本土电话 (必填)</label>
                            <input type="text" id="mo-cust-phone" placeholder="例如：0912345678" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono focus:outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-slate-500 font-bold mb-1">越南本土完整收货地址 (配送地址)</label>
                        <textarea id="mo-cust-address" rows="3" placeholder="请填入详细的越南街道、郡、城市名称..." required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none font-medium"></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeCustModal()" class="w-1/4 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">取消</button>
                        <button type="submit" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-sm transition">生成唯一ID并入库</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 监听表单提交
    document.getElementById("add-cust-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("mo-cust-name").value.trim();
        const social = document.getElementById("mo-cust-social").value.trim() || "未登记";
        const phone = document.getElementById("mo-cust-phone").value.trim();
        const address = document.getElementById("mo-cust-address").value.trim();

        const nextIdNumber = 1001 + window.ERP_STORE.customers.length;
        const newId = `CUST-${nextIdNumber}`;

        window.ERP_STORE.customers.push({ id: newId, name, social, phone, address });

        refreshCustomersView();
        closeCustModal();
    });
}

function closeCustModal() {
    const modal = document.getElementById("cust-modal");
    if (modal) modal.remove();
}

function refreshCustomersView() {
    const mv = document.getElementById("main-view");
    mv.innerHTML = `<div class="view-section">${renderCustomers()}</div>`;
    window.init_customers(); // 升级为全局调用方式
}

// 删除客户档案
window.deleteCustomerProfile = function(index) {
    if(confirm("确定要删除该客户的档案吗？这不会影响已生成的历史订单。")) {
        window.ERP_STORE.customers.splice(index, 1);
        refreshCustomersView();
    }
};

// 一键格式化复制给越南物流打单用
window.copyCustomerShippingText = function(index) {
    const cust = window.ERP_STORE.customers[index];
    const textToCopy = `Người nhận: ${cust.name}\nSĐT: ${cust.phone}\nĐịa chỉ: ${cust.address}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert(`🎉 复制成功！打单文本已就绪：\n\n${textToCopy}`);
    }).catch(err => {
        alert("复制失败，请手动划选复制。");
    });
};
