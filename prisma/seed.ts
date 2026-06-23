import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing database nodes...");
  
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.taxObject.deleteMany();
  await prisma.researchRequest.deleteMany();
  await prisma.pPIDRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.news.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Database clean complete. Seeding database Bapenda Medan...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const officerPassword = await bcrypt.hash("officer123", 12);
  const userPassword = await bcrypt.hash("user123", 12);
  const mahasiswaPassword = await bcrypt.hash("mahasiswa123", 12);

  // 1. Seed Users
  const admin = await prisma.user.create({
    data: {
      id: "admin-id",
      name: "Administrator Utama",
      email: "admin@bapendamedan.go.id",
      password: adminPassword,
      role: "ADMIN",
      nik: "1271000000000001",
      phone: "061-4567890",
      address: "Jl. Jenderal Ahmad Yani No. 1, Medan Baru, Kota Medan",
      isActive: true,
    }
  });

  const officer = await prisma.user.create({
    data: {
      id: "officer-id",
      name: "Pratama Putra (Petugas)",
      email: "petugas@bapendamedan.go.id",
      password: officerPassword,
      role: "OFFICER",
      nik: "1271000000000002",
      phone: "081234567001",
      address: "Jl. Kapten Maulana Lubis No. 2, Medan Petisah, Kota Medan",
      isActive: true,
    }
  });

  const wp1 = await prisma.user.create({
    data: {
      id: "wp-id-1",
      name: "Budi Santoso",
      email: "wp@mail.com",
      password: userPassword,
      role: "USER",
      nik: "1271000000000099",
      phone: "081234567890",
      address: "Jl. Diponegoro No. 5, Medan Petisah, Kota Medan",
      isActive: true,
    }
  });

  const wp2 = await prisma.user.create({
    data: {
      id: "wp-id-2",
      name: "Hendra Wijaya",
      email: "wp2@mail.com",
      password: userPassword,
      role: "USER",
      nik: "1271000000000098",
      phone: "081234567891",
      address: "Jl. Jawa No. 8, Gang Bintang, Medan Baru, Kota Medan",
      isActive: true,
    }
  });

  const wp3 = await prisma.user.create({
    data: {
      id: "wp-id-3",
      name: "Siti Rahmawati",
      email: "wp3@mail.com",
      password: userPassword,
      role: "USER",
      nik: "1271000000000097",
      phone: "081234567892",
      address: "Jl. Thamrin No. 75, Medan Area, Kota Medan",
      isActive: true,
    }
  });

  const mhs = await prisma.user.create({
    data: {
      id: "mahasiswa-id",
      name: "Andi Wijaya (Mahasiswa)",
      email: "mhs@usu.ac.id",
      password: mahasiswaPassword,
      role: "MAHASISWA",
      nik: "1271000000000095",
      phone: "089876543210",
      institution: "Universitas Sumatera Utara",
      address: "Jl. Universitas No. 9, Medan Baru, Kota Medan",
      isActive: true,
    }
  });

  console.log("✅ Users Seeded Successfully.");

  // 2. Seed Tax Objects
  const taxObjectsData = [
    {
      id: "obj-pbb-1",
      nop: "12.72.01.001.001.0001",
      name: "Kantor Pusat CV Maju Jaya",
      address: "Jl. Kapten Maulana Lubis No. 1, Medan Petisah",
      lat: 3.5912,
      lng: 98.6723,
      status: "VERIFIED",
      type: "PBB",
      luasTanah: 1200,
      luasBangun: 800,
      njop: 4500000000,
      njoptkp: 12000000,
      ownerId: wp1.id,
    },
    {
      id: "obj-pbb-2",
      nop: "12.72.01.001.002.0002",
      name: "Rumah Tinggal Budi Santoso",
      address: "Jl. Diponegoro No. 5, Medan Petisah",
      lat: 3.5850,
      lng: 98.6700,
      status: "VERIFIED",
      type: "PBB",
      luasTanah: 300,
      luasBangun: 150,
      njop: 950000000,
      njoptkp: 12000000,
      ownerId: wp1.id,
    },
    {
      id: "obj-bphtb-1",
      nop: "12.72.01.001.003.0003",
      name: "Apartemen Center Point Unit 12B",
      address: "Jl. Jawa No. 8, Medan Timur",
      lat: 3.5930,
      lng: 98.6800,
      status: "VERIFIED",
      type: "BPHTB",
      luasTanah: 0,
      luasBangun: 72,
      njop: 1200000000,
      njoptkp: 0,
      ownerId: wp2.id,
    },
    {
      id: "obj-hotel-1",
      nop: "12.72.02.001.001.0005",
      name: "Hotel Grand Aston City Hall",
      address: "Jl. Balai Kota No. 1, Medan Baru",
      lat: 3.5905,
      lng: 98.6772,
      status: "VERIFIED",
      type: "Hotel",
      luasTanah: 5000,
      luasBangun: 12000,
      njop: 85000000000,
      njoptkp: 12000000,
      ownerId: wp2.id,
    },
    {
      id: "obj-resto-1",
      nop: "12.72.02.002.002.0006",
      name: "Restoran Lembur Kuring Medan",
      address: "Jl. T. Amir Hamzah No. 85, Medan Helvetia",
      lat: 3.6010,
      lng: 98.6582,
      status: "VERIFIED",
      type: "Restoran",
      luasTanah: 1500,
      luasBangun: 600,
      njop: 4800000000,
      njoptkp: 12000000,
      ownerId: wp3.id,
    },
    {
      id: "obj-pkb-1",
      nop: "12.72.01.001.004.0004",
      name: "Ruko Thamrin Plaza Blok A-4",
      address: "Jl. Thamrin No. 75, Medan Area",
      lat: 3.5880,
      lng: 98.6920,
      status: "PENDING",
      type: "PBB",
      luasTanah: 120,
      luasBangun: 240,
      njop: 1800000000,
      njoptkp: 12000000,
      ownerId: wp3.id,
    },
    {
      id: "obj-reklame-1",
      nop: "12.72.02.003.003.0007",
      name: "Papan Reklame Dinding Thamrin",
      address: "Jl. Thamrin Perempatan, Medan Area",
      lat: 3.5885,
      lng: 98.6925,
      status: "PENDING",
      type: "Reklame",
      luasTanah: 2,
      luasBangun: 24,
      njop: 150000000,
      njoptkp: 0,
      ownerId: wp3.id,
    }
  ];

  for (const obj of taxObjectsData) {
    await prisma.taxObject.create({
      data: obj
    });
  }

  console.log("✅ Tax Objects Seeded Successfully.");

  // 3. Seed Payments Distributed Over Jan - Jun 2026
  // Months: Jan (0), Feb (1), Mar (2), Apr (3), May (4), Jun (5)
  const paymentsData = [
    // January 2026
    {
      invoiceNumber: "BILL-2026-01-01",
      amount: 500000000, // 500jt
      taxPeriod: "2026",
      status: "PAID",
      method: "BANK_TRANSFER",
      paidAt: new Date("2026-01-15T09:00:00Z"),
      expiredAt: new Date("2026-02-15T23:59:59Z"),
      taxObjectId: "obj-pbb-1",
      userId: wp1.id,
      createdAt: new Date("2026-01-01T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-01-02",
      amount: 700000000, // 700jt
      taxPeriod: "2026",
      status: "PAID",
      method: "VA_BRI",
      paidAt: new Date("2026-01-20T14:30:00Z"),
      expiredAt: new Date("2026-02-20T23:59:59Z"),
      taxObjectId: "obj-bphtb-1",
      userId: wp2.id,
      createdAt: new Date("2026-01-02T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-01-03",
      amount: 300000000, // 300jt
      taxPeriod: "2026",
      status: "EXPIRED",
      expiredAt: new Date("2026-02-05T23:59:59Z"),
      taxObjectId: "obj-hotel-1",
      userId: wp2.id,
      createdAt: new Date("2026-01-05T08:00:00Z"),
    },

    // February 2026
    {
      invoiceNumber: "BILL-2026-02-01",
      amount: 950000000, // 950jt
      taxPeriod: "2026",
      status: "PAID",
      method: "BANK_TRANSFER",
      paidAt: new Date("2026-02-10T11:00:00Z"),
      expiredAt: new Date("2026-03-10T23:59:59Z"),
      taxObjectId: "obj-hotel-1",
      userId: wp2.id,
      createdAt: new Date("2026-02-01T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-02-02",
      amount: 500000000, // 500jt
      taxPeriod: "2026",
      status: "PAID",
      method: "VA_BNI",
      paidAt: new Date("2026-02-18T10:15:00Z"),
      expiredAt: new Date("2026-03-18T23:59:59Z"),
      taxObjectId: "obj-resto-1",
      userId: wp3.id,
      createdAt: new Date("2026-02-02T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-02-03",
      amount: 400000000, // 400jt
      taxPeriod: "2026",
      status: "PENDING",
      expiredAt: new Date("2026-03-05T23:59:59Z"),
      taxObjectId: "obj-pbb-2",
      userId: wp1.id,
      createdAt: new Date("2026-02-05T08:00:00Z"),
    },

    // March 2026
    {
      invoiceNumber: "BILL-2026-03-01",
      amount: 980000000, // 980jt
      taxPeriod: "2026",
      status: "PAID",
      method: "QRIS",
      paidAt: new Date("2026-03-12T16:45:00Z"),
      expiredAt: new Date("2026-04-12T23:59:59Z"),
      taxObjectId: "obj-hotel-1",
      userId: wp2.id,
      createdAt: new Date("2026-03-01T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-03-02",
      amount: 200000000, // 200jt
      taxPeriod: "2026",
      status: "PENDING",
      expiredAt: new Date("2026-04-05T23:59:59Z"),
      taxObjectId: "obj-resto-1",
      userId: wp3.id,
      createdAt: new Date("2026-03-05T08:00:00Z"),
    },

    // April 2026
    {
      invoiceNumber: "BILL-2026-04-01",
      amount: 1250000000, // 1.25M
      taxPeriod: "2026",
      status: "PAID",
      method: "VA_BRI",
      paidAt: new Date("2026-04-14T09:20:00Z"),
      expiredAt: new Date("2026-05-14T23:59:59Z"),
      taxObjectId: "obj-hotel-1",
      userId: wp2.id,
      createdAt: new Date("2026-04-01T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-04-02",
      amount: 500000000, // 500jt
      taxPeriod: "2026",
      status: "PAID",
      method: "BANK_TRANSFER",
      paidAt: new Date("2026-04-20T11:40:00Z"),
      expiredAt: new Date("2026-05-20T23:59:59Z"),
      taxObjectId: "obj-pbb-1",
      userId: wp1.id,
      createdAt: new Date("2026-04-02T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-04-03",
      amount: 500000000, // 500jt
      taxPeriod: "2026",
      status: "PENDING",
      expiredAt: new Date("2026-05-05T23:59:59Z"),
      taxObjectId: "obj-resto-1",
      userId: wp3.id,
      createdAt: new Date("2026-04-05T08:00:00Z"),
    },

    // May 2026
    {
      invoiceNumber: "BILL-2026-05-01",
      amount: 1500000000, // 1.5M
      taxPeriod: "2026",
      status: "PAID",
      method: "VA_BNI",
      paidAt: new Date("2026-05-10T13:00:00Z"),
      expiredAt: new Date("2026-06-10T23:59:59Z"),
      taxObjectId: "obj-hotel-1",
      userId: wp2.id,
      createdAt: new Date("2026-05-01T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-05-02",
      amount: 600000000, // 600jt
      taxPeriod: "2026",
      status: "PAID",
      method: "BANK_TRANSFER",
      paidAt: new Date("2026-05-25T15:30:00Z"),
      expiredAt: new Date("2026-06-25T23:59:59Z"),
      taxObjectId: "obj-resto-1",
      userId: wp3.id,
      createdAt: new Date("2026-05-02T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-05-03",
      amount: 600000000, // 600jt
      taxPeriod: "2026",
      status: "PENDING",
      expiredAt: new Date("2026-06-05T23:59:59Z"),
      taxObjectId: "obj-pbb-1",
      userId: wp1.id,
      createdAt: new Date("2026-05-05T08:00:00Z"),
    },

    // June 2026
    {
      invoiceNumber: "BILL-2026-06-01",
      amount: 1000000000, // 1M
      taxPeriod: "2026",
      status: "PAID",
      method: "QRIS",
      paidAt: new Date("2026-06-12T09:15:00Z"),
      expiredAt: new Date("2026-07-12T23:59:59Z"),
      taxObjectId: "obj-pbb-1",
      userId: wp1.id,
      createdAt: new Date("2026-06-01T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-06-02",
      amount: 890000000, // 890jt
      taxPeriod: "2026",
      status: "PAID",
      method: "VA_BRI",
      paidAt: new Date("2026-06-18T10:45:00Z"),
      expiredAt: new Date("2026-07-18T23:59:59Z"),
      taxObjectId: "obj-resto-1",
      userId: wp3.id,
      createdAt: new Date("2026-06-02T08:00:00Z"),
    },
    {
      invoiceNumber: "BILL-2026-06-03",
      amount: 450000000, // 450jt
      taxPeriod: "2026",
      status: "PENDING",
      expiredAt: new Date("2026-07-05T23:59:59Z"),
      taxObjectId: "obj-hotel-1",
      userId: wp2.id,
      createdAt: new Date("2026-06-05T08:00:00Z"),
    }
  ];

  for (const pay of paymentsData) {
    await prisma.payment.create({
      data: pay
    });
  }

  console.log("✅ Payments Seeded Successfully.");

  // 4. Seed Submissions (Dokumentasi Pengajuan)
  await prisma.researchRequest.create({
    data: {
      requestNumber: "RES-20260001",
      title: "Korelasi Nilai NJOP terhadap Perkembangan Kawasan Komersial Medan Baru",
      description: "Penelitian akhir untuk menganalisis perkembangan tarif fiskal di Kecamatan Medan Baru dari tahun 2020 hingga 2025.",
      institution: "Universitas Sumatera Utara",
      supervisorName: "Prof. Dr. Ir. H. Supriadi, M.T.",
      supervisorNip: "197001011995011002",
      dataNeeded: "Peta bidang tanah dan tabel rata-rata nilai NJOP per kelurahan di Medan Baru",
      purpose: "Memenuhi syarat penulisan tesis Magister Perencanaan Wilayah",
      status: "APPROVED",
      reviewNotes: "Dokumen lengkap dan pengantar dari Dekan FT USU terverifikasi.",
      userId: mhs.id,
    }
  });

  await prisma.researchRequest.create({
    data: {
      requestNumber: "RES-20260002",
      title: "Pemetaan Pola Distribusi Kepatuhan Pajak Hotel & Restoran di Medan Petisah",
      description: "Analisis spasial lokasi usaha hotel dan restoran dengan tingkat kelancaran pembayaran pajak daerah.",
      institution: "Politeknik Negeri Medan",
      supervisorName: "Drs. Ahmad Rasyid, M.Si.",
      dataNeeded: "Data koordinat hotel/restoran terdaftar dan rekap pembayaran 2025 anonymized",
      purpose: "Penelitian Skripsi Terapan Akuntansi Sektor Publik",
      status: "PENDING",
      userId: mhs.id,
    }
  });

  await prisma.pPIDRequest.create({
    data: {
      ticketNumber: "PPID-20260001",
      title: "Laporan Realisasi Penerimaan PAD Sektor PBB Kota Medan Tahun 2025",
      description: "Memohon salinan resmi laporan realisasi anggaran untuk bahan kajian komparatif PAD Kota Medan.",
      informationType: "DATA_STATISTIK",
      urgency: "NORMAL",
      status: "RESOLVED",
      response: "Laporan realisasi anggaran tahun 2025 telah diunggah pada portal PPID Bapenda Medan sub-menu Laporan Keuangan.",
      userId: wp1.id,
    }
  });

  await prisma.pPIDRequest.create({
    data: {
      ticketNumber: "PPID-20260002",
      title: "Rincian Alokasi Dana Bagi Hasil Pajak Daerah ke Kecamatan",
      description: "Meminta rincian persentase dan nominal pembagian hasil retribusi daerah ke masing-masing kecamatan tahun berjalan.",
      informationType: "ANGGARAN",
      urgency: "URGENT",
      status: "OPEN",
      userId: wp2.id,
    }
  });

  await prisma.complaint.create({
    data: {
      ticketNumber: "ADU-20260001",
      subject: "Pelayanan Loket Verifikasi BPHTB Medan Baru Lambat",
      description: "Antrean verifikasi BPHTB sangat panjang dan hanya dilayani oleh satu petugas sehingga memakan waktu lebih dari 3 jam.",
      category: "PELAYANAN",
      priority: "HIGH",
      status: "IN_PROGRESS",
      response: "Kami mohon maaf atas ketidaknyamanan Anda. Penambahan petugas loket cadangan telah dilakukan untuk mengurai antrean.",
      userId: wp2.id,
    }
  });

  await prisma.complaint.create({
    data: {
      ticketNumber: "ADU-20260002",
      subject: "Error Gagal Pembayaran QRIS via Mobile Banking BRI",
      description: "Saat scan QRIS kode billing SIPADA di mobile banking BRI selalu muncul notifikasi Transaksi Gagal, padahal saldo terpotong.",
      category: "TEKNIS_SISTEM",
      priority: "NORMAL",
      status: "OPEN",
      userId: wp3.id,
    }
  });

  console.log("✅ Submissions Seeded Successfully.");

  // 5. Seed Notifications
  await prisma.notification.create({
    data: {
      title: "Database Backup Completed",
      message: "Proses backup database terjadwal harian telah diselesaikan dengan sukses pada server cadangan.",
      type: "SUCCESS",
      category: "SYSTEM",
      userId: admin.id,
    }
  });

  await prisma.notification.create({
    data: {
      title: "Pengaduan Baru Masuk",
      message: "Pengaduan terkait Sistem QRIS (ADU-20260002) membutuhkan verifikasi teknis segera.",
      type: "WARNING",
      category: "DASHBOARD",
      userId: admin.id,
    }
  });

  await prisma.notification.create({
    data: {
      title: "Verifikasi Objek Pajak Berhasil",
      message: "Objek Pajak NOP 12.72.01.001.001.0001 Anda telah diverifikasi oleh petugas.",
      type: "SUCCESS",
      category: "DASHBOARD",
      userId: wp1.id,
    }
  });

  console.log("✅ Notifications Seeded Successfully.");

  // 6. Seed News & Announcements
  const newsData = [
    {
      title: "Digitalisasi Pajak Daerah: Bapenda Medan Luncurkan SIPADA",
      summary: "Inovasi terbaru Pemko Medan untuk mempermudah wajib pajak dalam melaporkan dan membayar pajak daerah secara online.",
      content: "Badan Pendapatan Daerah (Bapenda) Kota Medan resmi meluncurkan Sistem Informasi Pajak Daerah (SIPADA). Sistem ini dirancang untuk mengintegrasikan seluruh jenis pajak daerah dalam satu platform yang transparan dan akuntabel. Walikota Medan menekankan bahwa langkah ini adalah bagian dari upaya reformasi birokrasi menuju Medan Smart City. Pengguna kini dapat melakukan pendaftaran objek pajak, pelaporan omzet bulanan, hingga pencetakan bukti bayar secara mandiri dari rumah.",
      category: "Berita",
      authorId: admin.id,
      isActive: true,
    },
    {
      title: "Kenaikan Target PAD Kota Medan Tahun 2026",
      summary: "DPRD dan Pemko Medan sepakat menetapkan target Pendapatan Asli Daerah yang lebih optimis untuk mendukung pembangunan infrastruktur.",
      content: "Dalam rapat paripurna terbaru, target Pendapatan Asli Daerah (PAD) Kota Medan tahun 2026 diproyeksikan mengalami kenaikan signifikan. Hal ini didorong oleh membaiknya iklim investasi dan kepatuhan wajib pajak yang terus meningkat. Bapenda Medan berkomitmen untuk melakukan jemput bola melalui mobil layanan keliling dan intensifikasi pendataan objek pajak baru di wilayah Medan Utara dan Medan Johor.",
      category: "Berita",
      authorId: officer.id,
      isActive: true,
    },
    {
      title: "Relaksasi Pajak: Bebas Denda PBB S/D Juni 2026",
      summary: "Pemerintah Kota Medan memberikan keringanan penghapusan denda bagi wajib pajak yang memiliki tunggakan tahun-tahun sebelumnya.",
      content: "PENGUMUMAN RESMI: Dalam rangka memperingati Hari Jadi Kota Medan, Pemerintah Kota memberikan program relaksasi berupa penghapusan denda administratif untuk Pajak Bumi dan Bangunan (PBB) dan Pajak Restoran. Program ini berlaku mulai tanggal 1 Maret hingga 30 Juni 2026. Masyarakat dihimbau untuk memanfaatkan momentum ini guna melunasi tunggakan tanpa dikenakan sanksi bunga tambahan.",
      category: "Pengumuman",
      authorId: admin.id,
      isActive: true,
    }
  ];

  for (const news of newsData) {
    const slug = news.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();
    await prisma.news.create({
      data: {
        ...news,
        slug,
      }
    });
  }

  // 7. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      action: "UPDATE_SYSTEM_SETTINGS",
      table: "SystemConfig",
      recordId: "global-config",
      userId: admin.id,
      oldValue: { budgetYear: "2025" },
      newValue: { budgetYear: "2026" },
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "VERIFY_TAX_OBJECT",
      table: "TaxObject",
      recordId: "obj-pbb-1",
      userId: officer.id,
      oldValue: { status: "PENDING" },
      newValue: { status: "VERIFIED" },
    }
  });

  console.log("✅ News, Articles & Logs Seeded Successfully.");
  console.log("\n🎉 Seeding Completed successfully!");
  console.log("📋 Available Accounts:");
  console.log("   Admin     → admin@bapendamedan.go.id   / admin123");
  console.log("   Officer   → petugas@bapendamedan.go.id / officer123");
  console.log("   WP User   → wp@mail.com                / user123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
