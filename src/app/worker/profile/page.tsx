'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, Hammer, ImageUp, Phone, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-field';
import {
  findOption,
  getDistrictOptions,
  getUpazilaOptions,
  type SelectOption,
} from '@/lib/location-options';
import {
  createServiceOption,
  getWorkerServiceOptions,
  mergeServiceOptions,
} from '@/lib/service-options';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

type AccountUser = {
  name: string;
  phone: string;
  role: string;
};

type MyWorkerProfile = {
  skill: string;
  district: string;
  upazila?: string | null;
  area?: string | null;
  profilePhotoUrl?: string | null;
  profilePhotoPublicId?: string | null;
  nidFrontUrl?: string | null;
  nidFrontPublicId?: string | null;
  nidBackUrl?: string | null;
  nidBackPublicId?: string | null;
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  status: 'PENDING' | 'APPROVED' | 'DEACTIVATED';
};

const PROFILE_QUERY = /* GraphQL */ `
  query WorkerProfileSetup {
    me {
      name
      phone
      role
    }
    myWorkerProfile {
      skill
      district
      upazila
      area
      profilePhotoUrl
      profilePhotoPublicId
      nidFrontUrl
      nidFrontPublicId
      nidBackUrl
      nidBackPublicId
      experienceYears
      availability
      status
    }
  }
`;

const UPSERT_PROFILE = /* GraphQL */ `
  mutation UpsertMyWorkerProfile($input: WorkerProfileInput!) {
    upsertMyWorkerProfile(input: $input) {
      id
      skill
      district
      upazila
      area
      profilePhotoUrl
      profilePhotoPublicId
      nidFrontUrl
      nidFrontPublicId
      nidBackUrl
      nidBackPublicId
      experienceYears
      status
      availability
    }
  }
`;

const UPLOAD_IMAGE = /* GraphQL */ `
  mutation UploadImage($input: UploadImageInput!) {
    uploadImage(input: $input) {
      url
      publicId
    }
  }
`;

type WorkerMediaField = 'profilePhoto' | 'nidFront' | 'nidBack';

type WorkerMedia = {
  profilePhotoUrl: string;
  profilePhotoPublicId: string;
  nidFrontUrl: string;
  nidFrontPublicId: string;
  nidBackUrl: string;
  nidBackPublicId: string;
};

const emptyMedia: WorkerMedia = {
  profilePhotoUrl: '',
  profilePhotoPublicId: '',
  nidFrontUrl: '',
  nidFrontPublicId: '',
  nidBackUrl: '',
  nidBackPublicId: '',
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('ছবি পড়া যায়নি'));
    reader.readAsDataURL(file);
  });
}

function UploadPreview({ label, url }: { label: string; url: string }) {
  if (!url) return null;

  return (
    <div className="rounded-md border bg-background p-2">
      <div
        aria-label={label}
        className="h-32 w-full rounded-sm bg-muted bg-cover bg-center"
        style={{ backgroundImage: `url(${url})` }}
      />
      <a
        className="mt-2 block text-sm font-medium text-primary hover:underline"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        {label} দেখুন
      </a>
    </div>
  );
}

export default function WorkerProfilePage() {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [profile, setProfile] = useState<MyWorkerProfile | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<WorkerMediaField | ''>('');
  const [media, setMedia] = useState<WorkerMedia>(emptyMedia);
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [upazilaOptions, setUpazilaOptions] = useState<SelectOption[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);
  const [selectedUpazila, setSelectedUpazila] = useState<SelectOption | null>(null);

  const loadProfile = useCallback(async () => {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে OTP দিয়ে লগইন করুন।');
      setIsLoading(false);
      return;
    }

    try {
      const result = await graphqlRequest<{
        me: AccountUser | null;
        myWorkerProfile: MyWorkerProfile | null;
      }>(PROFILE_QUERY, undefined, token);

      setAccount(result.me);
      setProfile(result.myWorkerProfile);
      setMedia({
        profilePhotoUrl: result.myWorkerProfile?.profilePhotoUrl || '',
        profilePhotoPublicId: result.myWorkerProfile?.profilePhotoPublicId || '',
        nidFrontUrl: result.myWorkerProfile?.nidFrontUrl || '',
        nidFrontPublicId: result.myWorkerProfile?.nidFrontPublicId || '',
        nidBackUrl: result.myWorkerProfile?.nidBackUrl || '',
        nidBackPublicId: result.myWorkerProfile?.nidBackPublicId || '',
      });
      setStatus(result.myWorkerProfile?.status === 'PENDING' ? 'আপনার প্রোফাইল অ্যাডমিন অনুমোদনের অপেক্ষায় আছে।' : '');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'প্রোফাইল তথ্য আনা যায়নি');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      const options = await getWorkerServiceOptions();

      if (!isMounted) return;

      const profileOption = createServiceOption(profile?.skill || '');
      const mergedOptions = profileOption ? mergeServiceOptions(options, [profileOption]) : options;

      setServiceOptions(mergedOptions);
      setSelectedSkill(findOption(mergedOptions, profile?.skill));
    }

    void loadServices();

    return () => {
      isMounted = false;
    };
  }, [profile?.skill]);

  useEffect(() => {
    let isMounted = true;

    async function loadDistricts() {
      const options = await getDistrictOptions();

      if (!isMounted) return;

      setDistrictOptions(options);
      setSelectedDistrict(findOption(options, profile?.district));
    }

    void loadDistricts();

    return () => {
      isMounted = false;
    };
  }, [profile?.district]);

  useEffect(() => {
    let isMounted = true;

    async function loadUpazilas() {
      const options = await getUpazilaOptions(selectedDistrict?.value || profile?.district);

      if (!isMounted) return;

      setUpazilaOptions(options);
      setSelectedUpazila(findOption(options, profile?.upazila));
    }

    void loadUpazilas();

    return () => {
      isMounted = false;
    };
  }, [profile?.district, profile?.upazila, selectedDistrict?.value]);

  function getFormError(formData: FormData) {
    const skill = selectedSkill?.value || '';
    const district = selectedDistrict?.value || '';
    const experienceYears = Number(formData.get('experienceYears') || 0);

    if (skill.length < 2) return 'সেবার নাম কমপক্ষে ২ অক্ষর দিন।';
    if (district.length < 2) return 'জেলার নাম কমপক্ষে ২ অক্ষর দিন।';
    if (!Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 60) {
      return 'অভিজ্ঞতা ০ থেকে ৬০ বছরের মধ্যে দিন।';
    }

    return '';
  }

  async function handleImageUpload(field: WorkerMediaField, file?: File) {
    if (!file) return;

    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে OTP দিয়ে লগইন করুন।');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setStatus('শুধু ছবি আপলোড করুন।');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setStatus('ছবির সাইজ ৪MB এর কম হতে হবে।');
      return;
    }

    setUploadingField(field);
    setStatus('');

    try {
      const result = await graphqlRequest<{ uploadImage: { url: string; publicId: string } }>(
        UPLOAD_IMAGE,
        {
          input: {
            file: await readFileAsDataUrl(file),
            folder: field === 'profilePhoto' ? 'PROFILE_PHOTOS' : 'NID_DOCUMENTS',
          },
        },
        token
      );
      const urlKey = `${field}Url` as keyof WorkerMedia;
      const publicIdKey = `${field}PublicId` as keyof WorkerMedia;

      setMedia((currentMedia) => ({
        ...currentMedia,
        [urlKey]: result.uploadImage.url,
        [publicIdKey]: result.uploadImage.publicId,
      }));
      setStatus('ছবি আপলোড হয়েছে। প্রোফাইল জমা দিলে অ্যাডমিন যাচাই করতে পারবেন।');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ছবি আপলোড হয়নি');
    } finally {
      setUploadingField('');
    }
  }

  function getFormKey() {
    if (!profile) return 'new-profile';

    return [
      profile.skill,
      profile.district,
      profile.upazila || '',
      profile.area || '',
      media.profilePhotoUrl,
      media.nidFrontUrl,
      media.nidBackUrl,
      profile.experienceYears,
      profile.availability,
      profile.status,
    ].join('|');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে OTP দিয়ে লগইন করুন।');
      setIsSubmitting(false);
      return;
    }

    const formError = getFormError(formData);

    if (formError) {
      setStatus(formError);
      setIsSubmitting(false);
      return;
    }

    try {
      const previousStatus = profile?.status;
      const result = await graphqlRequest<{
        upsertMyWorkerProfile: MyWorkerProfile;
      }>(
        UPSERT_PROFILE,
        {
          input: {
            skill: selectedSkill?.value || '',
            district: selectedDistrict?.value || '',
            upazila: selectedUpazila?.value || '',
            area: String(formData.get('area') || '').trim(),
            profilePhotoUrl: media.profilePhotoUrl,
            profilePhotoPublicId: media.profilePhotoPublicId,
            nidFrontUrl: media.nidFrontUrl,
            nidFrontPublicId: media.nidFrontPublicId,
            nidBackUrl: media.nidBackUrl,
            nidBackPublicId: media.nidBackPublicId,
            experienceYears: Number(formData.get('experienceYears') || 0),
            availability: String(formData.get('availability') || 'AVAILABLE'),
          },
        },
        token
      );

      setProfile(result.upsertMyWorkerProfile);
      setStatus(
        previousStatus === 'APPROVED'
          ? 'আপনার পরিবর্তন জমা হয়েছে। তথ্য পরিবর্তনের কারণে প্রোফাইল আবার অ্যাডমিন অনুমোদনের অপেক্ষায় আছে।'
          : 'প্রোফাইল জমা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনার প্রোফাইল পাবলিক লিস্টে দেখা যাবে।'
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'প্রোফাইল জমা দেওয়া যায়নি');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-8">
      <Button variant="ghost" asChild className="mb-6 w-fit px-0">
        <Link href="/">
          <ArrowLeft />
          হোমে ফিরুন
        </Link>
      </Button>
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Hammer className="size-5 text-primary" />
          <h1 className="text-2xl font-bold">কর্মীর প্রোফাইল</h1>
        </div>

        {isLoading ? (
          <p className="rounded-md bg-muted p-3 text-sm">প্রোফাইল তথ্য লোড হচ্ছে...</p>
        ) : null}

        {account ? (
          <div className="mb-5 grid gap-3 rounded-md border bg-background p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-primary" />
              <span className="font-medium">{account.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              <span>{account.phone}</span>
            </div>
          </div>
        ) : null}

        {profile?.status ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant={profile.status === 'APPROVED' ? 'success' : 'secondary'}>
              {profile.status === 'APPROVED' ? <CheckCircle2 /> : <Clock3 />}
              {profile.status === 'APPROVED'
                ? 'ভেরিফাইড'
                : profile.status === 'PENDING'
                  ? 'অনুমোদনের অপেক্ষায়'
                : 'নিষ্ক্রিয়'}
            </Badge>
          </div>
        ) : null}

        {profile?.status === 'APPROVED' ? (
          <p className="mb-5 rounded-md bg-muted p-3 text-sm leading-6">
            প্রোফাইলের সেবা, এলাকা বা অভিজ্ঞতা পরিবর্তন করলে সেটি আবার অনুমোদনের জন্য যাবে।
          </p>
        ) : null}

        <form key={getFormKey()} className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="skill">সেবা</Label>
            <SelectField
              inputId="skill"
              name="skill"
              options={serviceOptions}
              value={selectedSkill}
              placeholder="সেবা নির্বাচন করুন অথবা লিখুন"
              isCreatable
              onChange={setSelectedSkill}
              onCreateOption={(inputValue) => {
                const option = createServiceOption(inputValue);

                if (!option) return;

                setServiceOptions((currentOptions) => mergeServiceOptions(currentOptions, [option]));
                setSelectedSkill(option);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">জেলা</Label>
            <SelectField
              inputId="district"
              name="district"
              options={districtOptions}
              value={selectedDistrict}
              placeholder="জেলা নির্বাচন করুন"
              onChange={(option) => {
                setSelectedDistrict(option);
                setSelectedUpazila(null);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upazila">উপজেলা/থানা</Label>
            <SelectField
              inputId="upazila"
              name="upazila"
              options={upazilaOptions}
              value={selectedUpazila}
              placeholder={selectedDistrict ? 'উপজেলা/থানা নির্বাচন করুন' : 'আগে জেলা নির্বাচন করুন'}
              isDisabled={!selectedDistrict}
              onChange={setSelectedUpazila}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">এলাকা</Label>
            <Input id="area" name="area" placeholder="মিরপুর ১০" defaultValue={profile?.area || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profilePhoto">প্রোফাইল ছবি</Label>
            <Input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={(event) => void handleImageUpload('profilePhoto', event.target.files?.[0])}
            />
            <UploadPreview label="প্রোফাইল ছবি" url={media.profilePhotoUrl} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nidFront">NID সামনের ছবি</Label>
            <Input
              id="nidFront"
              type="file"
              accept="image/*"
              onChange={(event) => void handleImageUpload('nidFront', event.target.files?.[0])}
            />
            <UploadPreview label="NID সামনের ছবি" url={media.nidFrontUrl} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nidBack">NID পেছনের ছবি</Label>
            <Input
              id="nidBack"
              type="file"
              accept="image/*"
              onChange={(event) => void handleImageUpload('nidBack', event.target.files?.[0])}
            />
            <UploadPreview label="NID পেছনের ছবি" url={media.nidBackUrl} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceYears">অভিজ্ঞতা</Label>
            <Input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min={0}
              max={60}
              defaultValue={profile?.experienceYears ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">অবস্থা</Label>
            <select
              id="availability"
              name="availability"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={profile?.availability || 'AVAILABLE'}
            >
              <option value="AVAILABLE">এখন কাজ নিতে পারি</option>
              <option value="NOT_AVAILABLE">এখন ব্যস্ত</option>
            </select>
          </div>
          <Button className="sm:col-span-2" disabled={isSubmitting}>
            {isSubmitting ? 'জমা হচ্ছে' : 'প্রোফাইল জমা দিন'}
          </Button>
        </form>
        {uploadingField ? (
          <p className="mt-4 flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
            <ImageUp className="size-4 animate-pulse text-primary" />
            ছবি আপলোড হচ্ছে...
          </p>
        ) : null}
        {status ? <p className="mt-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}
      </div>
    </main>
  );
}
