import { serviceOptions, type SelectOption } from '@/lib/location-options';
import { graphqlRequest } from '@/services/graphql/client';

const WORKER_SERVICES_QUERY = /* GraphQL */ `
  query WorkerServices {
    workerServices
  }
`;

export function createServiceOption(value: string): SelectOption | null {
  const service = value.trim();

  if (service.length < 2) return null;

  return {
    value: service,
    label: service,
  };
}

export function mergeServiceOptions(...optionGroups: SelectOption[][]) {
  const uniqueOptions = new Map<string, SelectOption>();

  optionGroups.flat().forEach((option) => {
    const value = option.value.trim();

    if (!value || uniqueOptions.has(value)) return;

    uniqueOptions.set(value, {
      ...option,
      value,
      label: option.label.trim() || value,
    });
  });

  return Array.from(uniqueOptions.values()).sort((first, second) =>
    first.value.localeCompare(second.value, 'bn')
  );
}

export async function getWorkerServiceOptions() {
  try {
    const result = await graphqlRequest<{ workerServices: string[] }>(WORKER_SERVICES_QUERY);
    const databaseOptions = result.workerServices
      .map((service) => createServiceOption(service))
      .filter((option): option is SelectOption => Boolean(option));

    return mergeServiceOptions(serviceOptions, databaseOptions);
  } catch {
    return serviceOptions;
  }
}
