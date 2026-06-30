import Papa from 'papaparse';
import type { Profile } from './store';

export function parseCSV(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as Record<string, string>[]),
      error: reject,
    });
  });
}

export function normalizeProfile(row: Record<string, string>, index: number): Profile {
  // Extract known display fields with fallbacks for common column name variations
  const base: Profile = {
    id: row['id'] || `profile-${index}`,
    linkedinUrl: row['linkedinUrlProfile'] || row['LinkedIn URL'] || row['linkedin_url'] || row['url'] || '',
    firstName: row['firstName'] || row['First Name'] || row['first_name'] || '',
    lastName: row['lastName'] || row['Last Name'] || row['last_name'] || '',
    fullName: row['fullName'] || row['Full Name'] || '',
    title: row['title'] || row['Job Title'] || row['Position'] || row['Headline'] || '',
    company: row['company'] || row['Company'] || row['Current Company'] || '',
    companyId: row['companyId'] || '',
    companyLocation: row['companyLocation'] || '',
    companyDescription: row['companyDescription'] || '',
    companySize: row['companySize'] || '',
    companyWebsite: row['companyWebsite'] || '',
    industry: row['industry'] || row['Industry'] || '',
    location: row['location'] || row['Location'] || '',
    summary: row['summary'] || row['Summary'] || '',
    isPremium: row['isPremium'] || '',
    openProfile: row['openProfile'] || '',
    type: row['type'] || '',
  };

  // Also carry through ALL other columns from the CSV so scoring AI sees everything
  return { ...row, ...base };
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
