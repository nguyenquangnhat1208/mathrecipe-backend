$(document).ready(function () {

    $.ajax({
        "cache": "false",
        "url": "/api/v1/get-url",
        "type": "GET",
        "dataType": "json",
        "cache": true,
        "success": function (json) {
            let data = json.url[0];
            if (json.status) {
                update(data);
            }
        },
    });
    function update(data) {
        $('#url_youtube').val(data.url_youtube);
        $('#url_bulb').val(data.url_bulb);
        $('#url_book').val(data.url_book);
        $('#url_burgemenu').val(data.url_burgemenu);
        $('#url_ear').val(data.url_ear);
    }
    $('#frmPost').submit((e) => {
        e.preventDefault();
        let form = $('#frmPost').serializeArray();
        $.ajax({
            url: "/api/v1/edit-url",
            method: "POST",
            data: form,
            dataType: 'json'
        })
            .done((data) => {
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
    });
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
})