export interface PackageRequestBody {
    package_name: string;
    subjects: string[]; // UUIDs as strings
    package_fees: number;
}