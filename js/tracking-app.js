// Data tracking dummy 
const paketList = [
    // Data daftar paket bahan ajar 
    { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
    { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 }
];
// Data daftar ekspedisi pengiriman 
const pengirimanList = [
    { kode: "REG", nama: "JNE Regular (3-5 hari)" },
    { kode: "EXP", nama: "JNE Express (1-2 hari)" }
];

// Data awal Delivery Order (DO)
let doListData = [
    {
        nomorDO: "DO2025-001",
        nim: "123456789",
        nama: "Rina Wulandari",
        ekspedisi: "EXP",
        paketKode: "PAKET-UT-001",
        tanggalKirim: "2025-08-25",
        totalHarga: 120000,
        perjalanan: [
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
            { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
        ]
    }
];

// Fungsi helper untuk generate nomor DO terbaru
function generateNextDO() {
    let tahun = new Date().getFullYear();
    let maxNomor = 0;
    doListData.forEach(doItem => {
        let match = doItem.nomorDO.match(/DO\d{4}-(\d+)/);
        if (match) {
            let num = parseInt(match[1]);
            if (num > maxNomor) maxNomor = num;
        }
    });
    let nextSeq = (maxNomor + 1).toString().padStart(3, '0');
    return `DO${tahun}-${nextSeq}`;
}

// ==================== APLIKASI VUE.JS ====================
new Vue({
    el: '#appTracking', // elemen html untuk memasang vue

    // data akan digunakan dan dirender
    data: {
        doList: [],           
        paketList: paketList,
        pengirimanList: pengirimanList,
        newDO: {
            nim: '',
            nama: '',
            ekspedisi: 'REG',
            paketKode: '',
            tanggalKirim: '',
            totalHarga: 0
        },
        newDONomor: '',
        selectedPaketDetail: null,
        showDetailModal: false,
        selectedDO: null,
        errors: {}
    },
    computed: {
        computedTotalHarga: function() {
            if (!this.newDO.paketKode) return 0;
            let p = this.paketList.find(pak => pak.kode === this.newDO.paketKode);
            return p ? p.harga : 0;
        }
    },
    methods: {
        generateDONumber: function() {
            return generateNextDO();
        },
        updatePaketDetail: function() {
            if (this.newDO.paketKode) {
                this.selectedPaketDetail = this.paketList.find(p => p.kode === this.newDO.paketKode);
                this.newDO.totalHarga = this.selectedPaketDetail ? this.selectedPaketDetail.harga : 0;
            } else {
                this.selectedPaketDetail = null;
                this.newDO.totalHarga = 0;
            }
        },
        setToday: function() {
            const today = new Date().toISOString().slice(0,10);
            this.newDO.tanggalKirim = today;
        },
        resetForm: function() {
            this.newDO = {
                nim: '', nama: '', ekspedisi: 'REG', paketKode: '', tanggalKirim: '', totalHarga: 0
            };
            this.selectedPaketDetail = null;
            this.errors = {};
            this.updateDONumber();
        },
        updateDONumber: function() {
            this.newDONomor = this.generateDONumber();
        },
        validateDO: function() {
            let err = {};
            if (!this.newDO.nim.trim()) err.nim = 'NIM wajib diisi';
            if (!this.newDO.nama.trim()) err.nama = 'Nama wajib diisi';
            if (!this.newDO.paketKode) err.paketKode = 'Pilih paket bahan ajar';
            if (!this.newDO.tanggalKirim) err.tanggalKirim = 'Tanggal kirim wajib diisi';
            this.errors = err;
            return Object.keys(err).length === 0;
        },
        addDeliveryOrder: function() {
            if (!this.validateDO()) return;
            
            const newDOItem = {
                nomorDO: this.newDONomor,
                nim: this.newDO.nim,
                nama: this.newDO.nama,
                ekspedisi: this.newDO.ekspedisi,
                paketKode: this.newDO.paketKode,
                tanggalKirim: this.newDO.tanggalKirim,
                totalHarga: this.computedTotalHarga,
                perjalanan: [
                    { waktu: new Date().toLocaleString(), keterangan: "Pemesanan dibuat, menunggu proses" }
                ]
            };
            
            doListData.push(newDOItem);
            
            this.doList = [...doListData];
            
            this.resetForm();
            
            console.log('DO berhasil ditambahkan:', newDOItem);
        },
        getEkspedisiNama: function(kode) {
            let e = this.pengirimanList.find(p => p.kode === kode);
            return e ? e.nama : kode;
        },
        getLastPerjalanan: function(doItem) {
            if (doItem.perjalanan && doItem.perjalanan.length > 0) {
                return doItem.perjalanan[doItem.perjalanan.length-1].keterangan;
            }
            return 'Belum ada info';
        },
        showDetail: function(doItem) {
            console.log('Detail clicked:', doItem);
            this.selectedDO = doItem;
            this.showDetailModal = true;
        },
        closeModal: function() {
            this.showDetailModal = false;
            this.selectedDO = null;
        },
        getIcon: function(idx, total) {
            if (!total) return '📋';
            if (idx === 0) return '🚚';
            if (idx === total - 1) return '📦';
            return '🔄';
        },
        getIconClass: function(idx, total) {
            if (!total) return '';
            if (idx === 0) return 'icon-start';
            if (idx === total - 1) return 'icon-end';
            return 'icon-mid';
        }
    },
    watch: {
        'newDO.paketKode': function(newVal) {
            this.updatePaketDetail();
        }
    },
    mounted: function() {
        this.doList = [...doListData];
        this.updateDONumber();
        if (typeof localStorage !== 'undefined' && localStorage.getItem('isLoggedIn') === 'false') {
            window.location.href = 'index.html';
        }
    }
});
