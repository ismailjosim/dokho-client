import bdAddress from 'address-bd';

export type SelectOption = {
  value: string;
  label: string;
  id?: number;
};

export const serviceOptions: SelectOption[] = [
  { value: 'প্লাম্বার', label: 'প্লাম্বার' },
  { value: 'ইলেকট্রিশিয়ান', label: 'ইলেকট্রিশিয়ান' },
  { value: 'রং মিস্ত্রি', label: 'রং মিস্ত্রি' },
  { value: 'কাঠ মিস্ত্রি', label: 'কাঠ মিস্ত্রি' },
  { value: 'রাজ মিস্ত্রি', label: 'রাজ মিস্ত্রি' },
  { value: 'টাইলস মিস্ত্রি', label: 'টাইলস মিস্ত্রি' },
  { value: 'এসি টেকনিশিয়ান', label: 'এসি টেকনিশিয়ান' },
  { value: 'ওয়েল্ডিং মিস্ত্রি', label: 'ওয়েল্ডিং মিস্ত্রি' },
  { value: 'গ্লাস মিস্ত্রি', label: 'গ্লাস মিস্ত্রি' },
  { value: 'থাই/অ্যালুমিনিয়াম মিস্ত্রি', label: 'থাই/অ্যালুমিনিয়াম মিস্ত্রি' },
  { value: 'স্যানিটারি মিস্ত্রি', label: 'স্যানিটারি মিস্ত্রি' },
  { value: 'গৃহকর্মী', label: 'গৃহকর্মী' },
];

function formatLocationLabel(bnName: string, name: string) {
  return `${bnName} (${name})`;
}

export async function getDistrictOptions() {
  const districts = await bdAddress.getAllDistricts();

  return districts
    .map((district) => ({
      id: district.id,
      value: district.bnName,
      label: formatLocationLabel(district.bnName, district.name),
    }))
    .sort((a, b) => a.value.localeCompare(b.value, 'bn'));
}

export async function getUpazilaOptions(districtName?: string) {
  const districts = await bdAddress.getAllDistricts();
  const district = districts.find(
    (item) =>
      item.bnName === districtName || item.name === districtName || item.slug === districtName
  );
  const upazilas = district
    ? await bdAddress.getUpazilasByDistrict(district.id)
    : await bdAddress.getAllUpazilas();

  return upazilas
    .map((upazila) => ({
      id: upazila.id,
      value: upazila.bnName,
      label: formatLocationLabel(upazila.bnName, upazila.name),
    }))
    .sort((a, b) => a.value.localeCompare(b.value, 'bn'));
}

export function findOption(options: SelectOption[], value?: string | null) {
  if (!value) return null;

  return options.find((option) => option.value === value || option.label === value) || null;
}
