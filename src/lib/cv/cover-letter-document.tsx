import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 60, fontFamily: "Helvetica", fontSize: 11, color: "#1a1a2e", lineHeight: 1.6 },
  header: { marginBottom: 20 },
  name: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  contact: { fontSize: 9, color: "#555" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#0e7490", marginTop: 6, marginBottom: 18 },
  date: { fontSize: 11, marginBottom: 14 },
  recipient: { fontSize: 11, marginBottom: 18 },
  paragraph: { fontSize: 11, marginBottom: 12, lineHeight: 1.55 },
  signoff: { fontSize: 11, marginTop: 18 },
  signature: { fontSize: 11, fontWeight: 700, marginTop: 4 },
});

export type CoverLetterPdfData = {
  candidate: { name: string; email: string; phone?: string; location?: string };
  recipient: { company: string; role: string };
  date: string;
  paragraphs: string[];
  signoff: string;
};

export function CoverLetterPdfDocument({ data }: { data: CoverLetterPdfData }) {
  return (
    <Document title={`${data.candidate.name} — Cover letter — ${data.recipient.company}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.candidate.name}</Text>
          <Text style={styles.contact}>
            {[data.candidate.email, data.candidate.phone, data.candidate.location].filter(Boolean).join("  •  ")}
          </Text>
          <View style={styles.divider} />
        </View>

        <Text style={styles.date}>{data.date}</Text>

        <View style={styles.recipient}>
          <Text>Hiring Team</Text>
          <Text>{data.recipient.company}</Text>
          <Text style={{ marginTop: 8 }}>Re: {data.recipient.role}</Text>
        </View>

        {data.paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>{p}</Text>
        ))}

        <Text style={styles.signoff}>{data.signoff}</Text>
        <Text style={styles.signature}>{data.candidate.name}</Text>
      </Page>
    </Document>
  );
}
