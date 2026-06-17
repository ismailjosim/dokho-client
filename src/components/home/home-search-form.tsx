'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-field';
import { bn } from '@/lib/bengali';
import {
  getDistrictOptions,
  type SelectOption,
} from '@/lib/location-options';
import { getWorkerServiceOptions } from '@/lib/service-options';

export function HomeSearchForm() {
  const router = useRouter();
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      const [services, districts] = await Promise.all([
        getWorkerServiceOptions(),
        getDistrictOptions(),
      ]);

      if (!isMounted) return;

      setServiceOptions(services);
      setSelectedSkill(services[0] || null);
      setDistrictOptions(districts);
      setSelectedDistrict(
        districts.find((option) => option.value === 'ঢাকা') || districts[0] || null
      );
    }

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (selectedSkill?.value) params.set('skill', selectedSkill.value);
    if (selectedDistrict?.value) params.set('district', selectedDistrict.value);

    router.push(`/workers?${params.toString()}`);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="home-skill">{bn.field.skill}</Label>
        <SelectField
          inputId="home-skill"
          name="skill"
          options={serviceOptions}
          value={selectedSkill}
          placeholder="সেবা নির্বাচন করুন"
          onChange={setSelectedSkill}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="home-district">{bn.field.district}</Label>
        <SelectField
          inputId="home-district"
          name="district"
          options={districtOptions}
          value={selectedDistrict}
          placeholder="জেলা নির্বাচন করুন"
          onChange={setSelectedDistrict}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="area">{bn.field.area}</Label>
        <Input id="area" placeholder="যেমন: মিরপুর ১০" />
      </div>
      <Button className="w-full">
        <Search />
        {bn.action.viewResults}
      </Button>
    </form>
  );
}
