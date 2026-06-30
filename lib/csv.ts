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
  return {
    id: `profile-${index}`,
    linkedinUrl: row['LinkedIn URL'] || row['linkedin_url'] || row['Profile URL'] || row['url'] || '',
    firstName: row['First Name'] || row['first_name'] || row['firstName'] || '',
    lastName: row['Last Name'] || row['last_name'] || row['lastName'] || '',
    title: row['Job Title'] || row['title'] || row['Position'] || row['Headline'] || '',
    company: row['Company'] || row['company'] || row['Current Company'] || '',
    location: row['Location'] || row['location'] || '',
    industry: row['Industry'] || row['industry'] || '',
  };
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
