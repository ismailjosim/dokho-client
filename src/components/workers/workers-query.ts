export const WORKERS_QUERY = /* GraphQL */ `
  query Workers($skill: String, $district: String, $limit: Int) {
    workers(skill: $skill, district: $district, limit: $limit) {
      id
      skill
      district
      upazila
      area
      profilePhotoUrl
      experienceYears
      availability
      user {
        name
        maskedPhone
      }
    }
  }
`;
