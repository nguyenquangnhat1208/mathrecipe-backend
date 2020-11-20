$(document).ready(function () {

   var table = $('#tblresult').DataTable({
      "processing": true,
      "serverSide": true,
      'dom':
         "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'<'float-md-right ml-2'B>f>>" +
         "<'row'<'col-sm-12'tr>>" +
         "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      "ajax": {
         "cache": "false",
         "url": "/api/v1/scripture/get",
         "type": "POST",
         "dataType": "json",
         // 'beforeSend': function (request) {
         //     request.setRequestHeader("X-CSRF-TOKEN", $('meta[name="csrf-token"]').attr('content'));
         // },
         "cache": true,
         "dataSrc": function (json) {
            json.data.forEach(element => {
               element.Method = (element.status == true ? `<a class=" btn btn-primary fa-hover btn-sm"    title="Not hidden" ><i class="far fa-eye" style="color:#ffff;"></i></a>&nbsp&nbsp`
                  : `<a class=" btn btn-secondary fa-hover btn-sm"    title="Hidden" ><i class="far fa-eye-slash" style="color:#ffff;"></i></a>&nbsp&nbsp`) +
                  `<a class=" btn btn-info btnInfo fa-hover btn-sm"    title="Open in bible verse" ><i class="fas fa-info-circle" style="color:#ffff;"></i></a>&nbsp&nbsp` +
                  `<a class=" btn btn-success btnEdit fa-hover btn-sm"    title="Edit category" ><i class="fa fa-edit" style="color:#ffff;"></i></a>&nbsp&nbsp` +
                  `<a class=" btn btn-danger btnDelete fa-hover btn-sm"    title="Delete category" ><i class="fa fa-trash" style="color:#ffff;"></i></a>`;
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
         { "visible": false, "targets": [0, 2, 4, 5] },
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
            'data': 'title',
            'class': 'text-right'
         },
         {
            'data': 'urlKey',
            'class': 'text-right'
         },
         {
            'data': 'status'
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

            var max = 0;
            $('tbody tr', $table).each(function () {
               $(this).height('400px');
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

   //on click card
   $("#tblresult").on("click", ".btnInfo", function () {
      var data = $('#tblresult').DataTable().row($(this).parents('tr')).data();
      window.open('/bibleVerse-manager?scripture_id=' + data._id, '_blank');
   });

   // -----------------------------Add------------------------------
   $("#btnAdd").click(function () {
      $('#c_title').val(null);
      $('#c_imgInp').val(null);
      $('#u_status').val(1);
      $("#createModal").modal('show');
   });
   $("#btnYoutube").click(function () {
      // $('#c_youtube').val(null); 
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
      $("#YoutubeModal").modal('show');
   });
   function update(data) {
      $('#c_youtube').val(data.url_youtube);
   }
   $('#formYouTube').submit((e) => {
      e.preventDefault();
      let form = $('#formYouTube').serializeArray();
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
            $("#YoutubeModal").modal('hide');
         })
         .fail(() => {
            toastr["error"]("Xảy ra lỗi, vui lòng tải lại trang!");
         });
   });
   $('#formPost').submit((e) => {
      e.preventDefault();
      var data = new FormData($('#formPost')[0]);
      $.ajax({
         type: "POST",
         enctype: 'multipart/form-data',
         url: "/api/v1/scripture/create",
         data: data,
         processData: false,
         contentType: false,
         cache: false,
         timeout: 600000
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
            toastr["error"]("An error has occurred, please reload the page!");
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
      let q = "Are you sure you want to delete <b>" + obj.title + " " + "</b> ?";
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
         url: "/api/v1/scripture/delete/" + id,
         method: "delete",
      })
         .done((data) => {
            if (data.status) {
               $('#tblresult').DataTable().ajax.reload();
               $("#deletemodal").modal('hide');
               toastr["success"](data.msg);
            }
            else {
               toastr["error"](data.msg);
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
      $("#u_status").val(obj.status.toString());
      $("#updateModal").modal('show');
   });
   $('#formPut').submit((e) => {
      e.preventDefault();
      var data = new FormData($('#formPut')[0]);
      $.ajax({
         type: "PUT",
         enctype: 'multipart/form-data',
         url: "/api/v1/scripture/update",
         data: data,
         processData: false,
         contentType: false,
         cache: false,
         timeout: 600000
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