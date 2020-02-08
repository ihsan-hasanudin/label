var app = angular.module("labelApp", ['ngAnimate', 'angular.filter']);
app.controller("labelCtl", function ($scope, $http, $timeout, $filter) {
    $scope.grupTerpilih = "";
    $scope.grup = {
        // keluarga : [
        //     {nama:"Enung Saadah", alamat:"Majalengka"},
        //     {nama:"Ihsan Hasanudin", alamat:"Cianjur"},
        //     {nama:"Yani Maryani", alamat:"Sumedang"}
        // ]
    };

    $scope.tambahGrup = function () {
        var namaGrup = prompt('Tambah grup');
        if (namaGrup.length > 0) {
            $scope.grup[namaGrup] = [];
        } else {
            alert("Nama grup tak boleh kosong")
        }
    }

    $scope.pilihGrup = function (x) {
        $scope.grupTerpilih = x;
    }

    $scope.hapusOrang = function(x){
        $scope.grup[$scope.grupTerpilih].splice(x, 1);
    }

    $scope.tambahOrang = function(){
        var nama = prompt("Masukkan nama");
        var alamat = prompt("Masukkan alamat") || "Tempat";
        if(nama.length>0){
            $scope.grup[$scope.grupTerpilih].push({
                nama,
                alamat
            })
        }else{
            alert("Nama jangan kosong");
        }
    }

    $scope.hapusGrup = function(x){
        delete $scope.grup[x];
        $scope.grupTerpilih = "";
    }

    $scope.buatDokumen = function(i){
        buatDoc($scope.grup, i);
    }

    $scope.hapusSemua = function(){
        $scope.grup[$scope.grupTerpilih] = [];
        $scope.grupTerpilih = "";
    }

});

app.filter('adaEnggak', function () {
    return function (x, a1, a2) {
        function get(x) {
            return x != undefined ? `${a1} ${x}` : `${a2}`
        }
        return get(x)
    }
});

app.filter('menitKeJam', function () {
    return function (x) {
        function normalize(x) {
            return (x < 10) ? `0${x}` : x;
        }

        function get(x) {
            var a = `${Math.floor(x/60)}.${normalize(x%60)}`;
            return a;
        }
        return get(x)
    }
});

app.filter('kapitalKan', function () {
    return function (x) {
        function kapital(x) {
            var a = x.split(" ").map(function (x) {
                return x.substr(0, 1).toUpperCase() + x.substr(1).toLowerCase();
            }).join(" ");

            return a;
        }
        return kapital(x)
    }
});

app.filter('tgl', function () { // filter is a factory function
    var bulan = "Januari Februari Maret April Mei Juni Juli Agustus September Oktober November Desember"
        .split(" ")
    return function (x) { // first arg is the input, rest are filter params
        if (x == 0) return "-";
        var d = new Date(+x);
        var tgl = d.getDate();
        var bln = bulan[d.getMonth()];
        var thn = d.getFullYear();
        var sisa = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30 * 12));
        return (x > 0) ? `${tgl} ${bln} ${thn} (${sisa} tahun)` : "-";
    }
});

app.filter('tgl_tanpa_usia', function () { // filter is a factory function
    var bulan = "Januari Februari Maret April Mei Juni Juli Agustus September Oktober November Desember"
        .split(" ")
    return function (x) { // first arg is the input, rest are filter params
        if (x == 0) return "";
        var d = new Date(+x);
        var tgl = d.getDate();
        var bln = bulan[d.getMonth()];
        var thn = d.getFullYear();
        var sisa = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30 * 12));
        return (x > 0) ? `${tgl} ${bln} ${thn}` : "";
    }
});

app.filter('objKeJamHari', function () {
    return function (x) {
        var hariArr = "Minggu Senin Selasa Rabu Kamis Jumat Sabtu".split(" ");

        function keJamMenit(x) {
            function tambahNomer(x) {
                return ((x < 10) ? `0${x}` : x)
            }
            return `${tambahNomer(~~(x/60))}.${tambahNomer(x%60)}`;
        }

        function get(x) {
            return `${hariArr[x.hari]} > ${keJamMenit(x.waktu_dari)} - ${keJamMenit(x.waktu_sampai)} - ${x.kelas.nama}`;
        }
        return get(x)
    }
});

$(document).ready(function(){
    var pressTimer;
    $("#grup-list").on("mouseup", ".grup-item", function () {
        clearTimeout(pressTimer);
        // Clear timeout
        return false;
    }).on("mousedown", ".grup-item", function () {
        // Set timeout
        pressTimer = window.setTimeout(function () {
            confirm("Hapus?");
        }, 1000);
        return false;
    });
});

function buatDoc(grup, pilihan) {
    function loadFile(url, callback) {
        PizZipUtils.getBinaryContent(url, callback);
    }

    function generateDocx(template, data, namaFile) {
        loadFile(template, function (error, content) {
            if (error) {
                throw error
            };
            var zip = new PizZip(content);
            var doc = new window.docxtemplater().loadZip(zip)
            doc.setData(data);
            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render()
            } catch (error) {
                var e = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    properties: error.properties,
                }
                console.log(JSON.stringify({
                    error: e
                }));
                // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                throw error;
            }
            var out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }) //Output the document using Data-URI
            saveAs(out, namaFile)
        })
    }

    function buat() {
        loc = "https://ihsan-hasanudin.github.io/label/tag-example.docx";
        data = {
            first_name: 'John',
            last_name: 'Doe',
            phone: '0652455478',
            description: 'New Website'
        }
        generateDocx(loc, data, "ihsan.docx")
    }

    function buatLabel() {
        Object.keys(grup).forEach(e => {
            loc = `https://ihsan-hasanudin.github.io/label/template/template_koala.docx`;
            nama_grup = e.toLowerCase().replace(" ", "_");
            isi_grup = grup[e];
            var i_loop = 1;
            var loop = [];

            function pushToLoop(nama, alamat) {
                if (loop.length == 0) {
                    loop.push({});
                    loop[0][`nama_1`] = nama;
                    loop[0][`tempat_1`] = alamat;
                    loop[0][`di_1`] = `di`;
                } else {
                    var objTerakhir = loop[loop.length - 1];
                    if (Object.keys(objTerakhir).length > 36) {
                        i_loop = 1;
                        loop.push({
                            'nama_1': nama,
                            'tempat_1': alamat,
                            'di_1': 'di'
                        });
                    } else {
                        loop[loop.length - 1][`nama_${i_loop}`] = nama;
                        loop[loop.length - 1][`tempat_${i_loop}`] = alamat;
                        loop[loop.length - 1][`di_${i_loop}`] = `di`;
                    }
                }
                i_loop++;
            }

            isi_grup.map(function (x) {
                pushToLoop(x.nama, x.alamat);
            });

            loop.map(function (x) {
                if (Object.keys(x).length < 36) {
                    console.log(`kurang : ${(36-Object.keys(x).length)/3}`);
                    var mulai_dari = 12 - ((36 - Object.keys(x).length) / 3);
                    for (var i = mulai_dari + 1; i <= 12; i++) {
                        x[`nama_${i}`] = "";
                        x[`tempat_${i}`] = "";
                        x[`di_${i}`] = "";
                    }
                };
                return x;
            });

            data = {
                title: "judul",
                loop: [...loop]
            }

            generateDocx(loc, data, `LABEL_grup_${nama_grup}.docx`);
        });
    }

    function buatRekap() {
        Object.keys(grup).forEach(e => {
            nama_grup = e.toLowerCase().replace(" ", "_");
            loc = `https://ihsan-hasanudin.github.io/label/template/rekap.docx`;
            data = {
                namaGrup: e,
                loop: [
                    // {no : "1", nama : "Ihsan Hasanudin", alamat : "Cianjur"},
                    // {no : "2", nama : "Enung Sa'adah", alamat : "Majalengka"},
                    // {no : "3", nama : "Yani Maryani H", alamat : "Sumedang"}
                    ...grup[e].map(function (x, i) {
                        x.no = i + 1;
                        return x
                    })
                ]
            }
            generateDocx(loc, data, `REKAP_grup_${nama_grup}.docx`);
        });
    }

    var p = prompt("Masukkan Kode Registrasi untuk mendownload Label / Rekap Label Undanan");
    if(p=='label2020diinvitation'){
    switch (pilihan) {
        case 0:
            buatRekap();
            buatLabel();
            break;

        case 1:
            buatLabel();
            break;
        case 2:
            buatRekap();
            break;
    }
    }else{
        alert("Kode Registrasi Salah");
    }
}

app.filter('mathCeil', function () {
    return function (x) {
        function get(x) {
            return Math.ceil(x);
        }
        return get(x)
    }
});

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}