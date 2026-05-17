// ==========================================
// 👥 中越通跨境代购 ERP - 客户管理模块 (完全体)
// ==========================================

function renderCustomers() {
    const isZh = window.ERP_STORE.current_lang === "zh";
    let cardsHTML = "";

    window.ERP_STORE.customers.forEach((cust, index) => {
        // 📱 H5 核心：点击整张卡片的非按钮区域，直接触发深度编辑修改
        cardsHTML += `
            <div class="cust-row bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 animate-fadeIn cursor-pointer active:bg-slate-50/50 transition-all"
                data-search-name="${cust.name.toLowerCase()}"
                data-search-phone="${cust.phone}"
                data-search-id="${cust.id.toLowerCase()}"
                onclick="handleCustomerCardClick(event, ${index})">
                
                <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                        <h4 class="text-sm font-black text-slate-900">${cust.name}</h4>
                        <span class="text-[11px] text-slate-400 font-mono mt-0.5 block">${cust.id}</span>
                    </div>
                    <span class="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">${isZh ? '点击卡片修改' : 'Sửa'}</span>
                </div>

                <div class="text-xs space-y-2 text-slate-600 font-semibold pl-1">
                    <div class="flex items-center gap-2">
                        <span class="w-16 text-slate-400 font-bold">${isZh?'社交号':'Mạng XH'}:</span>
                        <span class="font-mono text-slate-800">${cust.social || '未登记'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-16 text-slate-400 font-bold">${isZh?'越南电话':'Số ĐT'}:</span>
                        <span class="font-mono text-indigo-600 font-bold">${cust.phone}</span>
                    </div>
                    <div class="flex items-start gap-2 leading-relaxed">
                        <span class="w-16 text-slate-400 font-bold flex-shrink-0">${isZh?'收货地址':'Địa chỉ'}:</span>
                        <span class="text-slate-500 font-medium">${cust.address}</span>
                    </div>
                </div>

                <div class="pt-1">
                    <button onclick="copyCustomerShippingText(event, ${index})" class="w-full bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-xs border border-indigo-100/70 active:bg-indigo-600 active:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm">
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
                <button onclick="openCustomerFormModal(null)" class="w-full bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
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
    const searchIn = document.getElementById("cust-search-input");
    if(searchIn) {
        searchIn.addEventListener("input", (e) => {
            const val = e.target.value.trim().toLowerCase();
            document.querySelectorAll(".cust-row").forEach(card => {
                const name = card.getAttribute("data-search-name");
                const phone = card.getAttribute("data-search-phone");
                const id = card.getAttribute("data-search-id");
                if(name.includes(val) || phone.includes(val) || id.includes(val)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
};

// 拦截点击事件，防止点“复制”时触发弹窗修改
window.handleCustomerCardClick = function(event, index) {
    if (event.target.closest('button')) return;
    openCustomerFormModal(index);
};

// ==========================================
// 🔄 核心融合：一个弹窗，兼顾新建与深度修改
// ==========================================
window.openCustomerFormModal = function(editIndex = null) {
    const isEdit = editIndex !== null;
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    // 如果是修改状态，提取出老数据填入输入框
    const targetCust = isEdit ? window.ERP_STORE.customers[editIndex] : { name: "", social: "", phone: "", address: "", id: "" };

    const modalHTML = `
        <div id="cust-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 my-auto animate-fadeIn flex flex-col max-h-[85vh]">
                <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 class="text-xs font-black text-slate-800">
                        <i class="fa-solid fa-address-card text-indigo-500"></i> 
                        ${isEdit ? (isZh?'修改买家档案资料':'Chỉnh sửa hồ sơ khách') : (isZh?'录入全新买家档案':'Tạo hồ sơ khách mới')}
                    </h3>
                    <button type="button" onclick="closeCustModal()" class="text-slate-400 text-lg">✕</button>
                </div>
                
                <form id="add-cust-form" class="p-5 space-y-4 text-xs overflow-y-auto grow font-bold text-slate-600">
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">${isZh?'买家姓名/微信昵称 (必填)':'Tên khách hàng (Bắt buộc)'}</label>
                        <input type="text" id="mo-cust-name" value="${targetCust.name}" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-800 text-sm focus:outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-400 font-bold mb-1">${isZh?'社交号 (微信/Zalo)':'Mạng XH'}</label>
                            <input type="text" id="mo-cust-social" value="${targetCust.social}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-black text-slate-800 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-slate-400 font-bold mb-1">${isZh?'越南电话 (必填)':'Số điện thoại VN'}</label>
                            <input type="text" id="mo-cust-phone" value="${targetCust.phone}" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-black text-slate-800 focus:outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block text-slate-400 font-bold mb-1">${isZh?'越南本土完整收货地址':'Địa chỉ nhận hàng tại VN'}</label>
                        <textarea id="mo-cust-address" rows="3" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-black text-slate-700 text-sm focus:outline-none">${targetCust.address}</textarea>
                    </div>

                    ${isEdit ? `
                        <div class="border-t border-dashed border-slate-200 pt-3">
                            <button type="button" onclick="deleteCustomerProfileFromForm(${editIndex})" class="w-full bg-rose-50 text-rose-600 py-2.5 rounded-xl font-black text-xs border border-rose-100 flex items-center justify-center gap-1.5">
                                <i class="fa-regular fa-trash-can"></i> ${isZh ? '彻底销毁此买家档案' : 'Xóa vĩnh viễn hồ sơ'}
                            </button>
                        </div>
                    ` : ''}
                </form>

                <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0">
                    <button type="button" onclick="closeCustModal()" class="w-1/4 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold">${isZh?'取消':'Hủy'}</button>
                    <button type="button" onclick="submitCustomerFormAction(${editIndex})" class="flex-grow bg-indigo-600 text-white py-3 rounded-xl font-black shadow-md active:scale-[0.98] transition-all">${isZh?'保存全部变动':'Lưu lại'}</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pushModalHistoryState("cust-modal"); 
};

// ==========================================
// 💾 数据吞吐：统一处理新建或修改保存
// ==========================================
window.submitCustomerFormAction = async function(editIndex) {
    const isEdit = editIndex !== null;
    const isZh = window.ERP_STORE.current_lang === "zh";

    const name = document.getElementById("mo-cust-name").value.trim();
    const social = document.getElementById("mo-cust-social").value.trim() || "未登记";
    const phone = document.getElementById("mo-cust-phone").value.trim();
    const address = document.getElementById("mo-cust-address").value.trim();

    if(!name || !phone || !address) {
        alert(isZh ? "❌ 请完整填写必填项！" : "Vui lòng điền đủ thông tin!");
        return;
    }

    let targetId = "";
    let apiPath = `${window.API_BASE_URL}/api/customers/add`;
    let reqMethod = "POST";

    if (isEdit) {
        // 修改模式：锁死原有的唯一 ID，改用 PUT 请求全量覆写
        targetId = window.ERP_STORE.customers[editIndex].id;
        apiPath = `${window.API_BASE_URL}/api/customers/add`; // 沿用 workers 的 INSERT OR REPLACE 覆盖接口
    } else {
        // 新建模式：自动累加生成全新 ID
        targetId = `CUST-${1001 + window.ERP_STORE.customers.length}`;
    }

    const payload = { id: targetId, name, social, phone, address };

    const res = await fetch(apiPath, {
        method: reqMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if(res.ok) {
        if (isEdit) {
            window.ERP_STORE.customers[editIndex] = payload;
        } else {
            window.ERP_STORE.customers.push(payload);
        }
        closeCustModal();
        refreshCustomersView();
        alert(isZh ? "🎉 资料已成功实时云同步！" : "🎉 Cập nhật thành công!");
    } else {
        alert("D1 Link Error");
    }
};

window.closeCustModal = function() {
    const modal = document.getElementById("cust-modal");
    if (modal) modal.remove();
};

function refreshCustomersView() {
    const mv = document.getElementById("main-view");
    if(mv) {
        mv.innerHTML = `<div class="view-section">${renderCustomers()}</div>`;
        window.init_customers();
    }
}

window.deleteCustomerProfileFromForm = async function(index) {
    const cust = window.ERP_STORE.customers[index];
    const isZh = window.ERP_STORE.current_lang === "zh";
    
    if(confirm(isZh ? `🚨 确定要永久删除客户【${cust.name}】的全部档案吗？` : `Xóa khách hàng ${cust.name}?`)) {
        const res = await fetch(`${window.API_BASE_URL}/api/customers/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: cust.id })
        });
        if(res.ok) {
            window.ERP_STORE.customers.splice(index, 1);
            closeCustModal();
            refreshCustomersView();
        }
    }
};

window.copyCustomerShippingText = function(event, index) {
    event.stopPropagation(); // 强行拦截事件冒泡，防止复制时弹出修改面板
    const cust = window.ERP_STORE.customers[index];
    const textToCopy = `Người nhận: ${cust.name}\nSĐT: ${cust.phone}\nĐịa chỉ: ${cust.address}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert(window.ERP_STORE.current_lang === 'zh' ? `🎉 寄件打单文本已成功复制！` : `🎉 Đã copy thông tin vận đơn!`);
    });
};
