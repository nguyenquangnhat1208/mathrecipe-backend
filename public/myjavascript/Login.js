$('#frmLogin').submit((e) => {
    e.preventDefault();
    let form = $('#frmLogin').serializeArray();
    $.ajax({
        url: 'api/v1/auth/login',
        method: 'POST',
        data: form,
        dataType: 'json'
    })
        .done((data) => {
            console.log(data);

            if (data.status) {
                toastr["success"](data.msg);
            }
            else {
                if (Array.isArray(data.msg)) {
                    data.msg.forEach((e, i) => {
                        toastr["error"]("Lỗi số " + (i + 1) + " :" + e.msg);
                    })
                } else {
                    toastr["warning"](data.msg);
                }
            }
        })
        .fail(() => {
            toastr["error"]("Xảy ra lỗi, vui lòng tải lại trang!");
        });
})