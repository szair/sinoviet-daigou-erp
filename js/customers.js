function renderCustomers() {
    let rowsHTML = "";
    const isZh = window.ERP_STORE.current_lang === "zh";

    const tId = isZh ? "客户 ID" : "Mã khách";
    const tName = isZh ? "买家姓名 (昵称)" : "Tên khách hàng";
    const tSocial = isZh ? "联络社交账号" : "Tài khoản MXH";
    const tPhone = isZh ? "越南电话" : "Số ĐT (VN)";
    const tAddress = isZh ? "越南本土收货地址" : "Địa chỉ nhận hàng (VN)";
    const tAction = isZh ? "快捷操作" : "Thao tác";

    window.ERP_STORE.customers.forEach((cust, index) => {
        rowsHTML += `
            <tr class="cust-row hover:bg-slate-50/40 transition text-xs font-semibold text-slate-600 border-b border-slate-100"
                data-search-name="${cust.name.toLowerCase()}"
                data-search-phone="${cust.phone}"
                data-search-id="${cust.id.toLowerCase()}">
                <td class="p-4 font-mono font-bold text-slate-400">${cust.id}</td>
                <td class="p-4 text-slate-900 font-bold">${cust.name}</td>
                <td class="p-4 font-mono text-slate-500">${cust.social}</td>
                <td class="p-4 font-mono text-slate-700">
                    <a href="tel:${cust.phone}" class="hover:underline text-indigo-600">${cust.phone}</a>
                </td>
                <td class="p-4 max-w-xs sm:max-w-sm truncate text-slate-500" title="${cust.address}">${cust.address}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="copyCustomerShippingText(${index})" class="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-2 rounded-xl border border-indigo-100 transition font-bold text-[11px] flex items-center gap-1">
                            <i class="fa-regular fa-copy"></i> ${isZh ? '复制打单信息' : 'Copy địa chỉ'}
                        </button>
                        <button onclick="deleteCustomerProfile(${index})" class="text-rose-400 hover:text-rose-600 p-2 text-base transition">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (rowsHTML === "") {
        rowsHTML = `<tr><td colspan="6" class="text-slate-400 italic text-center py-8">${isZh?'暂无客户档案，请点击创建。':'Chưa có hồ sơ khách hàng.'}</td></tr>`;
    }

    return `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white">
                <button id="btn-trigger-add-cust" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition w-full sm:w-auto justify-center">
                    <i class="fa-solid fa-user-plus"></i> ${isZh?'创建新客户档案':'Thêm khách hàng mới'}
                </button>
                <div class="relative w-full sm:w-72">
                    <span class="absolute left-3 top-3 text-slate-400 text-[11px]"><i class="fa-solid fa-search"></i></span>
                    <input type="text" id="cust-search-input" placeholder="${isZh?'输入客户ID/姓名/电话搜索...':'Tìm tên, mã, số điện thoại...'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none font-semibold">
                </div>
            </div>

            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr class="text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                            <th class="p-4 w-24">${tId}</th>
                            <th class="p-4 w-44">${tName}</th>
                            <th class="p-4 w-36">${tSocial}</th>
                            <th class="p-4 w-32">${tPhone}</th>
                            <th class="p-4">${tAddress}</th>
                            <th class="p-4 text-center w-40 rounded-r-xl">${tAction}</th>
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

window.init_customers = function() {
    const btn = document.getElementById("btn-trigger-add-cust");
    if(btn) {
        btn.removeEventListener("click", openAddCustomerModal);
        btn.addEventListener("click", openAddCustomerModal);
    }

    const searchIn = document.getElementById("cust-search-input");
    if(searchIn) {
        searchIn.addEventListener("input", (e) => {
            const val = e.target.value.trim().toLowerCase();
            document.querySelectorAll(".cust-row").forEach(row => {
                const name = row.getAttribute("data-search-name");
                const phone = row.getAttribute("data-search-phone");
                const id = row.getAttribute("data-search-id");
                if(name.includes(val) || phone.includes(val) || id.includes(val)) row.classList.remove("hidden");
                else row.classList.add("hidden");
            });
        });
    }
};

function openAddCustomerModal() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    const modalHTML = `
        <div id="cust-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-auto animate-fadeIn">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-800"><i class="fa-solid fa-address-card text-indigo-500"></i> ${isZh?'录入全新买家档案':'Tạo hồ sơ khách hàng mới'}</h3>
                    <button type="button" onclick="closeCustModal()" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>
                
                <form id="add-cust-form" class="p-5 space-y-4 text-xs">
                    <div>
                        <label class="block text-slate-500 font-bold mb-1">${isZh?'买家姓名/微信昵称 (必填)':'Tên khách hàng / Nickname (Bắt buộc)'}</label>
                        <input type="text" id="mo-cust-name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold focus:outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-500 font-bold mb-1">${isZh?'社交号备注':'Tài khoản MXH'}</label>
                            <input type="text" id="mo-cust-social" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-slate-500 font-bold mb-1">${isZh?'越南本土电话 (必填)':'Số điện thoại VN (Bắt buộc)'}</label>
                            <input type="text" id="mo-cust-phone" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono focus:outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block text-slate-500 font-bold mb-1">${isZh?'越南本土完整收货地址':'Địa chỉ nhận hàng tại Việt Nam'}</label>
                        <textarea id="mo-cust-address" rows="3" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none font-semibold"></textarea>
                    </div>
                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeCustModal()" class="w-1/4 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition">${isZh?'取消':'Hủy'}</button>
                        <button type="submit" class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-sm transition">${isZh?'生成唯一ID并入库':'Lưu hồ sơ khách hàng'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("cust-modal"); // ⚡ 物理返回拦截启动
    
    document.getElementById("add-cust-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("mo-cust-name").value.trim();
        const social = document.getElementById("mo-cust-social").value.trim() || "未登记";
        const phone = document.getElementById("mo-cust-phone").value.trim();
        const address = document.getElementById("mo-cust-address").value.trim();

        const nextId = `CUST-${1001 + window.ERP_STORE.customers.length}`;
        const payload = { id: nextId, name, social, phone, address };

        const res = await fetch(`${window.API_BASE_URL}/api/customers/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            window.ERP_STORE.customers.push(payload);
            closeCustModal();
            refreshCustomersView();
        } else alert("写入数据库失败");
    });
}

window.closeCustModal = function() {
    const modal = document.getElementById("cust-modal");
    if (modal) modal.remove();
};

function refreshCustomersView() {
    const mv = document.getElementById("main-view");
    mv.innerHTML = `<div class="view-section">${renderCustomers()}</div>`;
    window.init_customers();
}

window.deleteCustomerProfile = async function(index) {
    const cust = window.ERP_STORE.customers[index];
    if(confirm(window.ERP_STORE.current_lang === 'zh' ? `确定删除客户 ${cust.name} 的档案吗？` : `Xóa khách hàng ${cust.name}?`)) {
        const res = await fetch(`${window.API_BASE_URL}/api/customers/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: cust.id })
        });
        if(res.ok) {
            window.ERP_STORE.customers.splice(index, 1);
            refreshCustomersView();
        }
    }
};

window.copyCustomerShippingText = function(index) {
    const cust = window.ERP_STORE.customers[index];
    const textToCopy = `Người nhận: ${cust.name}\nSĐT: ${cust.phone}\nĐịa chỉ: ${cust.address}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert(window.ERP_STORE.current_lang === 'zh' ? `🎉 打单寄件信息已复制！` : `🎉 Đã copy thông tin vận đơn!`);
    });
};
