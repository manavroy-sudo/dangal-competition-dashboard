export interface Leader {
  name: string;
  state: string;
  role?: string;
  file: string;
}

export const LEADERS: Leader[] = [
  { name: "Alok Mishra", state: "UP1", role: "RGM", file: "alok-mishra.jpg" },
  { name: "Amit Kumar", state: "NCR", role: "SH", file: "amit-kumar.jpeg" },
  { name: "Anil Zutsi", state: "J&K", role: "RGM", file: "anil-zutsi.webp" },
  { name: "Ashish Srivastava", state: "NCR", role: "RGM", file: "ashish-srivastava.jpeg" },
  { name: "Bellamkonda Umamahesh", state: "AP-TS", file: "bellamkonda-umamahesh.jpg" },
  { name: "Bhavesh", state: "Gujarat", role: "RGM", file: "bhavesh.jpeg" },
  { name: "Bimal", state: "Punjab", role: "SH", file: "bimal.jpeg" },
  { name: "Birendra", state: "Bihar", role: "RGM", file: "birendra.jpg" },
  { name: "Chandan", state: "West Bengal", role: "RH", file: "chandan.jpg" },
  { name: "Charles", state: "Gujarat", role: "RH", file: "charles.jpeg" },
  { name: "Dara Singh", state: "Rajasthan", role: "SH", file: "dara-singh.jpeg" },
  { name: "Gagandeep Singh", state: "Punjab", file: "gagandeep-singh.jpeg" },
  { name: "Jitender Kumar", state: "Himachal Pradesh", file: "jitender-kumar.jpg" },
  { name: "Kanniyappan Hari Kumar", state: "AP-TS", file: "kanniyappan-hari-kumar.jpg" },
  { name: "N Nithin Yadav", state: "Karnataka", file: "n-nithin-yadav.jpeg" },
  { name: "Pankaj", state: "Bihar, Jharkhand, Orissa", file: "pankaj.jpg" },
  { name: "Prince", state: "MP/CG", file: "prince.png" },
  { name: "Puneet Kumar", state: "UP1", role: "RH", file: "puneet-kumar.jpg" },
  { name: "Punit Bhati", state: "Rajasthan 2", file: "punit-bhati.jpeg" },
  { name: "Rahul Gupta", state: "UP1", role: "SH", file: "rahul-gupta.jpeg" },
  { name: "Rameez Ahmad Bhat", state: "J&K", file: "rameez-ahmad-bhat.jpg" },
  { name: "Rohan Oza", state: "Mumbai", file: "rohan-oza.jpg" },
  { name: "Sainath", state: "AP-TS (Andhra & Telangana)", file: "sainath.jpeg" },
  { name: "Shailendra Mahulkar", state: "ROM 1 & 2", file: "shailendra-mahulkar.jpg" },
  { name: "Sundeep Bhati", state: "Haryana", file: "sundeep-bhati.jpg" },
  { name: "Uttam Das", state: "Orissa", file: "uttam-das.webp" },
  { name: "Vijjith", state: "Kerala", file: "vijjith.webp" },
  { name: "Vikas Kumar", state: "Rajasthan 1", file: "vikas-kumar.webp" },
  { name: "Vikram Thakur", state: "J&K, HP, Chandigarh", file: "vikram-thakur.jpg" },
  { name: "Vinothbabu Nagarajan", state: "Tamil Nadu", file: "vinothbabu-nagarajan.jpg" },
  { name: "Vishal", state: "Bihar", file: "vishal.jpeg" },
];

// Maps a bout side's exact display name (as it comes out of the sheet) to the
// keyword(s) matched against LEADERS[].state to find that side's leader(s).
const SIDE_LEADER_KEYWORDS: Record<string, string[]> = {
  "UP1 + UK1 + UK2": ["UP1"],
  "Delhi + NCR + Haryana": ["NCR", "Haryana"],
  "West Bengal": ["West Bengal"],
  "J&K": ["J&K"],
  Bihar: ["Bihar"],
  Punjab: ["Punjab"],
  Jharkhand: ["Jharkhand"],
  "Tamil Nadu": ["Tamil Nadu"],
  Gujarat: ["Gujarat"],
  "Rajasthan 1 + 2": ["Rajasthan"],
  Karnataka: ["Karnataka"],
  "ROM 2": ["ROM 1 & 2", "ROM 2"],
  "MP/CG": ["MP/CG", "MP-CG"],
  Telengana: ["Telangana", "AP-TS"],
  Telangana: ["Telangana", "AP-TS"],
  "Himachal Pradesh": ["Himachal", "HP"],
  Pune: [],
  Chandigarh: ["Chandigarh"],
  "Andhra Pradesh": ["AP-TS", "Andhra"],
  "ROM 1": ["ROM 1 & 2", "ROM 1"],
  Orissa: ["Orissa"],
  Mumbai: ["Mumbai"],
  Kerala: ["Kerala"],
};

export function leadersForSide(sideName: string): Leader[] {
  const keys = SIDE_LEADER_KEYWORDS[sideName.trim()] || [];
  if (keys.length === 0) return [];
  return LEADERS.filter((l) => keys.some((k) => l.state.toLowerCase().includes(k.toLowerCase())));
}
