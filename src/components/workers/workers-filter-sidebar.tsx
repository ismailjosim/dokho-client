import { FormEvent } from 'react';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-field';
import type { SelectOption } from '@/lib/location-options';

type WorkersFilterSidebarProps = {
  districtOptions: SelectOption[];
  filterKey: string;
  isLoading: boolean;
  resultCount: number;
  selectedDistrict: SelectOption | null;
  selectedSkill: SelectOption | null;
  serviceOptions: SelectOption[];
  onReset: () => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onSelectedDistrictChange: (option: SelectOption | null) => void;
  onSelectedSkillChange: (option: SelectOption | null) => void;
};

export function WorkersFilterSidebar({
  districtOptions,
  filterKey,
  isLoading,
  resultCount,
  selectedDistrict,
  selectedSkill,
  serviceOptions,
  onReset,
  onSearch,
  onSelectedDistrictChange,
  onSelectedSkillChange,
}: WorkersFilterSidebarProps) {
  return (
    <aside className="h-fit rounded-lg border bg-card p-4 shadow-sm lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-5 text-primary" />
          <h2 className="text-lg font-bold">ফিল্টার সমূহ</h2>
        </div>
        <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
          {resultCount}
        </span>
      </div>
      <form key={filterKey} className="space-y-4" onSubmit={onSearch}>
        <div className="space-y-2">
          <Label htmlFor="skill">আমি খুঁজছি</Label>
          <SelectField
            inputId="skill"
            name="skill"
            options={serviceOptions}
            value={selectedSkill}
            placeholder="সেবা নির্বাচন করুন"
            onChange={onSelectedSkillChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">ঠিকানা</Label>
          <SelectField
            inputId="district"
            name="district"
            options={districtOptions}
            value={selectedDistrict}
            placeholder="জেলা নির্বাচন করুন"
            onChange={onSelectedDistrictChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onReset} disabled={isLoading}>
            ফিল্টার মুছুন
          </Button>
          <Button disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
            খুঁজুন
          </Button>
        </div>
      </form>
    </aside>
  );
}
