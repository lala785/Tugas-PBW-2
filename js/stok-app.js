// Data stok dummy 
const stokData = [
    {
        kode: "EKMA4116",
        judul: "Pengantar Manajemen",
        kategori: "MK Wajib",
        upbjj: "Jakarta",
        lokasiRak: "R1-A3",
        harga: 65000,
        qty: 28,
        safety: 20,
        catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
    },
    {
        kode: "EKMA4115",
        judul: "Pengantar Akuntansi",
        kategori: "MK Wajib",
        upbjj: "Jakarta",
        lokasiRak: "R1-A4",
        harga: 60000,
        qty: 7,
        safety: 15,
        catatanHTML: "<strong>Cover baru</strong>"
    },
    {
        kode: "BIOL4201",
        judul: "Biologi Umum (Praktikum)",
        kategori: "Praktikum",
        upbjj: "Surabaya",
        lokasiRak: "R3-B2",
        harga: 80000,
        qty: 12,
        safety: 10,
        catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
    },
    {
        kode: "FISIP4001",
        judul: "Dasar-Dasar Sosiologi",
        kategori: "MK Pilihan",
        upbjj: "Makassar",
        lokasiRak: "R2-C1",
        harga: 55000,
        qty: 2,
        safety: 8,
        catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
    },
    {
        kode: "MATH4101",
        judul: "Kalkulus Dasar",
        kategori: "MK Wajib",
        upbjj: "Padang",
        lokasiRak: "R2-B1",
        harga: 70000,
        qty: 0,
        safety: 10,
        catatanHTML: "Habis, segera pesan"
    },
    {
        kode: "COMP4201",
        judul: "Pemrograman Web",
        kategori: "MK Pilihan",
        upbjj: "Denpasar",
        lokasiRak: "R4-A2",
        harga: 90000,
        qty: 5,
        safety: 5,
        catatanHTML: "Stok pas"
    }
];

const upbjjList = ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"];
const kategoriList = ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"];

// ==================== APLIKASI VUE.JS ====================
new Vue({
    el: '#appStok',
    data: {
        stok: [],
        upbjjList: upbjjList,
        kategoriList: kategoriList,
        filterUt: '',
        filterKategori: '',
        filterReorderOnly: false,
        sortBy: 'judul',
        sortOrder: 'asc',
        showAddModal: false,
        showEditModal: false,
        formData: {
            kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: ''
        },
        editIndex: null,
        errors: {}
    },
    computed: {
        availableKategoriList: function() {
            if (!this.filterUt) return [];
            const kats = new Set();
            this.stok.forEach(item => {
                if (item.upbjj === this.filterUt) {
                    kats.add(item.kategori);
                }
            });
            return Array.from(kats).sort();
        },
        filteredStok: function() {
            let result = this.stok;
            if (this.filterUt) {
                result = result.filter(item => item.upbjj === this.filterUt);
            }
            if (this.filterUt && this.filterKategori) {
                result = result.filter(item => item.kategori === this.filterKategori);
            }
            if (this.filterReorderOnly) {
                result = result.filter(item => item.qty < item.safety || item.qty === 0);
            }
            return result;
        },
        sortedStok: function() {
            let items = [...this.filteredStok];
            const order = this.sortOrder === 'asc' ? 1 : -1;
            if (this.sortBy === 'judul') {
                items.sort((a,b) => order * a.judul.localeCompare(b.judul));
            } else if (this.sortBy === 'qty') {
                items.sort((a,b) => order * (a.qty - b.qty));
            } else if (this.sortBy === 'harga') {
                items.sort((a,b) => order * (a.harga - b.harga));
            }
            return items;
        },
        modalTitle: function() {
            return this.showEditModal ? 'Edit Bahan Ajar' : 'Tambah Bahan Ajar Baru';
        },
        isEditMode: function() {
            return this.showEditModal;
        }
    },
    methods: {
        formatHarga: function(value) {
            if (!value && value !== 0) return '0';
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
        statusClass: function(item) {
            if (item.qty === 0) return 'status-kosong';
            if (item.qty < item.safety) return 'status-menipis';
            return 'status-aman';
        },
        statusText: function(item) {
            if (item.qty === 0) return 'Kosong';
            if (item.qty < item.safety) return 'Menipis';
            return 'Aman';
        },
        resetFilters: function() {
            this.filterUt = '';
            this.filterKategori = '';
            this.filterReorderOnly = false;
            this.sortBy = 'judul';
            this.sortOrder = 'asc';
        },
        editItem: function(item) {
            this.formData = { ...item };
            this.editIndex = this.stok.findIndex(i => i.kode === item.kode && i.upbjj === item.upbjj);
            this.showEditModal = true;
            this.errors = {};
        },
        closeModal: function() {
            this.showAddModal = false;
            this.showEditModal = false;
            this.formData = this.getEmptyForm();
            this.editIndex = null;
            this.errors = {};
        },
        getEmptyForm: function() {
            return {
                kode: '', judul: '', kategori: this.kategoriList[0] || '', upbjj: this.upbjjList[0] || '',
                lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: ''
            };
        },
        validateForm: function() {
            let err = {};
            if (!this.formData.kode.trim()) err.kode = 'Kode MK wajib diisi';
            if (!this.formData.judul.trim()) err.judul = 'Nama MK wajib diisi';
            if (this.formData.harga <= 0) err.harga = 'Harga harus > 0';
            if (this.formData.qty < 0) err.qty = 'Stok tidak boleh negatif';
            if (this.formData.safety < 0) err.safety = 'Safety stok tidak boleh negatif';
            this.errors = err;
            return Object.keys(err).length === 0;
        },
        saveItem: function() {
            if (!this.validateForm()) return;
            if (this.showEditModal) {
                Vue.set(this.stok, this.editIndex, { ...this.formData });
            } else {
                let exists = this.stok.some(item => item.kode === this.formData.kode && item.upbjj === this.formData.upbjj);
                if (exists) {
                    this.errors.kode = 'Kode MK sudah ada untuk UT ini';
                    return;
                }
                this.stok.push({ ...this.formData });
            }
            this.closeModal();
        },
    },
    watch: {
        filterUt: function(newVal, oldVal) {
            this.filterKategori = '';
        },
        stok: {
            handler: function(newStok) {
                console.log('Stok berubah, jumlah item:', newStok.length);
            },
            deep: true
        }
    },
    mounted: function() {
        this.stok = JSON.parse(JSON.stringify(stokData));
        this.formData = this.getEmptyForm();
        console.log('Data stok dimuat:', this.stok.length, 'item');
    }
});
