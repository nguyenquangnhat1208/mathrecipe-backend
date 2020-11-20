$(document).ready(function () {
    var table = $('#tblresult').DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
            "cache": "false",
            "url": "/api/v1/account-manager/get",
            "type": "POST",
            "dataType": "json",
            // 'beforeSend': function (request) {
            //     request.setRequestHeader("X-CSRF-TOKEN", $('meta[name="csrf-token"]').attr('content'));
            // },
            "cache": true,
            "dataSrc": function (json) {
                console.log(json.data);

                json.data.forEach(element => {
                    element.Method = `<a class="btn btn-success btn-sm my-method-button btnEdit fa-hover"    title="Edit account" ><i class="fa fa-edit" style="color:#ffff;"></i></a> &nbsp
                                <a class="btn btn-danger btn-sm my-method-button btnDelete fa-hover"    title="Delete account" ><i class="fa fa-trash" style="color:#ffff;"></i></a>`;
                });

                return json.data;
            },
        },

        "PaginationType": "bootstrap",
        "columnDefs": [
            { "visible": false, "targets": [1, 3] },
            // {
            //     "className": "text-center",
            //     "width": "50px",
            //     "orderable": false,
            //     "targets": 0
            // },
            // {
            //     "className": "text-center",
            //     "width": "60px",
            //     "orderable": false,
            //     "targets": 6
            // }
        ],
        columns: [
            { "data": null },
            { "data": '_id' },
            { "data": 'email' },
            { "data": 'password' },
            { "data": 'Method', 'class': 'text-center' }
        ],
        bAutoWidth: false,
        fnRowCallback: (nRow, aData, iDisplayIndex) => {
            $("td:first", nRow).html(iDisplayIndex + 1);
            return nRow;
        },
    });

    // insert

    $("#btnAdd").click(function () {
        $('#c_email').val(null);
        $('#c_password').val(null);
        $("#editmodal").modal('show');
    });
    $('#frmPost').submit((e) => {
        e.preventDefault();
        let form = $('#frmPost').serializeArray();
        $.ajax({
            url: "/api/v1/account-manager/create",
            method: "POST",
            data: form,
            dataType: 'json'
        })
            .done((data) => {
                if (data.status) {
                    $('#tblresult').DataTable().ajax.reload();
                    $("#editmodal").modal('hide');
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
                $("#editmodal").modal('hide');
                toastr["error"]("An error has occurred, please reload the page!");
            });
        $("#btnSubmitConfirm").removeAttr("disabled");
    });
    $(".imgInp").change(function () {
        readURL(this);
    });
    $("#tblresult").on("click", ".btnEdit", function () {
        var obj = $('#tblresult').DataTable().row($(this).parents('tr')).data();
        $('#u_id').val(obj._id);
        $('#u_email').val(obj.email);
        $('#u_password').val(obj.password);
        $("#updatemodal").modal('show');
    });

    // update
    $('#frmPut').submit((e) => {
        var id = $('#u_id').val();
        e.preventDefault();
        let form = $('#frmPut').serializeArray();
        $.ajax({
            url: "/api/v1/account-manager/update/" + id,
            method: "PUT",
            data: form,
            dataType: 'json'
        })
            .done((data) => {
                if (data.status) {
                    $('#tblresult').DataTable().ajax.reload();
                    $("#updatemodal").modal('hide');
                    toastr["success"](data.msg);
                }
                else {
                    if (Array.isArray(data.msg)) {
                        data.msg.forEach((e, i) => {
                            toastr["error"]("Error number " + (i + 1) + " :" + e.msg);
                        })
                    } else {
                        toastr["warning"](data.msg);
                    }
                }
            })
            .fail(() => {
                $("#updatemodal").modal('hide');
                toastr["error"]("An error has occurred, please reload the page !");
            });
        $("#btnSubmitUpdate").removeAttr("disabled");
    });

    //---- remove 
    $("#tblresult").on("click", ".btnDelete", function () {
        var obj = $('#tblresult').DataTable().row($(this).parents('tr')).data();
        $("#r_id").val(obj._id);
        $('#deletemodal h4').html("Delete account");
        let q = "Are you sure you want to delete<b> " + obj.email + " " + "</b>?";
        $("#btnSubmitDetail").html("Delete")
        $('#deletemodal h5').html(q);
        $("#deletemodal").modal('show');
    });

    $('#frmDelete').submit((e) => {
        e.preventDefault();
        $("#btnSubmitConfirm").attr("disabled", true);
        var id = $('#r_id').val();
        $.ajax({
            url: "/api/v1/account-manager/delete/" + id,
            method: "delete",
        })
            .done((data) => {
                if (data.status) {
                    $('#tblresult').DataTable().ajax.reload();
                    $("#deletemodal").modal('hide');
                    toastr["success"](data.msg);
                }
                else {
                    toastr["warning"](data.msg);
                }
            })
            .fail(() => {
                $("#deletemodal").modal('hide');
                toastr["error"]("An error has occurred, please reload the page !");
            });
        $("#btnSubmitConfirm").removeAttr("disabled");
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