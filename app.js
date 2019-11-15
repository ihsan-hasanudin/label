function saveToStorage(x){
    localStorage.setItem("data", JSON.stringify(x));
}

function loadFromStorage(){
    var d = {};
    try{
        d = JSON.parse(localStorage.getItem("data"));
    }catch(e){
        d = {};
    }
    return  d;
}

var app = angular.module('labelKu', []);
app.controller('labelCtl', function ($scope, $http, $timeout) {
    $scope.grupTerpilih = "";
    $scope.grup = loadFromStorage() || {};

    $scope.saveChanges = function(){
        saveToStorage($scope.grup);
    }

    $scope.tambahGrup = function(x){
        if(x.length>0){
        $scope.grup[x] = [];
        $scope.tambahGrup_text = "";
        $scope.saveChanges();
        }else{
            alert("Nama grup jangan kosong")
        }
    }

    $scope.hapusGrup = function(x){
        delete $scope.grup[x];
        $scope.saveChanges();
        $scope.grupTerpilih = "";
    }

    $scope.pilihGrup = function(x){
        $scope.grupTerpilih = x;
        document.getElementById("kolomNama").focus();
    }

    $scope.tambahOrang = function(){
        var nama = $scope.t_nama;
        var alamat = $scope.t_alamat || "Tempat";
        if(nama.length>0 && alamat.length>0){
            $scope.grup[$scope.grupTerpilih].push({
                nama, alamat
            })
        }
        $scope.t_nama = "";
        $scope.t_alamat = "";
        document.getElementById("kolomNama").focus();
        $scope.saveChanges();
    }

    $scope.buatDokumen = function(){
        // alert("buat dokumen");
        buatDoc();
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

function buatDoc(){
    function loadFile(url,callback){
        PizZipUtils.getBinaryContent(url,callback);
    }

    function generate() {
        loadFile("./tag-example.docx",function(error,content){
            if (error) { throw error };
            var zip = new PizZip(content);
            var doc=new window.docxtemplater().loadZip(zip)
            doc.setData({
                first_name: 'John',
                last_name: 'Doe',
                phone: '0652455478',
                description: 'New Website'
            });
            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render()
            }
            catch (error) {
                var e = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    properties: error.properties,
                }
                console.log(JSON.stringify({error: e}));
                // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                throw error;
            }
            var out=doc.getZip().generate({
                type:"blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }) //Output the document using Data-URI
            saveAs(out,"output.docx")
        })
    }
    generate();
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