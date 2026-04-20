import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a2e" },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  divider: { borderBottomWidth: 1.5, borderBottomColor: "#0e7490", marginBottom: 8 },
  contact: { fontSize: 9, color: "#555", marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0e7490",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e2e2",
    paddingBottom: 3,
    marginBottom: 6,
    marginTop: 12,
  },
  summary: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  competenciesRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  competency: {
    fontSize: 8,
    color: "#0e7490",
    backgroundColor: "#ecfeff",
    padding: 3,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  jobHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  jobCompany: { fontSize: 11, fontWeight: 700, color: "#7c3aed" },
  jobPeriod: { fontSize: 9, color: "#777" },
  jobRole: { fontSize: 10, fontWeight: 700, marginBottom: 4 },
  bullet: { fontSize: 9.5, lineHeight: 1.4, marginBottom: 2, paddingLeft: 8 },
  projectTitle: { fontSize: 10, fontWeight: 700, color: "#7c3aed", marginTop: 4 },
  projectDesc: { fontSize: 9.5, lineHeight: 1.4, marginTop: 2 },
  projectTech: { fontSize: 8.5, color: "#888", marginTop: 2 },
  link: { color: "#0e7490", textDecoration: "none" },
  small: { fontSize: 9, color: "#666" },
});

export type CvPdfData = {
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  location?: string;
  summary: string;
  competencies: string[];
  experience: Array<{
    company: string;
    role: string;
    period: string;
    location?: string;
    bullets: string[];
  }>;
  projects: Array<{
    title: string;
    url?: string;
    description: string;
    tech: string;
  }>;
  skills: Array<{ category: string; items: string }>;
  certifications: Array<{ title: string; issuer: string; year: string; url?: string }>;
  education: Array<{ title: string; org: string; period: string; notes?: string }>;
};

export function CvPdfDocument({ data }: { data: CvPdfData }) {
  return (
    <Document title={`${data.name} — CV`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{data.name}</Text>
        <View style={styles.divider} />
        <Text style={styles.contact}>
          {[data.phone, data.email, data.linkedinUrl, data.portfolioUrl, data.location]
            .filter(Boolean)
            .join("  •  ")}
        </Text>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summary}>{data.summary}</Text>

        {/* Competencies */}
        {data.competencies.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={styles.competenciesRow}>
              {data.competencies.map((c) => (
                <Text key={c} style={styles.competency}>{c}</Text>
              ))}
            </View>
          </>
        )}

        {/* Experience */}
        <Text style={styles.sectionTitle}>Work Experience</Text>
        {data.experience.map((j, i) => (
          <View key={i} wrap={false} style={{ marginBottom: 8 }}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobCompany}>{j.company}</Text>
              <Text style={styles.jobPeriod}>{j.period}</Text>
            </View>
            <Text style={styles.jobRole}>
              {j.role}
              {j.location ? <Text style={styles.small}>  —  {j.location}</Text> : null}
            </Text>
            {j.bullets.map((b, k) => (
              <Text key={k} style={styles.bullet}>• {b}</Text>
            ))}
          </View>
        ))}

        {/* Projects */}
        <Text style={styles.sectionTitle}>Projects</Text>
        {data.projects.map((p, i) => (
          <View key={i} wrap={false} style={{ marginBottom: 6 }}>
            <Text style={styles.projectTitle}>
              {p.url ? <Link src={p.url} style={styles.link}>{p.title}</Link> : p.title}
            </Text>
            <Text style={styles.projectDesc}>{p.description}</Text>
            <Text style={styles.projectTech}>{p.tech}</Text>
          </View>
        ))}

        {/* Education */}
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((e, i) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <View style={styles.jobHeader}>
              <Text style={{ fontSize: 10, fontWeight: 700 }}>
                {e.title} <Text style={{ color: "#7c3aed" }}>— {e.org}</Text>
              </Text>
              <Text style={styles.jobPeriod}>{e.period}</Text>
            </View>
            {e.notes && <Text style={styles.small}>{e.notes}</Text>}
          </View>
        ))}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((c, i) => (
              <View key={i} style={styles.jobHeader}>
                <Text style={{ fontSize: 9.5 }}>
                  {c.url ? <Link src={c.url} style={styles.link}>{c.title}</Link> : c.title}
                  <Text style={{ color: "#7c3aed" }}>  —  {c.issuer}</Text>
                </Text>
                <Text style={styles.small}>{c.year}</Text>
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        <Text style={styles.sectionTitle}>Skills</Text>
        {data.skills.map((s, i) => (
          <Text key={i} style={{ fontSize: 9.5, marginBottom: 2 }}>
            <Text style={{ fontWeight: 700 }}>{s.category}: </Text>
            {s.items}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
