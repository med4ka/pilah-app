export interface HelpAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  questions: HelpAnswer[];
}

// Static Help Center content. The `icon` field maps to a Lucide component in
// HelpCenter.tsx (ICON_MAP). This data is defined by the PRD, do not change.
export const helpCategories: HelpCategory[] = [
  {
    id: "pickup", title: "Pickup & Penjemputan", icon: "Truck",
    questions: [
      { id: "p1", question: "Kenapa orderan saya belum diambil kolektor?", answer: "Kolektor di sekitar lokasimu belum sempat lihat/ambil orderannya. Coba cek lagi beberapa saat, biasanya orderan diambil dalam hitungan menit kalau ada kolektor aktif di area kamu." },
      { id: "p2", question: "Gimana sih alur penjemputan dari awal sampai selesai?", answer: "4 tahap: kamu bikin orderan (Menunggu) → kolektor ambil (Diambil) → kolektor timbang & foto di lokasi (Verifikasi) → kamu cek hasil timbangan dan konfirmasi (Selesai). Karma baru masuk setelah kamu konfirmasi di tahap terakhir." },
      { id: "p3", question: "Saya sudah konfirmasi tapi karma belum nambah?", answer: "Coba refresh/buka ulang halaman utama — karma kamu sinkron otomatis lewat profil. Kalau setelah refresh masih belum nambah, kemungkinan konfirmasinya belum benar-benar terkirim, coba cek lagi status orderan di riwayat." },
    ],
  },
  {
    id: "karma", title: "Karma & Poin", icon: "Gem",
    questions: [
      { id: "k1", question: "Karma dihitung dari apa?", answer: "Dari berat sampah yang kamu setor (plastik, kardus, kaca) saat kolektor menimbang. Semakin banyak & terpilah rapi, semakin besar karma yang kamu dapat." },
      { id: "k2", question: "Kapan karma bisa ditukar/ditarik?", answer: "Karma kamu bisa langsung ditukar jadi saldo lewat menu Tukar Cuan di halaman utama — tinggal pilih metode pembayaran (GoPay, DANA, bank, atau apa pun yang kamu tambahkan sendiri), lalu tarik semua karma sekaligus. 1 karma setara Rp50." },
    ],
  },
  {
    id: "akun", title: "Akun & Keamanan", icon: "ShieldCheck",
    questions: [
      { id: "a1", question: "Gimana cara ubah data profil?", answer: "Buka tab Profil → Edit Data Diri. Perubahan tersimpan otomatis begitu kamu klik Simpan." },
      { id: "a2", question: "Data login saya aman nggak?", answer: "Aman — sesi login kamu disimpan lewat cookie khusus yang nggak bisa diakses/dicuri lewat script di browser (bukan disimpan sembarangan di penyimpanan lokal seperti kebanyakan web biasa)." },
    ],
  },
  {
    id: "bukti", title: "Bukti Transaksi", icon: "FileCheck",
    questions: [
      { id: "b1", question: "Badge \"Terverifikasi\" di riwayat itu apa?", answer: "Itu tanda kalau bukti transaksi pickup kamu sudah tersimpan permanen di jaringan terdesentralisasi (IPFS) — jadi ada catatan yang nggak bisa diubah-ubah sebagai bukti transaksi beneran terjadi. Klik badge-nya buat lihat detail." },
    ],
  },
  {
    id: "mitra", title: "Untuk Mitra/Kolektor", icon: "Recycle",
    questions: [
      { id: "m1", question: "Gimana cara ambil orderan?", answer: "Buka tab radar di halaman Mitra, pilih orderan yang muncul, tekan \"Ambil Tugas Ini\". Orderan yang sudah diambil kolektor lain otomatis hilang dari daftar kamu." },
      { id: "m2", question: "Kenapa orderan yang mau saya ambil tiba-tiba hilang?", answer: "Kemungkinan kolektor lain lebih cepat mengambilnya duluan. Ini normal di sistem rebutan-cepat seperti Pilah — coba cek orderan lain yang masih tersedia." },
    ],
  },
];