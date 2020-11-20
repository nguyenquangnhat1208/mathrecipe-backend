$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    $('.scripture_id').val(urlParams.get('scripture_id'));
    var table = $('#tblresult').DataTable({
        "processing": true,
        "serverSide": true,
        'dom':
            "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'<'float-md-right ml-2'B>f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        "ajax": {
            "cache": "false",
            "url": "/api/v1/bible-verse/get?" + urlParams.toString(),
            "type": "POST",
            "dataType": "json",
            "cache": true,
            "dataSrc": function (json) {
                json.data.forEach(element => {
                    if (element.no_title == undefined) element.no_title = "Demo";
                    if (element.no_content == undefined) element.no_content = "Demo";
                    element.Method = (element.status == true ? `<a class=" btn btn-primary fa-hover btn-sm"    title="Not hidden" ><i class="far fa-eye" style="color:#ffff;"></i></a>&nbsp&nbsp`
                        : `<a class=" btn btn-secondary fa-hover btn-sm"    title="Hidden" ><i class="far fa-eye-slash" style="color:#ffff;"></i></a>&nbsp&nbsp`) +
                        `<a class=" btn btn-success btnEdit fa-hover btn-sm"    title="Edit bible verse" ><i class="fa fa-edit" style="color:#ffff;"></i></a>&nbsp&nbsp`
                        + `<a class=" btn btn-danger btnDelete fa-hover btn-sm"    title="Delete bible verse" ><i class="fa fa-trash" style="color:#ffff;"></i></a>`;
                });

                return json.data;
            },
        },
        "PaginationType": "bootstrap",
        'buttons': ['csv', {
            'text': '<i class="fa fa-id-badge fa-fw" aria-hidden="true"></i>',
            'action': function (e, dt, node) {
                // console.log(dt)
                $(dt.table().node()).toggleClass('cards');
                $('.fa', node).toggleClass(['fa-table', 'fa-id-badge']);

                dt.draw('page');
            },
            'className': 'btn-sm',
            'attr': {
                'title': 'Change views',
            }
        }],
        "columnDefs": [
            { "visible": false, "targets": [0, 2, 3, 4, 5, 6, 7, 8, 9] },
            // {
            //    "className": "text-center",
            //    "width": "50px",
            //    "orderable": false,
            //    "targets": 0
            // },
            // {
            //    "className": "text-center",
            //    "width": "60px",
            //    "orderable": false,
            //    "targets": 6
            // }
        ],
        'select': 'single',
        'columns': [
            {
                'data': '_id'
            },
            {
                'orderable': false,
                'data': "thumbnail_url",
                'className': 'text-center',
                'render': function (data, type, full, meta) {
                    if (type === 'display') {
                        data = '<img src="' + data + '" class="avatar border" style="border-radius: 6px;">';
                    }

                    return data;
                }
            },
            {
                'data': 'image_url',
            },
            {
                'data': 'url_bulb',
            },
            {
                'data': 'url_book',
            },
            {
                'data': 'url_burgemenu',
            },
            {
                'data': 'url_ear',
            },
            {
                'data': 'status'
            },
            {
                'data': 'no_title'
            },
            {
                'data': 'no_content'
            },
            {
                'data': 'Method',
                'class': 'text-right'
            },
        ],
        'drawCallback': function (settings) {
            var api = this.api();
            var $table = $(api.table().node());

            if ($table.hasClass('cards')) {

                // Create an array of labels containing all table headers
                var labels = [];
                $('thead th', $table).each(function () {
                    labels.push($(this).text());
                });

                // Add data-label attribute to each cell
                $('tbody tr', $table).each(function () {
                    $(this).find('td').each(function (column) {
                        $(this).attr('data-label', labels[column]);
                    });
                });
                $('tbody tr', $table).each(function () {
                    $(this).height('350px');
                });
            } else {
                // Remove data-label attribute from each cell
                $('tbody td', $table).each(function () {
                    $(this).removeAttr('data-label');
                });

                $('tbody tr', $table).each(function () {
                    $(this).height('auto');
                });
            }
        }
    })
        .on('select', function (e, dt, type, indexes) {
            var rowData = table.rows(indexes).data().toArray()
            $('#row-data').html(JSON.stringify(rowData));
        })
        .on('deselect', function () {
            $('#row-data').empty();
        })
    $(table.table().node()).toggleClass('cards');

    // -----------------------------Add------------------------------
    $("#btnAdd").click(function () {
        $('#c_imgInp').val(null);
        $('#c_url_youtube').val(null);
        $('#c_blah').attr('src', '/public/images/default-image-620x600.jpg');
        $('#c_link').attr('href', '/public/images/default-image-620x600.jpg');
        $('#c_imgInp').val(null);
        $('#c_url_ear').val(null);
        $('#c_url_burgemenu').val(null);
        $('#c_url_book').val(null);
        $('#c_url_bulb').val(null);
        $('#c_no_title').val(null);
        $('#c_no_content').val(null);
        $('#c_status').val("true");
        $("#createModal").modal('show');
    });
    $('#formPost').submit((e) => {
        e.preventDefault();
        var data = new FormData($('#formPost')[0]);
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/api/v1/bible-verse/create",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            // timeout: 600000
        }).done((data) => {
            if (data.status) {
                $('#tblresult').DataTable().ajax.reload();
                $("#createModal").modal('hide');
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
                toastr["error"]("An error has occurred, please reload the page !");
            });
    })
    function readURLA(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#c_blah').attr('src', e.target.result);
                $('#c_link').attr('href', e.target.result);
            }
            reader.readAsDataURL(input.files[0]); // convert to base64 string
        }
    }
    $("#c_imgInp").change(function () {
        readURLA(this);
    });
    // -----------------------------!Add------------------------------

    // -----------------------------Delete------------------------------
    $("#tblresult").on("click", ".btnDelete", function () {
        var obj = $('#tblresult').DataTable().row($(this).parents('tr')).data();
        $("#r_id").val(obj._id);
        $('#deletemodal h4').html("Delete scripture");
        let q = "Are you sure delete this image ?";
        $("#btnSubmitDetail").html("Delete")
        $('#deletemodal h5').html(q);
        $('#d_blah').attr('src', obj.image_url);
        $('#d_link').attr('href', obj.image_url);
        $("#deletemodal").modal('show');
    });
    $('#frmDelete').submit((e) => {
        e.preventDefault();
        $("#btnSubmitConfirm").attr("disabled", true);
        var id = $('#r_id').val();
        $.ajax({
            url: "/api/v1/bible-verse/delete/" + id,
            method: "delete",
        })
            .done((data) => {
                if (data.status) {
                    $('#tblresult').DataTable().ajax.reload();
                    $("#deletemodal").modal('hide');
                    toastr["success"](data.msg);
                }
                else {
                    toastr["error"]("Error number: " + data.msg);
                }
            })
            .fail(() => {
                $("#deletemodal").modal('hide');
                toastr["error"]("An error has occurred, please reload the page !");
            });
        $("#btnSubmitConfirm").removeAttr("disabled");
    });
    // -----------------------------!Delete------------------------------

    // -----------------------------Update------------------------------
    $("#tblresult").on("click", ".btnEdit", function () {
        var obj = $('#tblresult').DataTable().row($(this).parents('tr')).data();
        $('#_id').val(obj._id);
        $('#u_title').val(obj.title);
        $('#u_blah').attr('src', obj.image_url);
        $('#u_link').attr('href', obj.image_url);
        $("#u_imgInp").change(function () {
            filename = this.files[0].name
        });
        $('#u_url_ear').val(obj.url_ear);
        $('#u_url_burgemenu').val(obj.url_burgemenu);
        $('#u_url_book').val(obj.url_book);
        $('#u_url_bulb').val(obj.url_bulb);
        $('#u_no_title').val(obj.no_title);
        $('#u_no_content').val(obj.no_content);
        $('#u_status').val(obj.status.toString());
        // $("#MonHoc_id").val(obj.MonHoc_id._id);
        $("#updateModal").modal('show');
    });
    $('#formPut').submit((e) => {
        e.preventDefault();
        var data = new FormData($('#formPut')[0]);
        $.ajax({
            type: "PUT",
            enctype: 'multipart/form-data',
            url: "/api/v1/bible-verse/update",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            // timeout: 600000
        }).done((data) => {
            if (data.status) {
                $('#tblresult').DataTable().ajax.reload();
                $("#updateModal").modal('hide');
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
                toastr["error"]("An error has occurred, please reload the page!");
            });
    })
    function readURLU(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#u_blah').attr('src', e.target.result);
                $('#u_link').attr('href', e.target.result);
            }
            reader.readAsDataURL(input.files[0]); // convert to base64 string
        }
    }
    $("#u_imgInp").change(function () {
        readURLU(this);
    });
    // -----------------------------!Update------------------------------
});