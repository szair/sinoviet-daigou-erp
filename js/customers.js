function renderCustomers() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    let cardsHTML = "";

    window.ERP_STORE.customers.forEach((cust, index) => {
        // 📱 H5 核心：重组为极简流畅的联系人名片流
        cardsHTML += `
            <div class="cust-row bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 animate-fadeIn"
                data-search-name="${cust.name.toLowerCase()}"
                data-search-phone="${cust.phone}"
                data-search-id="${cust.id.toLowerCase()}">
                
                <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                        <h4 class="text-sm font-black text-slate-900">${cust.name}</h4>
                        <span class="text-[11px] text-slate-400 font-mono mt-0.5 block">${cust.id}</span>
                    </div>
                    <button onclick="deleteCustomerProfile(${index})" class="text-rose-400 p-1 text-base" title="删除档案">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>

                <div class="text-xs space-y-2 text-slate-600 font-semibold pl-1">
                    <div class="flex items-center gap-2">
                        <span class="w-16 text-slate-400 font-bold">${isZh?'社交号':'Mạng XH'}:</span>
                        <span class="font-mono text-slate-800">${cust.social}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-16 text-slate-400 font-bold">${isZh?'越南电话':'Số ĐT'}:</span>
                        <a href="tel:${cust.phone}" class="font-mono text-indigo-600 font-bold underline decoration-indigo-200">${cust.phone}</a>
                    </div>
                    <div class="flex items-start gap-2 leading-relaxed">
                        <span class="w-16 text-slate-400 font-bold flex-shrink-0">${isZh?'收货地址':'Địa chỉ'}:</span>
                        <span class="text-slate-500 font-medium">${cust.address}</span>
                    </div>
                </div>

                <div class="pt-1">
                    <button onclick="copyCustomerShippingText(${index})" class="w-full bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-xs border border-indigo-100/70 active:bg-indigo-600 active:text-white transition-all flex items-center justify-center gap-1.5">
                        <i class="fa-regular fa-copy text-sm"></i> ${isZh ? '一键复制完整寄件打单文本' : 'Copy địa chỉ gửi hàng'}
                    </button>
                </div>
            </div>
        `;
    });

    if (cardsHTML === "") {
        cardsHTML = `<div class="bg-white p-12 rounded-2xl border border-slate-100 text-center italic text-slate-400 text-xs">${isZh?'暂无买家数据档案':'Chưa có dữ liệu'}</div>`;
    }

    return `
        <div class="space-y-4 w-full max-w-md mx-auto">
            <div class="flex flex-col gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <button id="btn-trigger-add-cust" class="w-full bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                    <i class="fa-solid fa-user-plus"></i> ${isZh?'创建新买家档案':'Thêm khách hàng'}
                </button>
                <div class="relative w-full">
                    <span class="absolute left-3.5 top-3 text-slate-400 text-[11px]"><i class="fa-solid fa-search"></i></span>
                    <input type="text" id="cust-search-input" placeholder="${isZh?'搜索姓名、电话、唯一ID...':'Tìm tên, mã, số điện thoại...'}" class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none font-bold text-slate-800">
                </div>
            </div>

            <div class="space-y-4 pb-12" id="cust-cards-container">
                ${cardsHTML}
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
            document.querySelectorAll(".cust-row").forEach(card => {
                const name = card.getAttribute("data-search-name");
                const phone = card.getAttribute("data-search-phone");
                const id = card.getAttribute("data-search-id");
                if(name.includes(val) || phone.includes(val) || id.includes(val)) card.classList.remove("hidden");
                else card.classList.add("hidden");
            });
        });
    }
};

function openAddCustomerModal() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    const modalHTML = `
        <div id="cust-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 my-auto animate-fadeIn">
                <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-xs font-black text-slate-800"><i class="fa-solid fa-address-card text-indigo-500"></i> ${isZh?'录入全新买家档案':'Tạo hồ sơ khách mới'}</h3>
                    <button type="button" onclick="closeCustModal()" class="text-slate-400 text-lg">✕</button>
                </div>
                
                <form id="add-cust-form" class="p-5 space-y-4 text-xs">
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">${isZh?'买家姓名/微信昵称 (必填)':'Tên khách hàng (Bắt buộc)'}</label>
                        <input type="text" id="mo-cust-name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none text-slate-800">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-400 font-bold mb-1">${isZh?'社交号':'Mạng XH'}</label>
                            <input type="text" id="mo-cust-social" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none text-slate-800">
                        </div>
                        <div>
                            <label class="block text-slate-400 font-bold mb-1">${isZh?'越南电话 (必填)':'Số điện thoại VN'}</label>
                            <input type="text" id="mo-cust-phone" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono focus:outline-none text-slate-800">
                        </div>
                    </div>
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">${isZh?'越南本土完整收货地址':'Địa chỉ nhận hàng tại VN'}</label>
                        <textarea id="mo-cust-address" rows="3" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none font-bold text-slate-700"></textarea>
                    </div>
                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="closeCustModal()" class="w-1/4 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold">${isZh?'取消':'Hủy'}</button>
                        <button type="submit" class="flex-grow bg-indigo-600 text-white py-3 rounded-2xl font-black shadow-md">${isZh?'生成唯一ID并入库':'Lưu khách hàng'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("cust-modal"); 
    
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
        } else alert("写入 D1 失败");
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
        alert(window.ERP_STORE.current_lang === 'zh' ? `🎉 寄件打单文本已复制！` : `🎉 Đã copy thông tin vận đơn!`);
    });
};
