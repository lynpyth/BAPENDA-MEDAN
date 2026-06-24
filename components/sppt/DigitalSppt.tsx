import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottom: "2px double #1f2937",
    paddingBottom: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "medium",
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  spptTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  nopLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 10,
    border: "1px solid #9ca3af",
    borderRadius: 4,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: 4,
    marginHorizontal: -8,
    marginTop: -8,
    marginBottom: 6,
    borderBottom: "1px solid #9ca3af",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  colLeft: {
    width: "150px",
    fontWeight: "bold",
  },
  colRight: {
    flex: 1,
  },
  table: {
    marginVertical: 6,
    border: "1px solid #d1d5db",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    fontWeight: "bold",
    borderBottom: "1px solid #d1d5db",
    padding: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    padding: 4,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
  },
  tableCellLeft: {
    width: "100px",
    paddingLeft: 4,
  },
  tableCellRight: {
    width: "80px",
    textAlign: "right",
    paddingRight: 4,
  },
  tableCellCenter: {
    width: "60px",
    textAlign: "center",
  },
  tableCellFlex: {
    flex: 1,
  },
  calcContainer: {
    marginTop: 6,
    padding: 6,
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  boldText: {
    fontWeight: "bold",
  },
  footer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureContainer: {
    width: "180px",
    alignItems: "center",
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    border: "1px solid #9ca3af",
    marginVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  qrText: {
    fontSize: 6,
    color: "#6b7280",
    textAlign: "center",
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "25%",
    fontSize: 48,
    color: "rgba(229, 231, 235, 0.4)",
    transform: "rotate(-30deg)",
    fontWeight: "bold",
  }
});

interface SpptData {
  id: string;
  spptNumber: string;
  taxPeriod: string;
  njop: any;
  njoptkp: any;
  taxObjectVal: any;
  isDownloaded: boolean;
  createdAt: any;
  taxObject: {
    nop: string;
    name: string;
    address: string;
    luasTanah: number | null;
    luasBangun: number | null;
  };
  user: {
    name: string | null;
    email: string | null;
    nik: string | null;
    address: string | null;
  };
}

function formatCurrency(val: number | string | null) {
  if (val === null || val === undefined) return "Rp 0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

export const DigitalSpptDocument = ({ data }: { data: SpptData }) => {
  const njopVal = typeof data.njop === "string" ? parseFloat(data.njop) : Number(data.njop || 0);
  const njoptkpVal = typeof data.njoptkp === "string" ? parseFloat(data.njoptkp) : Number(data.njoptkp || 0);
  const taxObjectVal = typeof data.taxObjectVal === "string" ? parseFloat(data.taxObjectVal) : Number(data.taxObjectVal || 0);
  
  // Calculate base values
  const luasT = data.taxObject.luasTanah || 0;
  const luasB = data.taxObject.luasBangun || 0;
  
  // Distribute NJOP proportionally (simplified for SPPT display)
  const njopTanahTotal = luasT > 0 ? (njopVal * 0.6) : 0;
  const njopBangunTotal = luasB > 0 ? (luasT > 0 ? njopVal * 0.4 : njopVal) : 0;
  
  const njopTanahPerM2 = luasT > 0 ? njopTanahTotal / luasT : 0;
  const njopBangunPerM2 = luasB > 0 ? njopBangunTotal / luasB : 0;

  const njopUntukPbb = Math.max(0, njopVal - njoptkpVal);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>BAPENDA MEDAN</Text>

        {/* Kop Surat */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pemerintah Kota Medan</Text>
          <Text style={styles.headerTitle}>Badan Pendapatan Daerah</Text>
          <Text style={styles.headerSubtitle}>Jalan Balaikota No. 1, Kota Medan, Sumatera Utara</Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.spptTitle}>SURAT PEMBERITAHUAN PAJAK TERUTANG</Text>
          <Text style={styles.headerSubtitle}>PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN (PBB-P2)</Text>
          <Text style={styles.nopLabel}>TAHUN PAJAK: {data.taxPeriod}</Text>
        </View>

        {/* SPPT Number / NOP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A. IDENTITAS OBJEK & WAJIB PAJAK</Text>
          <View style={styles.row}>
            <Text style={styles.colLeft}>NOMOR OBJEK PAJAK (NOP):</Text>
            <Text style={[styles.colRight, styles.boldText]}>{data.taxObject.nop}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLeft}>LETAK OBJEK PAJAK:</Text>
            <Text style={styles.colRight}>{data.taxObject.address}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLeft}>NAMA WAJIB PAJAK:</Text>
            <Text style={[styles.colRight, styles.boldText]}>{data.user.name || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLeft}>ALAMAT WAJIB PAJAK:</Text>
            <Text style={styles.colRight}>{data.user.address || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLeft}>NIK WAJIB PAJAK:</Text>
            <Text style={styles.colRight}>{data.user.nik || "—"}</Text>
          </View>
        </View>

        {/* Rincian Luas & NJOP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>B. RINCIAN OBJEK PAJAK & NJOP</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellLeft}>Golongan Objek</Text>
              <Text style={styles.tableCellCenter}>Luas (m²)</Text>
              <Text style={styles.tableCellRight}>NJOP per m² (Rp)</Text>
              <Text style={styles.tableCellRight}>Total NJOP (Rp)</Text>
            </View>
            
            {/* Bumi */}
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>1. BUMI (TANAH)</Text>
              <Text style={styles.tableCellCenter}>{luasT}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(njopTanahPerM2)}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(njopTanahTotal)}</Text>
            </View>

            {/* Bangunan */}
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>2. BANGUNAN</Text>
              <Text style={styles.tableCellCenter}>{luasB}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(njopBangunPerM2)}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(njopBangunTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Perhitungan Pajak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>C. PERHITUNGAN PAJAK BUMI DAN BANGUNAN</Text>
          <View style={styles.calcContainer}>
            <View style={styles.calcRow}>
              <Text>TOTAL NILAI JUAL OBJEK PAJAK (NJOP Bumi + Bangunan)</Text>
              <Text style={styles.boldText}>{formatCurrency(njopVal)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text>NILAI JUAL OBJEK PAJAK TIDAK KENA PAJAK (NJOPTKP)</Text>
              <Text>{formatCurrency(njoptkpVal)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text>NILAI JUAL OBJEK PAJAK UNTUK PERHITUNGAN PAJAK</Text>
              <Text style={styles.boldText}>{formatCurrency(njopUntukPbb)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text>TARIF PAJAK EFEKTIF (TARIF PBB-P2 KOTA MEDAN)</Text>
              <Text>0.15%</Text>
            </View>
            <View style={[styles.calcRow, { borderTop: "1px solid #d1d5db", marginTop: 4, paddingTop: 4 }]}>
              <Text style={styles.boldText}>PAJAK BUMI DAN BANGUNAN YANG TERUTANG</Text>
              <Text style={[styles.boldText, { fontSize: 11, color: "#b91c1c" }]}>
                {formatCurrency(taxObjectVal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Informasi Pembayaran & Jatuh Tempo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>D. INFORMASI JATUH TEMPO & TEMPAT PEMBAYARAN</Text>
          <View style={styles.row}>
            <Text style={styles.colLeft}>TANGGAL JATUH TEMPO:</Text>
            <Text style={[styles.colRight, styles.boldText, { color: "#b91c1c" }]}>
              31 AGUSTUS {data.taxPeriod}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLeft}>TEMPAT PEMBAYARAN:</Text>
            <Text style={styles.colRight}>
              Bank Sumut, Bank Mandiri, BNI, BRI, Tokopedia, Indomaret, Alfamart, atau melalui aplikasi BAPENDA Medan (QRIS / Virtual Account)
            </Text>
          </View>
        </View>

        {/* Footer & Tanda Tangan */}
        <View style={styles.footer}>
          <View>
            <Text style={{ fontSize: 7, color: "#4b5563" }}>
              Dokumen ini diterbitkan secara digital oleh BAPENDA Kota Medan.
            </Text>
            <Text style={{ fontSize: 7, color: "#4b5563", marginTop: 2 }}>
              ID Dokumen: {data.id}
            </Text>
          </View>
          
          <View style={styles.signatureContainer}>
            <Text>KEPALA BADAN PENDAPATAN DAERAH</Text>
            <Text>KOTA MEDAN</Text>
            {/* Mock QR Code */}
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>VERIFIED</Text>
              <Text style={styles.qrText}>DIGITAL</Text>
              <Text style={styles.qrText}>SIGNATURE</Text>
            </View>
            <Text style={styles.boldText}>Drs. H. Endar Sutan Lubis, M.Si</Text>
            <Text style={{ fontSize: 7 }}>NIP. 19680512 199303 1 004</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
