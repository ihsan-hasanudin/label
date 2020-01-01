function saveToStorage(x) {
    localStorage.setItem("data", JSON.stringify(x));
}

function loadFromStorage() {
    var d = {};
    try {
        d = JSON.parse(localStorage.getItem("data"));
    } catch (e) {
        d = {};
    }
    return d;
}

var app = angular.module('labelKu', []);
app.controller('labelCtl', function ($scope, $http, $timeout) {
    $scope.grupTerpilih = "";
    $scope.grup = loadFromStorage() || {};

    $scope.saveChanges = function () {
        saveToStorage($scope.grup);
    }

    $scope.tambahGrup = function (x) {
        if (x.length > 0) {
            $scope.grup[x] = [];
            $scope.tambahGrup_text = "";
            $scope.saveChanges();
        } else {
            alert("Nama grup jangan kosong")
        }
    }

    $scope.hapusGrup = function (x) {
        delete $scope.grup[x];
        $scope.saveChanges();
        $scope.grupTerpilih = "";
    }

    $scope.pilihGrup = function (x) {
        $scope.grupTerpilih = x;
        document.getElementById("kolomNama").focus();
    }

    $scope.tambahOrang = function () {
        var nama = $scope.t_nama;
        var alamat = $scope.t_alamat || "Tempat";
        if (nama.length > 0 && alamat.length > 0) {
            $scope.grup[$scope.grupTerpilih].push({
                nama,
                alamat
            })
        }
        $scope.t_nama = "";
        $scope.t_alamat = "";
        document.getElementById("kolomNama").focus();
        $scope.saveChanges();
    }

    $scope.hapusOrang = function (x) {
        $scope.grup[$scope.grupTerpilih].splice(x, 1);
        $scope.saveChanges();
    }

    $scope.buatDokumen = function (i) {
        // alert("buat dokumen");
        buatDoc($scope.grup, i);
    }

    $scope.tambah = function (x, y, z) {
        if (x.length > 0) {
            $scope.data.push({
                no: $scope.data.length + 1,
                nama: x,
                alamat: (y || "Tempat"),
                keterangan: (z || "-")
            });
            $scope.kolomNama = "";
            $scope.kolomAlamat = "";
            saveToStorage($scope.data);
            // $scope.kolomKeterangan = "";
            document.getElementById("kolomNama").focus();
        }
    }
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
            loc = `https://ihsan-hasanudin.github.io/label/template/template.docx`;
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