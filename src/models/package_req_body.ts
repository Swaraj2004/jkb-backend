export interface PackageRequestBody {
  package_name: string;
  subjects: string[]; // UUIDs as strings
  year: number;
  package_fees: number;
}
