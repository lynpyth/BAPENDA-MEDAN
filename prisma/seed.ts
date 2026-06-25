import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "Ahmad", "Siti", "Budi", "Dewi", "Hendra", "Sari", "Rian", "Mega", "Joko", "Fitri",
  "Rudi", "Anisa", "Dedi", "Indah", "Toni", "Yuni", "Agus", "Putri", "Aditya", "Wulan",
  "Roni", "Diana", "Eko", "Maya", "Bambang", "Rina", "Heri", "Lia", "Aris", "Nita",
  "Fajar", "Ayu", "Rizki", "Dian", "Wahyu", "Nurul", "Irwan", "Ratna", "Doni", "Lena"
];

const LAST_NAMES = [
  "Santoso", "Wijaya", "Rahmawati", "Siregar", "Nasution", "Lubis", "Harahap", "Pratama", "Sari", "Hidayat",
  "Kusuma", "Utami", "Saputra", "Wulandari", "Setiawan", "Lestari", "Gunawan", "Permata", "Budiman", "Anggraini",
  "Nugroho", "Fitriani", "Ramadhan", "Kartika", "Purwanto", "Susanti", "Wibowo", "Astuti", "Haryanto", "Mulyani"
];

const UNIVERSITIES = [
  "Universitas Sumatera Utara",
  "Universitas Negeri Medan",
  "Universitas HKBP Nommensen",
  "Universitas Islam Negeri Sumatera Utara",
  "Politeknik Negeri Medan",
  "Universitas Medan Area",
  "Universitas Prima Indonesia"
];

const MEDAN_KECAMATAN = [
  { name: "Medan Baru", kelurahan: ["Padang Bulan Selayang I", "Darussalam", "Babura", "Merdeka", "Titi Rantai"] },
  { name: "Medan Petisah", kelurahan: ["Petisah Tengah", "Sekip", "Sei Putih Timur I", "Sei Putih Barat", "Silalas"] },
  { name: "Medan Sunggal", kelurahan: ["Sunggal", "Tanjung Rejo", "Lalang", "Babura Sunggal", "Simpang Tanjung"] },
  { name: "Medan Helvetia", kelurahan: ["Helvetia Tengah", "Dwikora", "Tanjung Gusta", "Cinta Damai"] },
  { name: "Medan Johor", kelurahan: ["Pangkalan Mansyur", "Gedung Johor", "Kedai Durian", "Kwala Bekala"] },
  { name: "Medan Area", kelurahan: ["Kotamatsum I", "Kotamatsum II", "Tegal Sari I", "Tegal Sari II", "Pandau Hulu II"] },
  { name: "Medan Polonia", kelurahan: ["Polonia", "Sari Rejo", "Anggrung", "Madras Hulu"] },
  { name: "Medan Kota", kelurahan: ["Sungai Rengas", "Mesjid", "Kuta Selatan", "Hamdan"] },
  { name: "Medan Timur", kelurahan: ["Gaharu", "Glugur Darat I", "Durian", "Sidodadi"] },
  { name: "Medan Amplas", kelurahan: ["Amplas", "Timbang Deli", "Siti Rejo III", "Bangun Mulia"] }
];

const STREETS = [
  "Jl. Diponegoro", "Jl. Jenderal Sudirman", "Jl. Letjen Suprapto", "Jl. Kapten Maulana Lubis",
  "Jl. S. Parman", "Jl. Pemuda", "Jl. Balai Kota", "Jl. Raden Saleh", "Jl. Imam Bonjol",
  "Jl. Gatot Subroto", "Jl. Iskandar Muda", "Jl. Ring Road", "Jl. Halat", "Jl. SM Raja",
  "Jl. T. Amir Hamzah", "Jl. Dr. Mansyur", "Jl. Karya Wisata", "Jl. Brigjen Katamso",
  "Jl. Sisingamangaraja", "Jl. Letda Sujono"
];

const TAX_CATEGORIES = [
  "PKB", "BBN-KB", "PBB-KB", "P. ROKOK", "P. REKLAME", "PAT", "PBB-P2",
  "BPHTB", "PAB", "PBJT Jasa Perhotelan", "PBJT Makanan dan/atau Minuman",
  "PBJT Kesenian dan Hiburan", "PBJT Tenaga Listrik", "PBJT Jasa Parkir",
  "Pajak Sarang Burung Walet"
];

const TAX_NAMES: Record<string, string[]> = {
  "PKB": ["Motor Honda Vario", "Mobil Toyota Avanza", "Mobil Daihatsu Xenia", "Motor Yamaha NMAX"],
  "BBN-KB": ["BBN Kendaraan Baru", "Balik Nama Mobil Bekas", "BBN Motor Bekas"],
  "PBB-KB": ["Pajak BBM Industri", "Pajak Bahan Bakar Kendaraan"],
  "P. ROKOK": ["Pajak Rokok Retail", "Pajak Rokok Grosir", "Pajak Rokok Sektor Komersial"],
  "P. REKLAME": ["Reklame Billboard Jalan Utama", "Spanduk Komersial", "Videotron LED", "Neon Box Toko"],
  "PAT": ["Air Tanah Sumur Industri", "Air Tanah Sumur Rumahan", "Air Tanah Hotel"],
  "PBB-P2": ["Rumah Tinggal", "Ruko", "Gedung Kantor", "Villa", "Rumah Kos"],
  "BPHTB": ["Kavling Perumahan", "Tanah Sawah", "Tanah Kosong", "Unit Apartemen"],
  "PAB": ["Alat Berat Excavator", "Alat Berat Bulldozer", "Crane Konstruksi"],
  "PBJT Jasa Perhotelan": ["Hotel Bintang 3", "Hotel Melati", "Guest House", "Penginapan"],
  "PBJT Makanan dan/atau Minuman": ["Restoran", "Kafe", "Warung Makan", "Food Court", "Katering"],
  "PBJT Kesenian dan Hiburan": ["Bioskop", "Karaoke", "Kolam Renang", "Wahana Hiburan"],
  "PBJT Tenaga Listrik": ["Industri Manufaktur", "Mall / Pusat Perbelanjaan", "Pabrik"],
  "PBJT Jasa Parkir": ["Gedung Parkir Bertingkat", "Area Parkir Mall", "Parkir Hotel"],
  "Pajak Sarang Burung Walet": ["Peternakan Sarang Walet", "Usaha Pengambilan Walet", "Gedung Sarang Walet"]
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generateNIK(index: number): string { return "127100000000" + (index + 1000).toString().padStart(4, "0"); }
function generateNOP(i: number, kecIndex: number, kelIndex: number): string {
  return `12.72.${(kecIndex + 1).toString().padStart(2, "0")}.${(kelIndex + 1).toString().padStart(3, "0")}.${rand(1, 99).toString().padStart(3, "0")}.${i.toString().padStart(4, "0")}.0`;
}
function dateOffset(days: number, base = new Date("2026-01-01")): Date {
  const d = new Date(base); d.setDate(d.getDate() + days); return d;
}
async function main() {
  console.log("🌱 Cleaning database...");
  await prisma.taxAssessment.deleteMany();
  await prisma.objectTaxLocation.deleteMany();
  await prisma.landValueZone.deleteMany();
  await prisma.propertyMarket.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.sppt.deleteMany();
  await prisma.taxSubmission.deleteMany();
  await prisma.taxObject.deleteMany();
  await prisma.researchRequest.deleteMany();
  await prisma.pPIDRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.news.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Generating credentials...");
  const adminPw = await bcrypt.hash("admin123", 12);
  const officerPw = await bcrypt.hash("officer123", 12);
  const userPw = await bcrypt.hash("user123", 12);
  const mhsPw = await bcrypt.hash("mahasiswa123", 12);
  const devPw = await bcrypt.hash("dev123", 12);

  const superAdmin = await prisma.user.create({
    data: {
      id: "superadmin-id",
      name: "Super Administrator BAPENDA",
      email: "superadmin@bapenda.medan.go.id",
      password: adminPw,
      role: "ADMIN",
      nik: "1271000000000010",
      phone: "061-7365418",
      address: "Jl. Abdul Haris Nasution No.32, Medan, Sumatera Utara",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80",
      isActive: true
    }
  });

  const adminAgha = await prisma.user.create({
    data: {
      id: "admin-agha-id",
      name: "Dr. M. Agha Novrian, S.STP, M.Si",
      email: "agha.novrian@bapenda.medan.go.id",
      password: adminPw,
      role: "ADMIN",
      nik: "1271000000000011",
      phone: "081100000001",
      address: "Badan Pendapatan Daerah Kota Medan (Kepala Bapenda Kota Medan)",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80",
      isActive: true
    }
  });

  const adminDewi = await prisma.user.create({
    data: {
      id: "admin-dewi-id",
      name: "Dewi Sartika",
      email: "dewi.sartika@bapenda.medan.go.id",
      password: adminPw,
      role: "ADMIN",
      nik: "1271000000000012",
      phone: "081100000002",
      address: "Badan Pendapatan Daerah Kota Medan (Kepala Bidang Pendataan dan Penetapan)",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80",
      isActive: true
    }
  });

  const adminRahmad = await prisma.user.create({
    data: {
      id: "admin-rahmad-id",
      name: "Rahmad Syahputra",
      email: "rahmad.syahputra@bapenda.medan.go.id",
      password: adminPw,
      role: "ADMIN",
      nik: "1271000000000013",
      phone: "081100000003",
      address: "Badan Pendapatan Daerah Kota Medan (Kepala Bidang Penagihan dan Pengawasan)",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80",
      isActive: true
    }
  });

  const adminFitri = await prisma.user.create({
    data: {
      id: "admin-fitri-id",
      name: "Fitri Handayani",
      email: "fitri.handayani@bapenda.medan.go.id",
      password: adminPw,
      role: "ADMIN",
      nik: "1271000000000014",
      phone: "081100000004",
      address: "Badan Pendapatan Daerah Kota Medan (Kepala Bidang Teknologi Informasi)",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80",
      isActive: true
    }
  });

  const adminIndra = await prisma.user.create({
    data: {
      id: "admin-indra-id",
      name: "Indra Gunawan",
      email: "indra.gunawan@bapenda.medan.go.id",
      password: adminPw,
      role: "ADMIN",
      nik: "1271000000000015",
      phone: "081100000005",
      address: "Badan Pendapatan Daerah Kota Medan (Administrator Sistem)",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80",
      isActive: true
    }
  });

  const admin = superAdmin;
  const admin2 = adminAgha;
  const officer = await prisma.user.create({ data: { id: "officer-id", name: "Pratama Putra (Petugas)", email: "petugas@bapendamedan.go.id", password: officerPw, role: "OFFICER", nik: "1271000000000002", phone: "081234567001", address: "Jl. Kapten Maulana Lubis No. 2, Medan Petisah, Kota Medan", isActive: true } });
  const officer2 = await prisma.user.create({ data: { id: "officer-id-2", name: "Dian Pertiwi (Petugas Lapangan)", email: "petugas2@bapendamedan.go.id", password: officerPw, role: "OFFICER", nik: "1271000000000004", phone: "081298765432", address: "Jl. Imam Bonjol No. 10, Medan Baru, Kota Medan", isActive: true } });
  const officer3 = await prisma.user.create({ data: { id: "officer-id-3", name: "Reza Firmansyah (Petugas Verifikasi)", email: "petugas3@bapendamedan.go.id", password: officerPw, role: "OFFICER", nik: "1271000000000005", phone: "082112345678", address: "Jl. Diponegoro No. 15, Medan Baru, Kota Medan", isActive: true } });
  await prisma.user.create({ data: { id: "dev-id", name: "Developer System", email: "dev@bapendamedan.go.id", password: devPw, role: "DEVELOPER", nik: "1271000000000006", phone: "08100000001", address: "Jl. Ring Road No. 99, Medan Sunggal", isActive: true } });

  const mahasiswaList: any[] = [];
  const mahasiswaData = [
    { id: "mahasiswa-id", name: "Andi Wijaya", email: "mhs@usu.ac.id", university: UNIVERSITIES[0] },
    { id: "mahasiswa-id-2", name: "Sari Dewi Lestari", email: "mhs2@unimed.ac.id", university: UNIVERSITIES[1] },
    { id: "mahasiswa-id-3", name: "Rizki Pratama", email: "mhs3@uinsu.ac.id", university: UNIVERSITIES[3] },
    { id: "mahasiswa-id-4", name: "Nurul Fitriani", email: "mhs4@polmed.ac.id", university: UNIVERSITIES[4] },
    { id: "mahasiswa-id-5", name: "Fajar Ramadhan", email: "mhs5@uma.ac.id", university: UNIVERSITIES[5] },
  ];
  for (let i = 0; i < mahasiswaData.length; i++) {
    const m = mahasiswaData[i];
    const u = await prisma.user.create({ data: { id: m.id, name: m.name, email: m.email, password: mhsPw, role: "MAHASISWA", nik: generateNIK(9000 + i), phone: `08987654${3000 + i}`, institution: m.university, address: `Jl. Universitas No. ${i + 1}, Medan Baru, Kota Medan`, isActive: true } });
    mahasiswaList.push(u);
  }

  console.log("🌱 Generating 100 Wajib Pajak...");
  const userIds: string[] = [];
  const defaultWps = [
    { id: "wp-id-1", name: "Budi Santoso", email: "wp@mail.com", nik: "1271000000000099" },
    { id: "wp-id-2", name: "Hendra Wijaya", email: "wp2@mail.com", nik: "1271000000000098" },
    { id: "wp-id-3", name: "Siti Rahmawati", email: "wp3@mail.com", nik: "1271000000000097" },
  ];
  for (let i = 0; i < 100; i++) {
    const dw = defaultWps[i];
    const district = pick(MEDAN_KECAMATAN);
    const u = await prisma.user.create({ data: { id: dw?.id ?? `wp-user-${i}`, name: dw?.name ?? `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, email: dw?.email ?? `wp${i + 1}@mail.com`, password: userPw, role: "USER", nik: dw?.nik ?? generateNIK(i), phone: `0812${rand(1000000, 9999999)}`, address: `${pick(STREETS)} No. ${rand(1, 150)}, Kel. ${pick(district.kelurahan)}, Kec. ${district.name}, Kota Medan`, isActive: i < 90 } });
    userIds.push(u.id);
  }

  console.log("🌱 Generating 250 Objek Pajak...");
  const taxObjects: any[] = [];
  const pinnedObjects = [
    { id: "obj-pbb-1", nop: "12.72.01.001.001.0001", name: "Kantor Pusat CV Maju Jaya", address: "Jl. Kapten Maulana Lubis No. 1, Medan Petisah", type: "PBB-P2", luasTanah: 1200, luasBangun: 800, njop: 4500000000, ownerId: "wp-id-1" },
    { id: "obj-pbb-2", nop: "12.72.01.001.002.0002", name: "Rumah Tinggal Budi Santoso", address: "Jl. Diponegoro No. 5, Medan Petisah", type: "PBB-P2", luasTanah: 300, luasBangun: 150, njop: 950000000, ownerId: "wp-id-1" },
    { id: "obj-pbb-3", nop: "12.72.01.001.002.0003", name: "Ruko Hendra Wijaya", address: "Jl. Iskandar Muda No. 22, Medan Baru", type: "PBB-P2", luasTanah: 200, luasBangun: 400, njop: 2800000000, ownerId: "wp-id-2" },
    { id: "obj-bphtb-1", nop: "12.72.01.001.003.0004", name: "Apartemen Center Point Unit 12B", address: "Jl. Jawa No. 8, Medan Timur", type: "BPHTB", luasTanah: 0, luasBangun: 72, njop: 1200000000, ownerId: "wp-id-2" },
    { id: "obj-hotel-1", nop: "12.72.02.001.001.0005", name: "Hotel Grand Aston City Hall", address: "Jl. Balai Kota No. 1, Medan Baru", type: "PBJT Jasa Perhotelan", luasTanah: 5000, luasBangun: 12000, njop: 85000000000, ownerId: "wp-id-2" },
    { id: "obj-resto-1", nop: "12.72.02.002.002.0006", name: "Restoran Lembur Kuring Medan", address: "Jl. T. Amir Hamzah No. 85, Medan Helvetia", type: "PBJT Makanan dan/atau Minuman", luasTanah: 1500, luasBangun: 600, njop: 4800000000, ownerId: "wp-id-3" },
    { id: "obj-parkir-1", nop: "12.72.02.003.001.0007", name: "Gedung Parkir Sun Plaza", address: "Jl. KH. Zainul Arifin No. 7, Medan Petisah", type: "PBJT Jasa Parkir", luasTanah: 3000, luasBangun: 9000, njop: 35000000000, ownerId: "wp-id-3" },
    { id: "obj-karaoke-1", nop: "12.72.03.001.001.0008", name: "Inul Vista Family Karaoke Medan", address: "Jl. Ringroad No. 45, Medan Sunggal", type: "PBJT Kesenian dan Hiburan", luasTanah: 2000, luasBangun: 3500, njop: 15000000000, ownerId: "wp-id-1" },
    { id: "obj-pkb-1", nop: "12.72.04.001.001.0009", name: "Motor Honda PCX 160 Budi Santoso", address: "BBNKB - SAMSAT Medan Utara", type: "PKB", luasTanah: 0, luasBangun: 0, njop: 32000000, ownerId: "wp-id-1" },
    { id: "obj-reklame-1", nop: "12.72.04.002.001.0010", name: "Videotron LED Sudirman Plaza", address: "Jl. Jenderal Sudirman No. 1, Medan Baru", type: "P. REKLAME", luasTanah: 0, luasBangun: 0, njop: 250000000, ownerId: "wp-id-2" },
    { id: "obj-walet-1", nop: "12.72.04.003.001.0011", name: "Gedung Walet Budi Santoso", address: "Jl. Letda Sujono No. 44, Medan Tembung", type: "Pajak Sarang Burung Walet", luasTanah: 400, luasBangun: 300, njop: 600000000, ownerId: "wp-id-1" },
  ];

  for (const sObj of pinnedObjects) {
    const lat = 3.59 + (Math.random() - 0.5) * 0.06, lng = 98.67 + (Math.random() - 0.5) * 0.06, offset = 0.00015;
    const o = await prisma.taxObject.create({ data: { id: sObj.id, nop: sObj.nop, name: sObj.name, address: sObj.address, lat, lng, status: "VERIFIED", type: sObj.type, luasTanah: sObj.luasTanah, luasBangun: sObj.luasBangun, njop: sObj.njop, njoptkp: 12000000, ownerId: sObj.ownerId } });
    await prisma.objectTaxLocation.create({ data: { objectTaxId: o.id, latitude: lat, longitude: lng, polygonData: JSON.stringify([[lat - offset, lng - offset], [lat + offset, lng - offset], [lat + offset, lng + offset], [lat - offset, lng + offset], [lat - offset, lng - offset]]) } });
    taxObjects.push(o);
  }

  for (let i = pinnedObjects.length; i < 250; i++) {
    const kecIndex = i % MEDAN_KECAMATAN.length;
    const district = MEDAN_KECAMATAN[kecIndex];
    const kelIndex = rand(0, district.kelurahan.length - 1);
    const type = pick(TAX_CATEGORIES);
    const isProperty = ["PBB-P2", "BPHTB", "PBJT Jasa Perhotelan", "PBJT Makanan dan/atau Minuman", "PBJT Kesenian dan Hiburan", "PBJT Jasa Parkir", "P. REKLAME"].includes(type);
    const luasTanah = isProperty ? (type === "BPHTB" ? 0 : rand(80, 2000)) : 0;
    const luasBangun = isProperty ? rand(50, Math.max(200, luasTanah)) : 0;
    const basePrice = rand(1500000, 8000000);
    const njop = isProperty ? ((luasTanah * basePrice) + (luasBangun * basePrice * 1.2)) : rand(50000000, 500000000);
    const lat = 3.59 + (Math.random() - 0.5) * 0.07, lng = 98.67 + (Math.random() - 0.5) * 0.07, offset = 0.00015;
    const o = await prisma.taxObject.create({ data: { id: `obj-bulk-${i}`, nop: generateNOP(i, kecIndex, kelIndex), name: `${pick(TAX_NAMES[type] ?? ["Objek"])} ${pick(LAST_NAMES)}`, address: `${pick(STREETS)} No. ${rand(1, 150)}, Kel. ${district.kelurahan[kelIndex]}, Kec. ${district.name}, Kota Medan`, lat, lng, status: i < 220 ? "VERIFIED" : (i % 3 === 0 ? "PENDING" : "REJECTED"), type, luasTanah, luasBangun, njop, njoptkp: 12000000, ownerId: userIds[i % userIds.length] } });
    await prisma.objectTaxLocation.create({ data: { objectTaxId: o.id, latitude: lat, longitude: lng, polygonData: JSON.stringify([[lat - offset, lng - offset], [lat + offset, lng - offset], [lat + offset, lng + offset], [lat - offset, lng + offset], [lat - offset, lng - offset]]) } });
    taxObjects.push(o);
  }
  console.log(`✅ ${taxObjects.length} Objek Pajak created.`);

  console.log("🌱 Generating 700 payment records...");
  const METHODS = ["BANK_TRANSFER", "VA_BRI", "VA_BNI", "QRIS", "VA_MANDIRI", "VA_BTN"];
  for (let i = 0; i < 700; i++) {
    const taxObj = taxObjects[i % taxObjects.length];
    const taxPeriod = (2023 + i % 4).toString();
    const isPaid = i < 600;
    const month = rand(1, 12), monthStr = month.toString().padStart(2, "0");
    const createdDate = new Date(`${taxPeriod}-${monthStr}-05T08:00:00Z`);
    const expiredDate = new Date(`${taxPeriod}-${Math.min(12, month + 3).toString().padStart(2, "0")}-05T23:59:59Z`);
    await prisma.payment.create({ data: { id: `pay-${i}`, invoiceNumber: `BAPENDA-${taxPeriod}-${i + 10000}`, amount: Math.max(50000, Number(taxObj.njop) * 0.001), taxPeriod, status: isPaid ? "PAID" : (i % 3 === 0 ? "PENDING" : (i % 3 === 1 ? "EXPIRED" : "CANCELLED")), method: isPaid ? pick(METHODS) : null, paidAt: isPaid ? new Date(createdDate.getTime() + rand(1, 25) * 86400000) : null, expiredAt: expiredDate, notes: isPaid ? `Lunas - ${taxObj.type} ${taxPeriod}` : `Tunggakan ${taxObj.type} ${taxPeriod}`, taxObjectId: taxObj.id, userId: taxObj.ownerId, createdAt: createdDate } });
  }
  console.log("✅ 700 payment records created.");

  console.log("🌱 Generating SPPT Digital records (2025 & 2026)...");
  let spptCount = 0;
  for (let i = 0; i < taxObjects.length; i++) {
    const taxObj = taxObjects[i];
    for (const year of ["2025", "2026"]) {
      await prisma.sppt.create({ data: { id: `sppt-${year}-${i}`, spptNumber: `SPPT-${year}-${taxObj.nop.replace(/\./g, "")}`, taxPeriod: year, njop: taxObj.njop ?? 0, njoptkp: 12000000, taxObjectVal: Math.max(50000, Number(taxObj.njop) * 0.001), isDownloaded: i % 10 < 6, taxObjectId: taxObj.id, userId: taxObj.ownerId, createdAt: new Date(`${year}-01-15T08:00:00Z`) } });
      spptCount++;
    }
  }
  console.log(`✅ ${spptCount} SPPT records created.`);

  console.log("🌱 Generating 15 News articles...");
  const newsAuthors = [admin.id, admin2.id, officer.id];
  const newsItems = [
    { title: "Bapenda Medan Luncurkan SIPADA untuk Kemudahan Pembayaran Pajak Digital", cat: "Berita", summary: "Sistem informasi pajak daerah terintegrasi resmi diluncurkan.", views: 1243 },
    { title: "Program Pemutihan Denda Pajak PBB-P2 Kota Medan 2026", cat: "Pengumuman", summary: "Pemko Medan memberikan keringanan denda bagi WP yang melunasi tunggakan.", views: 3782 },
    { title: "Realisasi PAD Pajak Daerah Kota Medan Semester I 2026 Capai 62%", cat: "Laporan", summary: "Penerimaan pajak daerah semester pertama melampaui target triwulanan.", views: 892 },
    { title: "Integrasi Data GIS Bidang Tanah dengan BPN Kota Medan", cat: "Inovasi", summary: "Peta bidang tanah kini terhubung langsung dengan data sertifikat BPN.", views: 567 },
    { title: "Bapenda Medan Raih Penghargaan Inovasi Layanan Publik 2026", cat: "Prestasi", summary: "SIPADA mendapat pengakuan nasional sebagai inovasi layanan perpajakan terbaik.", views: 2145 },
    { title: "Jadwal Pembaruan Data NJOP Massal Wilayah Medan Baru dan Medan Petisah", cat: "Informasi", summary: "Penyesuaian NJOP dilakukan berdasarkan hasil survei pasar properti terbaru.", views: 1089 },
    { title: "Layanan PPID Bapenda Medan Kini Tersedia Secara Online", cat: "Layanan", summary: "Permohonan informasi publik dapat diajukan tanpa harus datang ke kantor.", views: 445 },
    { title: "Sosialisasi Pajak Daerah untuk Pelaku UMKM Medan 2026", cat: "Edukasi", summary: "Bapenda gelar roadshow edukasi pajak di 5 kecamatan.", views: 738 },
    { title: "Penerimaan PKB dan BBN-KB Provinsi Sumatera Utara Meningkat 18 Persen", cat: "Laporan", summary: "Pertumbuhan kendaraan bermotor baru mendorong lonjakan penerimaan pajak.", views: 1876 },
    { title: "Kebijakan Baru Tarif PBJT Jasa Parkir Disesuaikan 2026", cat: "Regulasi", summary: "Penyesuaian tarif PBJT parkir sesuai Perda Kota Medan No. 3 Tahun 2026.", views: 623 },
    { title: "Bapenda Medan Buka Formasi Rekrutmen PPPK Tenaga Teknis 2026", cat: "Pengumuman", summary: "Tersedia 15 formasi PPPK untuk posisi analis pajak dan operator sistem.", views: 4521 },
    { title: "Workshop Analisis Data Pajak untuk Peneliti dan Akademisi", cat: "Edukasi", summary: "Bapenda buka akses data aggregate bagi mahasiswa S2 dan S3.", views: 312 },
    { title: "Update Aplikasi SIPADA v2.0 Fitur Baru dan Perbaikan Bug", cat: "Inovasi", summary: "Versi terbaru menghadirkan notifikasi otomatis jatuh tempo dan pelacakan pengajuan.", views: 987 },
    { title: "Capaian Pemungutan PBB-P2 Kota Medan Tahun 2025 Rekor Baru", cat: "Laporan", summary: "Realisasi PBB-P2 tahun 2025 melampaui target sebesar 108 persen.", views: 2234 },
    { title: "Tata Cara Pengajuan Keberatan NJOP bagi Wajib Pajak PBB-P2", cat: "Panduan", summary: "Panduan lengkap prosedur keberatan NJOP sesuai peraturan terbaru.", views: 1567 },
  ];
  for (let i = 0; i < newsItems.length; i++) {
    const n = newsItems[i];
    const slug = n.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 60) + `-${Date.now() + i}`;
    await prisma.news.create({ data: { slug, title: n.title, summary: n.summary, content: `Konten lengkap artikel tentang: ${n.title}. Bapenda Kota Medan terus berinovasi dalam meningkatkan kualitas layanan perpajakan daerah demi mendukung pembangunan Kota Medan yang berkelanjutan.`, category: n.cat, isActive: i < 13, viewCount: n.views, authorId: newsAuthors[i % newsAuthors.length], createdAt: dateOffset(i * 12) } });
  }
  console.log("✅ 15 News articles created.");

  console.log("🌱 Generating 10 Announcements...");
  const annItems = [
    { title: "Jadwal Libur Pelayanan Kantor Bapenda Hari Raya Idul Adha 1447 H", cat: "Operasional" },
    { title: "Pemberitahuan Pemeliharaan Sistem SIPADA Sabtu 13 Juli 2026", cat: "Teknis" },
    { title: "Pengumuman Seleksi Administrasi PPPK Bapenda Kota Medan 2026", cat: "Kepegawaian" },
    { title: "Batas Akhir Pembayaran PBB-P2 Tahun 2026 Tanpa Denda 31 Oktober 2026", cat: "Perpajakan" },
    { title: "Perubahan Jam Operasional Pelayanan Loket Bapenda Kota Medan", cat: "Operasional" },
    { title: "Rekonsiliasi Data Wajib Pajak Pembaruan NIK dan NPWPD", cat: "Administrasi" },
    { title: "Sosialisasi Perda No 4 Tahun 2026 tentang Pajak Barang dan Jasa Tertentu", cat: "Regulasi" },
    { title: "Peluncuran Fitur Peta Zona Nilai Tanah ZNT Interaktif di SIPADA", cat: "Inovasi" },
    { title: "Peringatan Waspada Penipuan Mengatasnamakan Petugas Bapenda", cat: "Keamanan" },
    { title: "Pengumuman Pemenang Lomba Inovasi Pelayanan Publik Internal Bapenda 2026", cat: "Prestasi" },
  ];
  for (let i = 0; i < annItems.length; i++) {
    const a = annItems[i];
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 60) + `-${Date.now() + i + 200}`;
    await prisma.announcement.create({ data: { slug, title: a.title, content: `Pengumuman resmi Bapenda Kota Medan terkait: ${a.title}. Untuk informasi lebih lanjut hubungi kantor Bapenda di Jl. Kapten Maulana Lubis No. 2, Medan atau melalui layanan online SIPADA.`, category: a.cat, isActive: true, authorId: newsAuthors[i % newsAuthors.length], createdAt: dateOffset(i * 7) } });
  }
  console.log("✅ 10 Announcements created.");

  console.log("🌱 Generating 20 Research Requests...");
  const resTitles = [
    "Analisis Efektivitas Pemungutan PBB-P2 di Kecamatan Medan Baru",
    "Pengaruh Digitalisasi Pajak terhadap Kepatuhan Wajib Pajak UMKM",
    "Pemetaan Zona Nilai Tanah Berbasis GIS di Koridor Komersial Medan Petisah",
    "Kajian Penerapan Self-Assessment dalam Pemungutan PBJT Makanan dan Minuman",
    "Evaluasi Program Pemutihan Denda PBB-P2 terhadap Realisasi PAD Kota Medan",
    "Analisis Disparitas NJOP dengan Harga Pasar Properti di Wilayah Medan Selatan",
    "Model Prediksi Penerimaan Pajak Daerah Kota Medan Menggunakan Machine Learning",
    "Studi Komparasi Sistem Informasi Pajak Daerah SIPADA vs Kabupaten Kota Lain",
    "Dampak Kebijakan Insentif Pajak PKB terhadap Penetrasi Kendaraan Listrik di Medan",
    "Analisis Kapasitas Fiskal Kota Medan dalam Perspektif Pajak Daerah 2020 2026",
    "Kajian Hukum Pengenaan BPHTB atas Hibah Tanah dalam Keluarga",
    "Efisiensi Pemungutan Pajak Reklame di Era Digital Studi Kasus Kota Medan",
    "Pengaruh Kualitas Layanan SIPADA terhadap Kepuasan Wajib Pajak",
    "Analisis Potensi Pajak Air Tanah di Kawasan Industri Medan Selatan",
    "Korelasi Kepadatan Penduduk dengan Realisasi PBB-P2 per Kecamatan di Kota Medan",
    "Evaluasi Kebijakan Pembebasan NJOPTKP PBB-P2 bagi Rumah Tangga Berpendapatan Rendah",
    "Kajian Tarif Optimal Pajak Hiburan dalam Mendukung Industri Kreatif Kota Medan",
    "Implementasi Blockchain untuk Transparansi Data Pajak Daerah Sebuah Tinjauan",
    "Analisis Keadilan Horizontal dalam Penetapan NJOP Massal Kota Medan 2024 2026",
    "Peran Pajak Daerah dalam Pembiayaan Infrastruktur Kota Medan Pendekatan Desentralisasi",
  ];
  const resStatuses = ["PENDING", "REVIEW", "APPROVED", "REJECTED"];
  const mhsIds = mahasiswaList.map((m: any) => m.id);
  for (let i = 0; i < 20; i++) {
    const status = resStatuses[i % resStatuses.length];
    const isReviewed = status !== "PENDING";
    await prisma.researchRequest.create({ data: { id: `research-${i + 1}`, requestNumber: `RES-2026${(i + 1).toString().padStart(4, "0")}`, title: resTitles[i], description: "Penelitian ini bertujuan mengkaji aspek perpajakan daerah menggunakan data sekunder Bapenda Kota Medan dengan metodologi kuantitatif analisis regresi berganda.", institution: pick(UNIVERSITIES), supervisorName: `Prof. Dr. ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}, M.Si.`, supervisorNip: `19${rand(60, 80)}0${rand(100, 999)}${rand(100, 999)}`, dataNeeded: pick(["Data realisasi penerimaan PBB-P2 per kelurahan tahun 2020-2026", "Rekap jumlah wajib pajak aktif dan tunggakan per kecamatan", "Data NJOP massal dan harga pasar properti 5 tahun terakhir", "Statistik penggunaan layanan SIPADA dan tingkat kepuasan pengguna"]), purpose: "Penyelesaian tugas akhir (skripsi/tesis) guna memenuhi syarat kelulusan program studi.", documentUrl: "surat_pengantar_dekan.pdf", status, reviewNotes: isReviewed ? (status === "APPROVED" ? "Dokumen lengkap dan surat pengantar dekan valid. Akses data aggregate disetujui." : status === "REJECTED" ? "Surat pengantar tidak ditandatangani pejabat berwenang. Silakan lengkapi dan ajukan ulang." : "Dokumen sedang dalam proses verifikasi oleh petugas.") : null, reviewedBy: isReviewed ? pick([admin.id, officer.id]) : null, reviewedAt: isReviewed ? dateOffset(rand(5, 30)) : null, userId: mhsIds[i % mhsIds.length], createdAt: dateOffset(i * 8) } });
  }
  console.log("✅ 20 Research Requests created.");

  console.log("🌱 Generating 20 PPID Requests...");
  const ppidTitles = [
    "Data Target dan Realisasi PAD Sektor PBB-P2 Kota Medan 2021-2025",
    "Laporan Keuangan Tahunan Bapenda Kota Medan 2024",
    "Daftar Penunggak Pajak PBB-P2 Skala Besar NJOP di atas Rp 1 Miliar",
    "Rancangan Perda Pajak Daerah Kota Medan Tahun 2026",
    "Data Jumlah Wajib Pajak Aktif per Kecamatan Kota Medan 2025",
    "Anggaran Program Pemutihan Denda PBB-P2 dan Realisasinya",
    "Kebijakan Penetapan NJOP Massal Wilayah Kecamatan Medan Timur",
    "Data Statistik Penerimaan PBJT per Sub-Sektor 2020-2025",
    "SOP Pelayanan Pengajuan Keberatan Pajak di Bapenda Kota Medan",
    "Informasi Tarif dan Tata Cara Penghitungan BPHTB Kota Medan",
    "Daftar Zona Nilai Tanah ZNT Seluruh Wilayah Kota Medan 2026",
    "Laporan Hasil Audit Internal Pengelolaan Pajak Daerah 2024",
    "Data Realisasi Pajak PKB dan BBN-KB per Kecamatan 2025",
    "Kebijakan Pemberian Keringanan dan Penghapusan Sanksi Pajak",
    "Rencana Strategis Bapenda Kota Medan 2025-2030",
    "Data Komparasi Penerimaan Pajak Daerah Kota Medan vs Kota Sejenis",
    "Informasi Sistem dan Aplikasi SIPADA Fitur Pengembang dan Biaya",
    "Dokumen Hasil Survei Kepuasan Masyarakat terhadap Layanan Bapenda 2025",
    "Data Objek Pajak Non-Aktif Hapus Buku Tahun 2020-2025",
    "Laporan Capaian IKU Indikator Kinerja Utama Bapenda Kota Medan 2025",
  ];
  const ppidTypes = ["DOKUMEN", "DATA_STATISTIK", "KEBIJAKAN", "ANGGARAN", "LAINNYA"];
  const ppidStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"];
  for (let i = 0; i < 20; i++) {
    const status = ppidStatuses[i % ppidStatuses.length];
    const isResponded = ["RESOLVED", "REJECTED", "CLOSED"].includes(status);
    await prisma.pPIDRequest.create({ data: { id: `ppid-${i + 1}`, ticketNumber: `PPID-2026${(i + 1).toString().padStart(4, "0")}`, title: ppidTitles[i], description: `Dengan hormat, kami memohon informasi terkait: ${ppidTitles[i]}. Informasi ini diperlukan untuk keperluan penelitian dan transparansi publik sesuai UU KIP No. 14/2008.`, informationType: ppidTypes[i % ppidTypes.length], urgency: i % 4 === 0 ? "URGENT" : "NORMAL", status, response: isResponded ? (status === "RESOLVED" ? "Dokumen/data yang dimohon telah tersedia dan dapat diunduh melalui tautan yang dikirimkan ke email Anda." : status === "REJECTED" ? "Informasi yang dimohon termasuk dalam kategori dikecualikan sesuai Pasal 17 UU KIP No. 14/2008." : "Permohonan telah ditutup. Mohon mengajukan kembali jika masih diperlukan.") : null, responseAt: isResponded ? dateOffset(rand(3, 10) + i * 5) : null, respondedBy: isResponded ? pick([admin.id, officer2.id]) : null, userId: userIds[i % userIds.length], createdAt: dateOffset(i * 9) } });
  }
  console.log("✅ 20 PPID Requests created.");

  console.log("🌱 Generating 20 Complaints...");
  const complaintSubjects = [
    "Virtual Account BRI Tidak Terbaca Setelah Transfer",
    "SPPT Tidak Sesuai dengan Luas Tanah Aktual",
    "Petugas Lapangan Bersikap Tidak Profesional saat Verifikasi",
    "Pembayaran QRIS Berhasil tapi Status Masih PENDING",
    "Alamat Objek Pajak Salah di Sistem SIPADA",
    "Proses Balik Nama Objek Pajak Terlalu Lama Sudah 3 Bulan",
    "NJOP Terlalu Tinggi Dibanding Nilai Pasar Riil",
    "Susah Login ke Akun SIPADA Password Gagal Reset",
    "Pengaduan atas Surat Tagihan Ganda untuk NOP yang Sama",
    "Petugas Loket Tidak Informatif dalam Menjelaskan Prosedur",
    "Notifikasi Jatuh Tempo Tidak Diterima Meski Email Terdaftar",
    "Denda Pajak Dikenakan meski Pembayaran Dilakukan Sebelum Jatuh Tempo",
    "Invoice Tidak Bisa Diunduh Tombol Download Tidak Berfungsi",
    "Data Pemilik Objek Pajak Masih Nama Almarhum meski Sudah Diurus",
    "Pengaduan Pungli oleh Oknum yang Mengaku Petugas Bapenda",
    "Antrian Loket Terlalu Lama Tidak Ada Sistem Antrean Digital",
    "Nilai Tagihan PBB Berbeda antara SPPT Fisik dan SIPADA",
    "Permohonan Keberatan NJOP Tidak Ditanggapi Setelah 2 Bulan",
    "Kesalahan Penulisan Nama Pemilik di Sertifikat Pajak",
    "Website SIPADA Sering Down pada Jam Sibuk Pembayaran",
  ];
  const compCats = ["PELAYANAN", "TEKNIS_SISTEM", "PAJAK", "PETUGAS", "LAINNYA"];
  const compStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  const priorities = ["LOW", "NORMAL", "HIGH"];
  for (let i = 0; i < 20; i++) {
    const status = compStatuses[i % compStatuses.length];
    const isResponded = ["RESOLVED", "CLOSED"].includes(status);
    const isAnon = i % 7 === 0;
    await prisma.complaint.create({ data: { id: `complaint-${i + 1}`, ticketNumber: `ADU-2026${(i + 1).toString().padStart(4, "0")}`, subject: complaintSubjects[i], description: `Dengan hormat, saya menyampaikan pengaduan terkait: ${complaintSubjects[i]}. Mohon ditindaklanjuti sesuai prosedur yang berlaku.`, category: compCats[i % compCats.length], priority: priorities[i % priorities.length], status, response: isResponded ? "Terima kasih atas laporan Anda. Kendala telah diidentifikasi dan ditangani oleh tim terkait. Mohon maaf atas ketidaknyamanan yang terjadi." : null, responseAt: isResponded ? dateOffset(rand(2, 7) + i * 4) : null, respondedBy: isResponded ? pick([officer.id, officer2.id, officer3.id]) : null, isAnonymous: isAnon, userId: isAnon ? admin.id : userIds[i % userIds.length], createdAt: dateOffset(i * 6) } });
  }
  console.log("✅ 20 Complaints created.");

  console.log("🌱 Generating 20 Tax Submissions...");
  const subTitles = [
    "Keberatan NJOP Tanah Terlalu Tinggi vs Harga Pasar",
    "Keberatan Kenaikan PBB Lebih dari 50 Persen dalam Satu Tahun",
    "Keberatan Pengenaan PBB atas Tanah Sengketa",
    "Keberatan NJOP Bangunan Akibat Salah Klasifikasi Konstruksi",
    "Keberatan Pajak Reklame Luas Papan Reklame Dihitung Ganda",
    "Keberatan BPHTB atas Waris yang Dikenakan NPOP Terlalu Tinggi",
    "Keberatan PBJT Makanan Omzet Dasar Penghitungan Tidak Akurat",
    "Keberatan PKB Nilai Kendaraan Basis Pengenaan Tidak Sesuai",
    "Keberatan Tarif PBJT Parkir atas Fasilitas Parkir Gratis",
    "Keberatan Pajak Air Tanah Debit Terukur Tidak Sesuai Faktur",
    "Permohonan Perubahan Nama Pemilik Objek Pajak Jual Beli",
    "Permohonan Perubahan Luas Tanah Berdasarkan Hasil Ukur BPN",
    "Permohonan Perubahan Alamat Objek Pajak yang Tidak Akurat",
    "Permohonan Penghapusan Objek Pajak Bangunan Sudah Dirobohkan",
    "Permohonan Perubahan Jenis Penggunaan Tanah Sawah ke Perumahan",
    "Permohonan Balik Nama Ahli Waris Setelah Wajib Pajak Meninggal",
    "Permohonan Split NOP Pemecahan Bidang Tanah",
    "Permohonan Gabung NOP Penggabungan Dua Bidang Tanah",
    "Permohonan Koreksi Nama Wajib Pajak Salah Ketik",
    "Permohonan Pembaruan Data NPWPD Usaha yang Berganti Nama",
  ];
  const subStatuses = ["PENDING", "IN_PROGRESS", "APPROVED", "REJECTED"];
  for (let i = 0; i < 20; i++) {
    const type = i < 10 ? "KEBERATAN" : "PERUBAHAN";
    const status = subStatuses[i % subStatuses.length];
    const isReviewed = status !== "PENDING";
    await prisma.taxSubmission.create({ data: { id: `taxsub-${i + 1}`, ticketNumber: `SUB-2026${(i + 1).toString().padStart(4, "0")}`, type, title: subTitles[i], description: `Pengajuan ${type} terkait: ${subTitles[i]}. Dokumen pendukung terlampir sesuai persyaratan yang berlaku.`, documentUrl: "dokumen_pendukung.pdf", status, reviewNotes: isReviewed ? (status === "APPROVED" ? "Dokumen pendukung lengkap dan valid. Permohonan disetujui. Pembaruan data berlaku pada SPPT tahun berikutnya." : status === "REJECTED" ? "Dokumen tidak lengkap atau tidak memenuhi persyaratan. Silakan lengkapi dan ajukan ulang dalam 30 hari." : "Pengajuan sedang dalam proses verifikasi dan peninjauan lapangan oleh petugas.") : null, userId: userIds[i % userIds.length], createdAt: dateOffset(i * 7 + 10) } });
  }
  console.log("✅ 20 Tax Submissions created.");

  console.log("🌱 Generating 50 Notifications...");
  const notifTypes = ["INFO", "SUCCESS", "WARNING", "ERROR"];
  const notifItems = [
    { title: "Backup Database Harian Berhasil", msg: "Backup otomatis database SIPADA pukul 02.00 WIB berhasil dilakukan tanpa error. Ukuran backup: 2.4 GB.", type: "SUCCESS", cat: "SYSTEM", uid: admin.id },
    { title: "Peringatan Kapasitas Storage Server", msg: "Kapasitas penyimpanan server mencapai 78%. Segera lakukan pengelolaan data atau penambahan kapasitas.", type: "WARNING", cat: "SYSTEM", uid: admin.id },
    { title: "Update Sistem SIPADA v2.1.0 Tersedia", msg: "Versi terbaru SIPADA v2.1.0 siap diinstal. Jadwalkan downtime maintenance untuk update.", type: "INFO", cat: "SYSTEM", uid: admin.id },
    { title: "Kegagalan Sinkronisasi Data Bank BNI", msg: "Sinkronisasi data konfirmasi pembayaran VA BNI mengalami error selama 15 menit. Data sudah dipulihkan.", type: "ERROR", cat: "SYSTEM", uid: admin.id },
    { title: "Laporan Audit Sistem Selesai Dibuat", msg: "Laporan audit keamanan sistem triwulanan Q2-2026 telah selesai dibuat dan siap untuk ditelaah.", type: "SUCCESS", cat: "SYSTEM", uid: admin.id },
    { title: "Integrasi API BPN Berhasil Diaktifkan", msg: "Koneksi API dengan sistem BPN Kanwil Sumut berhasil diintegrasikan. Data bidang tanah kini dapat disinkronisasi otomatis.", type: "SUCCESS", cat: "SYSTEM", uid: admin.id },
    { title: "Deteksi Login Mencurigakan", msg: "Terdeteksi percobaan login ke akun admin dari IP tidak dikenal. Sesi otomatis dikunci.", type: "WARNING", cat: "SYSTEM", uid: admin.id },
    { title: "Jadwal Pemeliharaan Server Terjadwal", msg: "Server SIPADA akan dipelihara Sabtu 13 Juli 2026 pukul 00.00-06.00 WIB. Layanan sementara tidak tersedia.", type: "INFO", cat: "SYSTEM", uid: admin.id },
    { title: "Rekonsiliasi Data WP dengan Dukcapil Selesai", msg: "Proses rekonsiliasi data NIK wajib pajak dengan database Dukcapil selesai. 1.247 data berhasil diperbarui.", type: "SUCCESS", cat: "SYSTEM", uid: admin.id },
    { title: "Target PAD Triwulan II Tercapai", msg: "Realisasi PAD pajak daerah Triwulan II 2026 mencapai Rp 248 miliar (102% dari target triwulanan).", type: "SUCCESS", cat: "SYSTEM", uid: admin.id },
    { title: "Pembayaran PBB Rp 4.500.000 Terverifikasi", msg: "Pembayaran PBB-P2 NOP 12.72.01.001.001.0001 oleh Budi Santoso senilai Rp 4.500.000 berhasil diverifikasi via VA BRI.", type: "SUCCESS", cat: "DASHBOARD", uid: admin.id },
    { title: "Pengajuan Keberatan Baru Masuk", msg: "Pengajuan keberatan NJOP baru (SUB-20260001) dari Hendra Wijaya memerlukan verifikasi.", type: "INFO", cat: "DASHBOARD", uid: admin.id },
    { title: "Pengaduan Prioritas Tinggi Belum Ditangani", msg: "Pengaduan ADU-20260015 bertanda prioritas HIGH belum ada respons lebih dari 48 jam.", type: "WARNING", cat: "DASHBOARD", uid: admin.id },
    { title: "Wajib Pajak Baru Terdaftar", msg: "24 wajib pajak baru berhasil mendaftarkan akun SIPADA dalam 24 jam terakhir.", type: "INFO", cat: "DASHBOARD", uid: admin.id },
    { title: "Jatuh Tempo Tagihan 85 WP Besok", msg: "85 tagihan PBB-P2 akan jatuh tempo besok. Notifikasi otomatis sudah dikirimkan ke WP terkait.", type: "WARNING", cat: "DASHBOARD", uid: admin.id },
    { title: "Tugas Verifikasi Lapangan Baru", msg: "Anda ditugaskan untuk verifikasi lapangan objek pajak NOP 12.72.03.002.005.0042. Selesaikan dalam 3 hari kerja.", type: "INFO", cat: "DASHBOARD", uid: officer.id },
    { title: "Data Objek Pajak Berhasil Diverifikasi", msg: "Verifikasi data 15 objek pajak baru di Kecamatan Medan Sunggal berhasil diselesaikan.", type: "SUCCESS", cat: "DASHBOARD", uid: officer.id },
    { title: "Permohonan PPID Harus Direspons", msg: "Permohonan informasi publik PPID-20260003 sudah melewati 7 hari kerja. Harap segera ditanggapi.", type: "WARNING", cat: "DASHBOARD", uid: officer.id },
    { title: "Hasil Penilaian NJOP Disetujui", msg: "Hasil penilaian ulang NJOP untuk 10 objek pajak wilayah Medan Baru telah disetujui oleh Kepala Bidang.", type: "SUCCESS", cat: "DASHBOARD", uid: officer.id },
    { title: "Pelatihan Sistem SIPADA v2.0 Besok", msg: "Ingat: Pelatihan penggunaan SIPADA v2.0 untuk petugas dijadwalkan besok pukul 09.00 WIB di Aula Bapenda.", type: "INFO", cat: "DASHBOARD", uid: officer.id },
    { title: "Tagihan PBB-P2 Anda Segera Jatuh Tempo", msg: "Tagihan PBB-P2 NOP 12.72.01.001.001.0001 senilai Rp 4.500.000 akan jatuh tempo 31 Oktober 2026.", type: "WARNING", cat: "DASHBOARD", uid: "wp-id-1" },
    { title: "Pembayaran Berhasil Terima Kasih", msg: "Pembayaran PBB-P2 Tahun 2025 sebesar Rp 2.800.000 telah berhasil kami terima dan dikonfirmasi.", type: "SUCCESS", cat: "DASHBOARD", uid: "wp-id-1" },
    { title: "SPPT Digital 2026 Tersedia", msg: "SPPT Digital Tahun Pajak 2026 untuk NOP 12.72.01.001.002.0002 sudah tersedia. Silakan unduh di menu SPPT Digital.", type: "INFO", cat: "DASHBOARD", uid: "wp-id-1" },
    { title: "Status Pengajuan Keberatan Diperbarui", msg: "Pengajuan keberatan NJOP Anda (SUB-20260001) sedang dalam proses verifikasi oleh tim kami.", type: "INFO", cat: "DASHBOARD", uid: "wp-id-2" },
    { title: "Akun SIPADA Berhasil Diverifikasi", msg: "Verifikasi NIK akun SIPADA Anda berhasil diselesaikan. Kini Anda memiliki akses penuh ke seluruh layanan.", type: "SUCCESS", cat: "DASHBOARD", uid: "wp-id-2" },
    { title: "Permohonan Riset Anda Sedang Diproses", msg: "Permohonan riset RES-20260001 Anda sedang ditinjau oleh tim Bapenda. Estimasi respons 5-7 hari kerja.", type: "INFO", cat: "DASHBOARD", uid: "mahasiswa-id" },
    { title: "Akses Data Riset Disetujui", msg: "Permohonan akses data riset Anda (RES-20260001) telah disetujui. Data aggregate dapat diunduh di menu Permohonan Riset.", type: "SUCCESS", cat: "DASHBOARD", uid: "mahasiswa-id" },
    { title: "Pengingat Workshop Analisis Data Pajak Besok", msg: "Anda terdaftar di Workshop Analisis Data Pajak untuk Peneliti (15-16 Juli 2026). Hadir di Aula Bapenda pukul 08.30 WIB.", type: "INFO", cat: "DASHBOARD", uid: "mahasiswa-id" },
    { title: "Data Riset Tersedia untuk Diunduh", msg: "File data aggregate pajak daerah 2020-2026 untuk riset Anda sudah diunggah. Silakan unduh dari menu Permohonan Riset.", type: "SUCCESS", cat: "DASHBOARD", uid: "mahasiswa-id-2" },
    { title: "Dokumen Pengantar Riset Perlu Dilengkapi", msg: "Dokumen surat pengantar untuk permohonan riset RES-20260004 belum memenuhi syarat. Periksa catatan petugas dan unggah ulang.", type: "WARNING", cat: "DASHBOARD", uid: "mahasiswa-id-3" },
  ];
  for (let i = 0; i < notifItems.length; i++) {
    const n = notifItems[i];
    await prisma.notification.create({ data: { title: n.title, message: n.msg, type: n.type, category: n.cat, isRead: i < 20, userId: n.uid, createdAt: dateOffset(rand(0, 170)) } });
  }
  for (let i = 0; i < 20; i++) {
    await prisma.notification.create({ data: { title: `Notifikasi Sistem #${i + 31}`, message: `Pesan notifikasi otomatis untuk monitoring sistem dan aktivitas wajib pajak. Referensi: SYS-${i + 1000}.`, type: pick(notifTypes), category: i % 2 === 0 ? "SYSTEM" : "DASHBOARD", isRead: i % 3 === 0, userId: pick([admin.id, officer.id, "wp-id-1", "wp-id-2"]), createdAt: dateOffset(rand(0, 170)) } });
  }
  console.log("✅ 50 Notifications created.");

  console.log("🌱 Generating 100 Audit Logs...");
  const auditActions = [
    { action: "CREATE_TAX_OBJECT", table: "TaxObject", rec: "obj-pbb-1" }, 
    { action: "UPDATE_NJOP", table: "TaxObject", rec: "obj-pbb-2" }, 
    { action: "VERIFY_TAX_OBJECT", table: "TaxObject", rec: "obj-hotel-1" },
    { action: "CREATE_PAYMENT", table: "Payment", rec: "pay-0" }, 
    { action: "CONFIRM_PAYMENT", table: "Payment", rec: "pay-1" }, 
    { action: "APPROVE_KEBERATAN", table: "TaxSubmission", rec: "taxsub-1" },
    { action: "REJECT_PPID_REQUEST", table: "PPIDRequest", rec: "ppid-1" }, 
    { action: "APPROVE_RESEARCH", table: "ResearchRequest", rec: "research-1" }, 
    { action: "UPDATE_SYSTEM_SETTINGS", table: "SystemConfig", rec: "global-config" },
    { action: "CREATE_USER", table: "User", rec: "wp-user-10" }, 
    { action: "DEACTIVATE_USER", table: "User", rec: "wp-user-91" }, 
    { action: "EXPORT_TAX_DATA", table: "TaxObject", rec: "EXPORT-2026-06" },
    { action: "UPDATE_ZNT", table: "LandValueZone", rec: "Z-PETISAH-1" }, 
    { action: "CREATE_NEWS", table: "News", rec: "news-1" }, 
    { action: "PUBLISH_ANNOUNCEMENT", table: "Announcement", rec: "ann-1" },
    { action: "RESPOND_COMPLAINT", table: "Complaint", rec: "complaint-1" }, 
    { action: "GENERATE_SPPT", table: "Sppt", rec: "SPPT-2026-BATCH" }, 
    { action: "UPDATE_PROPERTY_MARKET", table: "PropertyMarket", rec: "pm-batch-2026" },
    { action: "RUN_TAX_ASSESSMENT", table: "TaxAssessment", rec: "assess-batch" }, 
    { action: "RESET_USER_PASSWORD", table: "User", rec: "wp-user-5" }, 
    { action: "LOGIN_ADMIN", table: "Session", rec: "sess-admin-001" },
    { action: "LOGIN_OFFICER", table: "Session", rec: "sess-officer-001" }, 
    { action: "BULK_IMPORT_TAX_OBJECTS", table: "TaxObject", rec: "IMPORT-2026-Q1" }, 
    { action: "DELETE_EXPIRED_PAYMENTS", table: "Payment", rec: "CLEANUP-2026" },
    { action: "APPROVE_PPID_REQUEST", table: "PPIDRequest", rec: "ppid-3" }, 
    { action: "UPDATE_USER_PROFILE", table: "User", rec: "wp-id-1" }, 
    { action: "GENERATE_LAPORAN_PAD", table: "Report", rec: "RPT-2026-Q2" },
    { action: "RESOLVE_COMPLAINT", table: "Complaint", rec: "complaint-5" }, 
    { action: "SYNC_BPN_DATA", table: "ObjectTaxLocation", rec: "SYNC-BPN-2026" }, 
    { action: "UPDATE_BUDGET_YEAR", table: "SystemConfig", rec: "global-config" },
  ];
  
  const auditUsers = [
    superAdmin.id, 
    adminAgha.id, 
    adminDewi.id, 
    adminRahmad.id, 
    adminFitri.id, 
    adminIndra.id, 
    officer.id, 
    officer2.id, 
    officer3.id
  ];

  for (let i = 0; i < 100; i++) {
    const aa = auditActions[i % auditActions.length];
    await prisma.auditLog.create({
      data: {
        action: aa.action,
        table: aa.table,
        recordId: `${aa.rec}-${i}`,
        userId: auditUsers[i % auditUsers.length],
        oldValue: { status: "SEBELUMNYA", val: rand(100000, 9999999) },
        newValue: { status: "DIPERBARUI", val: rand(100000, 9999999) },
        createdAt: dateOffset(-rand(0, 180))
      }
    });
  }
  console.log("✅ 100 Audit Logs created.");

  console.log("🌱 Generating 12 Land Value Zones...");
  const zones = [
    { code: "Z-BARU-1", name: "Zona Premium Jl. Iskandar Muda", val: 8500000, kec: "Medan Baru", kel: "Darussalam", lat: 3.5930, lng: 98.6620 },
    { code: "Z-BARU-2", name: "Zona Hunian Darussalam", val: 5500000, kec: "Medan Baru", kel: "Merdeka", lat: 3.5910, lng: 98.6580 },
    { code: "Z-PETISAH-1", name: "Zona Bisnis Petisah Tengah", val: 7500000, kec: "Medan Petisah", kel: "Petisah Tengah", lat: 3.5970, lng: 98.6720 },
    { code: "Z-PETISAH-2", name: "Zona Komersial Sei Putih", val: 6200000, kec: "Medan Petisah", kel: "Sei Putih Timur I", lat: 3.5990, lng: 98.6680 },
    { code: "Z-SUNGGAL-1", name: "Zona Hunian Sunggal", val: 3800000, kec: "Medan Sunggal", kel: "Sunggal", lat: 3.5850, lng: 98.6250 },
    { code: "Z-SUNGGAL-2", name: "Zona Berkembang Tanjung Rejo", val: 3200000, kec: "Medan Sunggal", kel: "Tanjung Rejo", lat: 3.5820, lng: 98.6180 },
    { code: "Z-POLONIA-1", name: "Zona Elit Polonia", val: 9000000, kec: "Medan Polonia", kel: "Polonia", lat: 3.5680, lng: 98.6780 },
    { code: "Z-HELVETIA-1", name: "Zona Berkembang Helvetia", val: 3000000, kec: "Medan Helvetia", kel: "Helvetia Tengah", lat: 3.6120, lng: 98.6480 },
    { code: "Z-JOHOR-1", name: "Zona Perumahan Medan Johor", val: 4200000, kec: "Medan Johor", kel: "Gedung Johor", lat: 3.5380, lng: 98.6880 },
    { code: "Z-AREA-1", name: "Zona Perdagangan Medan Area", val: 5000000, kec: "Medan Area", kel: "Tegal Sari I", lat: 3.5820, lng: 98.7020 },
    { code: "Z-KOTA-1", name: "Zona Inti Medan Kota", val: 7000000, kec: "Medan Kota", kel: "Mesjid", lat: 3.5880, lng: 98.6950 },
    { code: "Z-TIMUR-1", name: "Zona Industri Medan Timur", val: 4800000, kec: "Medan Timur", kel: "Gaharu", lat: 3.6020, lng: 98.7080 },
  ];
  for (const z of zones) {
    const off = 0.003;
    await prisma.landValueZone.create({ data: { zoneCode: z.code, zoneName: z.name, polygonData: JSON.stringify([[z.lat - off, z.lng - off], [z.lat + off, z.lng - off], [z.lat + off, z.lng + off], [z.lat - off, z.lng + off], [z.lat - off, z.lng - off]]), valuePerMeter: z.val, district: z.kec, village: z.kel } });
  }
  console.log(`✅ ${zones.length} Land Value Zones created.`);

  console.log("🌱 Generating 25 Property Market records...");
  const marketProps = [
    { type: "RUMAH", addr: "Jl. Diponegoro No. 12", kec: "Medan Petisah", kel: "Petisah Tengah", price: 2500000000, land: 250, build: 180, lat: 3.5960, lng: 98.6710, src: "Rumah123" },
    { type: "RUKO", addr: "Jl. Gatot Subroto No. 45", kec: "Medan Helvetia", kel: "Dwikora", price: 3800000000, land: 150, build: 350, lat: 3.5990, lng: 98.6520, src: "OLX" },
    { type: "TANAH", addr: "Jl. Ring Road Kav. 8B", kec: "Medan Sunggal", kel: "Sunggal", price: 1200000000, land: 300, build: 0, lat: 3.5820, lng: 98.6180, src: "Survey Lapangan" },
    { type: "RUMAH", addr: "Jl. S. Parman No. 88", kec: "Medan Baru", kel: "Babura", price: 1900000000, land: 200, build: 150, lat: 3.5890, lng: 98.6650, src: "Rumah123" },
    { type: "RUMAH", addr: "Jl. Polonia Indah No. 5", kec: "Medan Polonia", kel: "Polonia", price: 4500000000, land: 400, build: 300, lat: 3.5650, lng: 98.6810, src: "OLX" },
    { type: "RUKO", addr: "Jl. Iskandar Muda No. 101", kec: "Medan Baru", kel: "Darussalam", price: 2800000000, land: 120, build: 280, lat: 3.5920, lng: 98.6580, src: "Survey Lapangan" },
    { type: "TANAH", addr: "Jl. T. Amir Hamzah No. 12", kec: "Medan Helvetia", kel: "Helvetia Tengah", price: 850000000, land: 150, build: 0, lat: 3.6150, lng: 98.6420, src: "Rumah123" },
    { type: "RUMAH", addr: "Jl. Dr. Mansyur No. 24", kec: "Medan Baru", kel: "Padang Bulan Selayang I", price: 2100000000, land: 220, build: 160, lat: 3.5620, lng: 98.6510, src: "OLX" },
    { type: "RUKO", addr: "Jl. SM Raja No. 142", kec: "Medan Johor", kel: "Gedung Johor", price: 3400000000, land: 180, build: 400, lat: 3.5350, lng: 98.6880, src: "Survey Lapangan" },
    { type: "RUMAH", addr: "Jl. Karya Wisata No. 9", kec: "Medan Johor", kel: "Pangkalan Mansyur", price: 1500000000, land: 180, build: 120, lat: 3.5410, lng: 98.6770, src: "Rumah123" },
    { type: "APARTEMEN", addr: "Jl. Kapten Maulana Lubis No.5", kec: "Medan Petisah", kel: "Sekip", price: 850000000, land: 0, build: 65, lat: 3.5980, lng: 98.6740, src: "OLX" },
    { type: "GUDANG", addr: "Jl. Gatot Subroto No. 200", kec: "Medan Sunggal", kel: "Lalang", price: 5200000000, land: 1500, build: 2000, lat: 3.5780, lng: 98.6150, src: "Survey Lapangan" },
    { type: "TANAH", addr: "Jl. Pemuda Kav. 15", kec: "Medan Baru", kel: "Titi Rantai", price: 1750000000, land: 350, build: 0, lat: 3.5950, lng: 98.6600, src: "Rumah123" },
    { type: "RUMAH", addr: "Jl. Sei Putih No. 33", kec: "Medan Petisah", kel: "Sei Putih Barat", price: 1200000000, land: 150, build: 100, lat: 3.6020, lng: 98.6680, src: "OLX" },
    { type: "RUKO", addr: "Jl. Letda Sujono No. 50", kec: "Medan Timur", kel: "Gaharu", price: 2200000000, land: 100, build: 250, lat: 3.6050, lng: 98.7120, src: "Survey Lapangan" },
    { type: "RUMAH", addr: "Jl. Halat No. 18", kec: "Medan Kota", kel: "Sungai Rengas", price: 1650000000, land: 200, build: 140, lat: 3.5850, lng: 98.6980, src: "Rumah123" },
    { type: "TANAH", addr: "Jl. Brigjen Katamso No. 7", kec: "Medan Maimun", kel: "Aur", price: 3200000000, land: 600, build: 0, lat: 3.5780, lng: 98.6870, src: "OLX" },
    { type: "RUKO", addr: "Jl. Sisingamangaraja No. 22", kec: "Medan Amplas", kel: "Amplas", price: 1900000000, land: 90, build: 200, lat: 3.5290, lng: 98.7020, src: "Survey Lapangan" },
    { type: "RUMAH", addr: "Jl. Tanjung Rejo No. 45", kec: "Medan Sunggal", kel: "Tanjung Rejo", price: 980000000, land: 120, build: 90, lat: 3.5830, lng: 98.6210, src: "Rumah123" },
    { type: "RUKO", addr: "Jl. Letjen Suprapto No. 15", kec: "Medan Baru", kel: "Merdeka", price: 4100000000, land: 200, build: 450, lat: 3.5970, lng: 98.6640, src: "OLX" },
    { type: "TANAH", addr: "Jl. Kwala Bekala No. 8", kec: "Medan Johor", kel: "Kwala Bekala", price: 620000000, land: 200, build: 0, lat: 3.5260, lng: 98.6720, src: "Survey Lapangan" },
    { type: "RUMAH", addr: "Jl. Cinta Damai No. 12", kec: "Medan Helvetia", kel: "Cinta Damai", price: 750000000, land: 110, build: 85, lat: 3.6200, lng: 98.6550, src: "Rumah123" },
    { type: "RUKO", addr: "Jl. Sekip No. 89", kec: "Medan Petisah", kel: "Sekip", price: 3500000000, land: 160, build: 380, lat: 3.5940, lng: 98.6700, src: "OLX" },
    { type: "TANAH", addr: "Jl. Sari Rejo Kav. 21", kec: "Medan Polonia", kel: "Sari Rejo", price: 2800000000, land: 500, build: 0, lat: 3.5720, lng: 98.6850, src: "Survey Lapangan" },
    { type: "RUMAH", addr: "Jl. Tegal Sari No. 16", kec: "Medan Area", kel: "Tegal Sari I", price: 860000000, land: 130, build: 100, lat: 3.5850, lng: 98.7050, src: "Rumah123" },
  ];
  for (const mp of marketProps) {
    await prisma.propertyMarket.create({ data: { propertyType: mp.type, address: mp.addr, district: mp.kec, village: mp.kel, marketPrice: mp.price, landArea: mp.land, buildingArea: mp.build, latitude: mp.lat, longitude: mp.lng, source: mp.src, recordedAt: dateOffset(rand(0, 90)) } });
  }
  console.log(`✅ ${marketProps.length} Property Market records created.`);

  console.log("🌱 Generating 25 Tax Assessments...");
  const assessReasons = [
    "Penyesuaian NJOP massal berkala untuk wilayah koridor bisnis utama sesuai Perda 2026",
    "Pembangunan infrastruktur jalan tol/bypass baru meningkatkan aksesibilitas kawasan",
    "Peningkatan kelas bangunan akibat renovasi besar dan perubahan fungsi dari hunian ke komersial",
    "Koreksi administratif luas tanah hasil ukur ulang dari BPN yang berbeda dengan data sebelumnya",
    "Kenaikan harga pasar tanah akibat pengembangan kawasan perbelanjaan dan pusat bisnis di sekitar objek",
  ];
  const assessors = [officer.id, officer2.id, officer3.id];
  const verifiedObjs = taxObjects.filter((o: any) => o.status === "VERIFIED").slice(0, 25);
  for (let i = 0; i < verifiedObjs.length; i++) {
    const o = verifiedObjs[i];
    const oldVal = Number(o.njop);
    await prisma.taxAssessment.create({ data: { objectTaxId: o.id, oldNJOP: oldVal, newNJOP: Math.round(oldVal * (1.05 + i * 0.02)), assessmentReason: assessReasons[i % assessReasons.length], assessorId: assessors[i % assessors.length], assessmentDate: dateOffset(rand(30, 160)) } });
  }
  console.log(`✅ ${verifiedObjs.length} Tax Assessments created.`);

  console.log("\n🎉 Seeding Completed successfully!");
  console.log("📊 Summary:");
  console.log("   👤 Users: 2 admin, 3 officer, 1 developer, 5 mahasiswa, 100 wajib pajak");
  console.log("   🏠 Objek Pajak: 250 (semua jenis pajak daerah)");
  console.log("   💰 Pembayaran: 700 records (600 PAID, 100 tunggakan/expired/cancelled)");
  console.log("   📄 SPPT Digital: 500 records (tahun 2025 & 2026)");
  console.log("   📰 Berita: 15 artikel");
  console.log("   📢 Pengumuman: 10 pengumuman");
  console.log("   🔬 Permohonan Riset: 20 (mahasiswa)");
  console.log("   📋 Permohonan PPID: 20");
  console.log("   📣 Pengaduan: 20");
  console.log("   📝 Pengajuan Pajak: 20 (keberatan & perubahan)");
  console.log("   🔔 Notifikasi: 50");
  console.log("   📜 Audit Log: 30");
  console.log("   🗺️  Zona ZNT: 12");
  console.log("   🏘️  Data Pasar: 25");
  console.log("   📊 Penilaian NJOP: 25");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
