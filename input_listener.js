window.onload = function () {
    $(`body`).on('keyup', `input[kapital-oto]`, function () {
        var posInit = $(this).prop("selectionStart");
        var posInitEnd = $(this).prop("selectionEnd");
        if (posInit != posInitEnd) return;

        var val = $(this).val();
        var patNama =
            /^(((Prof\.|Dr\.|H\.|Hj\.|Drs\.|Dra\.|Ir.)\s)+)*(([A-z']+)(\s[A-z']+)*)((,\s*([A-z\.]+))+)*$/;
        var namaValid = patNama.test(val);
        console.log(patNama.exec(val))
        if (namaValid) {
            var semuaNama = patNama.exec(val);
            var gelarDepan = semuaNama[1] || "";
            var namaLengkap = semuaNama[4] || "";
            var gelar = semuaNama[7] || "";
            var akhir = {
                semuaNama,
                gelarDepan,
                namaLengkap,
                gelar
            };
            console.log(akhir)
            $(this).val(gelarDepan + namaLengkap.split(" ").map(x => x.substr(0, 1).toUpperCase() +
                x.substr(1).toLowerCase()).join(" ") + gelar);
        }

        function apaValid(x) {
            return x.match(patNama);
        }

        var valid = apaValid($(this).val().trim()) != null
        // $(this).next().text((valid) ? "" : "Nama gak bener :(");
        // $(this).next().addClass((valid) ? "validation-valid" : "validation-error");
        // $(this).next().removeClass((!valid) ? "validation-valid" : "validation-error");
        $(this)[0].setSelectionRange(posInit, posInit);
    });
}